"""Publish exact archived installers; never commit binaries or expose local paths.

Requires repository write access. Credentials stay in the environment/helper.
Run only when ready to publish the binary archives to the target repository.
"""
import argparse
import hashlib
import http.client
import json
import os
from pathlib import Path
import shutil
import subprocess
import time
from urllib.error import HTTPError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

REPO = 'shuwgc/CLC-case'
API = 'https://api.github.com/repos/' + REPO

def get_token():
    token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')
    if token:
        return token
    git = os.environ.get('GIT_EXECUTABLE') or shutil.which('git')
    if not git:
        raise RuntimeError('Git unavailable. Set GIT_EXECUTABLE or use an authenticated terminal.')
    env = dict(os.environ, GIT_TERMINAL_PROMPT='0', GCM_INTERACTIVE='Never')
    result = subprocess.run([git, 'credential', 'fill'], input='protocol=https\nhost=github.com\npath=' + REPO + '.git\n\n', text=True, capture_output=True, env=env, timeout=25)
    values = dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
    if result.returncode or not values.get('password'):
        raise RuntimeError('No GitHub publishing credential. Sign in using an account with target repository write permission.')
    return values['password']

def request(path, token, method='GET', payload=None):
    url = path if path.startswith('https://') else API + path
    assert urlsplit(url).hostname == 'api.github.com'
    headers = {'Authorization':'Bearer ' + token, 'User-Agent':'CLC-Publication', 'Accept':'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28'}
    data = None
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    with urlopen(Request(url, headers=headers, method=method, data=data), timeout=60) as response:
        raw = response.read()
        return json.loads(raw) if raw else None

def checksum(path):
    digest = hashlib.sha256()
    with path.open('rb') as file:
        while data := file.read(1024*1024):
            digest.update(data)
    return digest.hexdigest()

def upload(release, item, token):
    parsed = urlsplit(release['upload_url'].split('{')[0])
    assert parsed.hostname == 'uploads.github.com'
    connection = http.client.HTTPSConnection(parsed.hostname, timeout=300)
    path = parsed.path + '?name=' + quote(item['asset'])
    headers = {'Authorization':'Bearer ' + token, 'User-Agent':'CLC-Publication', 'Content-Type':'application/octet-stream', 'Content-Length':str(item['bytes']), 'Accept':'application/vnd.github+json'}
    try:
        with item['file'].open('rb') as file:
            connection.request('POST', path, body=file, headers=headers)
            response = connection.getresponse()
            data = response.read()
            if response.status != 201:
                raise RuntimeError('Asset upload failed with HTTP ' + str(response.status) + ': ' + item['id'])
            return json.loads(data)
    finally:
        connection.close()

def verify_public(asset, item):
    url = asset['browser_download_url']
    assert url.startswith('https://github.com/' + REPO + '/releases/download/')
    assert asset['size'] == item['bytes']
    digest = asset.get('digest')
    if digest and digest != 'sha256:' + item['sha256']:
        raise RuntimeError('Remote checksum differs: ' + item['id'])
    for attempt in range(4):
        try:
            with urlopen(Request(url, method='HEAD', headers={'User-Agent':'CLC-Publication'}), timeout=60) as response:
                length = response.headers.get('Content-Length')
                assert response.status == 200 and (not length or int(length) == item['bytes'])
            break
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    # The current installer is read end to end; other assets use GitHub's SHA-256.
    if item['id'] == 'v066' or not digest:
        actual = hashlib.sha256()
        with urlopen(Request(url, headers={'User-Agent':'CLC-Publication'}), timeout=180) as response:
            while chunk := response.read(1024*1024):
                actual.update(chunk)
        assert actual.hexdigest() == item['sha256'], 'Public download checksum differs'
    return {'url':url, 'bytes':item['bytes'], 'sha256':item['sha256'], 'verified':True}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--inventory', required=True, type=Path)
    parser.add_argument('--site', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    inventory = json.loads(args.inventory.read_text(encoding='utf-8-sig'))
    site = args.site.resolve()
    public = json.loads((site / 'releases.json').read_text(encoding='utf-8'))
    by_id = {item['id']:item for item in public['installers']}
    groups = {}
    for original in inventory['installers']:
        if original['id'] not in by_id:
            continue
        item = dict(original)
        item['file'] = Path(item['path'])
        if not item['file'].is_absolute():
            item['file'] = Path(inventory['root']) / item['file']
        assert item['file'].suffix.lower() == '.exe' and item['file'].stat().st_size == item['bytes']
        item['sha256'] = checksum(item['file'])
        assert item['sha256'] == by_id[item['id']]['sha256'], 'Local installer no longer matches reviewed manifest'
        item['asset'] = 'CLC-' + item['id'] + '-x64.exe'
        item['tag'] = ('legacy-v' if item.get('legacy') else 'app-v') + item['version']
        groups.setdefault(item['tag'], []).append(item)
    assert sum(map(len,groups.values())) == len(by_id), 'Local archive is incomplete'
    token = get_token()
    repo = request(API, token)
    if not repo.get('permissions', {}).get('push'):
        raise RuntimeError('Authenticated account lacks repository write permission.')
    report = {}
    for tag, items in sorted(groups.items(), key=lambda pair: pair[0] == 'app-v0.6.6'):
        try:
            release = request('/releases/tags/' + tag, token)
        except HTTPError as error:
            if error.code != 404:
                raise
            body = '现存 Windows x64 安装包归档。保留各构建的主要改动与校验值。\n\n此标签用于安装包分发，仓库自动生成的源码压缩包仅对应发布站，不代表原程序源码。\n\n'
            for item in items:
                body += f"### {item['label']}\n{item['summary']}\n\n原记录日期：{item.get('date') or '历史归档'}\n\n附件：`{item['asset']}` · {item['bytes']} bytes\n\nSHA-256：`{item['sha256']}`\n\n"
            release = request('/releases', token, 'POST', {'tag_name':tag, 'target_commitish':repo['default_branch'], 'name':'案例库 v' + items[0]['version'] + ' · 安装包归档', 'body':body, 'draft':True, 'prerelease':False})
        assets = {asset['name']:asset for asset in release.get('assets', [])}
        for item in items:
            print('Preparing ' + item['id'], flush=True)
            asset = assets.get(item['asset'])
            if asset:
                assert asset['size'] == item['bytes'], 'Existing asset differs; preserved without replacement'
                if asset.get('digest'):
                    assert asset['digest'] == 'sha256:' + item['sha256'], 'Existing asset checksum differs; preserved'
            else:
                asset = upload(release, item, token)
                assets[item['asset']] = asset
        if release['draft']:
            release = request('/releases/' + str(release['id']), token, 'PATCH', {'draft':False, 'make_latest':'true' if tag == 'app-v0.6.6' else 'false'})
        for item in items:
            report[item['id']] = verify_public(assets[item['asset']], item)
            args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    for item in public['installers']:
        item['downloadUrl'] = report[item['id']]['url']
        item['publicationStatus'] = 'published'
    current_url = report['v066']['url']
    for filename in ['index.html','versions.html','log.html']:
        path = site / filename
        text = path.read_text(encoding='utf-8')
        text = text.replace('href="versions.html#v0-6-6">程序版本 ↗', 'href="' + current_url + '">下载程序 ↗')
        text = text.replace('href="versions.html#v0-6-6">查看安装包发布状态 <span', 'href="' + current_url + '">下载 Windows 安装包 <span')
        text = text.replace('<p class="publication-status">当前安装包尚未公开上传；上传并核验后启用下载。</p>', '')
        path.write_text(text, encoding='utf-8')
    (site / 'releases.json').write_text(json.dumps(public, ensure_ascii=False, indent=2), encoding='utf-8')
    print('All ' + str(len(report)) + ' public installer downloads verified. Review and commit the updated static manifest before deploying.')

if __name__ == '__main__':
    main()
