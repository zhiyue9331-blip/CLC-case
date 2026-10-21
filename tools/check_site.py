"""Static site checks; --require-downloads is the final publication gate."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
from urllib.parse import urlsplit, unquote
from urllib.request import Request, urlopen
import argparse
import json
import re
import xml.etree.ElementTree as ET

def check_site(root, require_downloads=False, remote=False):
    errors = []
    checks = []
    def check(condition, message):
        checks.append({'ok': bool(condition), 'message': message})
        if not condition:
            errors.append(message)
    class Page(HTMLParser):
        def __init__(self):
            super().__init__()
            self.assets, self.links, self.ids = [], [], []
            self.h1 = 0
        def handle_starttag(self, tag, attrs):
            a = dict(attrs)
            if 'id' in a:
                self.ids.append(a['id'])
            if tag == 'h1':
                self.h1 += 1
            if tag == 'img':
                check('alt' in a, 'image alt on ' + name)
            if tag in ['script', 'img'] and a.get('src'):
                self.assets.append(a['src'])
            if tag == 'link' and a.get('rel') in ['stylesheet', 'icon', 'preload']:
                self.assets.append(a['href'])
            if tag == 'a' and a.get('href'):
                self.links.append(a['href'])
    def local_path(url):
        path = unquote(urlsplit(url).path)
        if path.startswith('/CLC-case/'):
            path = path.removeprefix('/CLC-case/')
        elif path.startswith('/'):
            check(False, 'root-relative path escapes GitHub project: ' + url)
        return root / (path or 'index.html')
    for name in ['index.html', 'versions.html', 'log.html', '404.html']:
        source = (root / name).read_text(encoding='utf-8')
        parser = Page()
        parser.feed(source)
        check(parser.h1 == 1, name + ' has one H1')
        check(not [x for x,n in Counter(parser.ids).items() if n>1], name + ' IDs unique')
        check('lang="zh-CN"' in source, name + ' language declared')
        for asset in parser.assets:
            check(local_path(asset).is_file(), name + ' asset: ' + asset)
        for link in parser.links:
            parts = urlsplit(link)
            if parts.scheme or parts.netloc:
                continue
            if parts.path:
                check(local_path(link).is_file(), name + ' link: ' + link)
            elif parts.fragment:
                check(parts.fragment in parser.ids, name + ' anchor: ' + link)
    for asset in set(re.findall(r"url\(['\"]?([^'\")]+)", (root / 'site.css').read_text(encoding='utf-8'))):
        check(local_path(asset).is_file(), 'CSS asset: ' + asset)
    for path in (root / 'assets' / 'patterns').glob('*.svg'):
        ET.parse(path)
        check(True, 'SVG parses: ' + path.name)
    for path in root.rglob('*'):
        if not path.is_file():
            continue
        if '.git' in path.relative_to(root).parts:
            continue
        check(path.suffix.lower() not in ['.exe','.asar','.env','.pyc','.zip'], 'no private/build binary: ' + path.relative_to(root).as_posix())
        if path.suffix in ['.html','.json','.js','.css','.md','.txt','.xml']:
            text = path.read_text(encoding='utf-8')
            check(not re.search(r'[A-Za-z]:[\\/]Users[\\/]|127\.0\.0\.1|localhost:|sourcePackage|sourceAsar', text), 'no local paths: ' + path.relative_to(root).as_posix())
    data = json.loads((root / 'releases.json').read_text(encoding='utf-8'))
    check(len(data['installers']) == 19, '19 archived packages represented')
    shots = set()
    pending = []
    for release in data['installers']:
        check(bool(re.fullmatch(r'[0-9a-f]{64}', release['sha256'])), release['id'] + ' checksum supplied')
        for shot in release['screenshots']:
            check(set(shot) <= {'src','caption','provenance'}, 'public screenshot fields only')
            check((root / shot['src']).is_file(), 'historical screenshot: ' + shot['src'])
            shots.add(shot['src'])
        url = release.get('downloadUrl')
        if not url:
            pending.append(release['id'])
            check(release.get('publicationStatus') == 'pending', 'unpublished archive honestly marked: ' + release['id'])
            continue
        check(url.startswith('https://github.com/shuwgc/CLC-case/releases/download/'), 'download belongs to target repository')
        if remote:
            try:
                with urlopen(Request(url, method='HEAD', headers={'User-Agent':'CLC-Publication-Check'}), timeout=45) as response:
                    check(response.status == 200 and int(response.headers.get('Content-Length','0')) == release['bytes'], 'public download status and length: ' + release['id'])
            except Exception as error:
                check(False, 'public download failed: ' + release['id'] + ' / ' + type(error).__name__)
    check(len(shots) == 31, '31 distinct historical screenshots')
    if require_downloads:
        check(not pending, 'all release packages uploaded before publication')
    return {'checks': len(checks), 'errors': errors, 'pendingInstallers': pending, 'publicationReady': not pending and not errors, 'details': checks}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--require-downloads', action='store_true')
    parser.add_argument('--remote', action='store_true')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    result = check_site(args.root.resolve(), args.require_downloads, args.remote)
    if args.report:
        args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k!='details'}, ensure_ascii=False))
    raise SystemExit(1 if result['errors'] else 0)
