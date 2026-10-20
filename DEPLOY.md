# 合并与发布检查

本分支将原单文件案例网站改成项目组成果发布站。静态网页可以独立预览；Windows安装包通过GitHub Releases分发。

## 当前状态

- 网页、字体、四组矢量背景、三组案例照片、八项程序快照均已准备。
- releases.json保留12个版本的19个现存安装包及31张历史快照。
- 当前19个安装包尚未公开上传。downloadUrl为null，界面明确显示待上传，没有虚构下载地址。
- 本地已有归档包与校验值；安装器不进入Git仓库。

## 本地审阅

```shell
python tools/check_site.py
python tools/serve_site.py --root . --port 8891
```

浏览器访问终端打印的/CLC-case/路径，以核对GitHub项目站子目录下的相对资源、导航和版本清单。

## 上线前必须完成

1. 使用对shuwgc/CLC-case有写权限的GitHub账号登录。本分支不包含密码、令牌或本机凭据。
2. 在维护者电脑运行以下命令，inventory指向本机版本清单，报告写在仓库之外：

```shell
python tools/publish_installers.py --inventory /path/to/versions-inventory.json --site . --report ../published-assets.json
```

工具读取既有EXE，按记录的字节数与SHA-256验证后上传归档附件。它保留不同构建，不替换已存在且内容不同的附件；GitHub返回的校验值、公开下载状态和长度均需通过，当前包还完整下载复核。工具不运行安装器，也不上传本机路径或论文文件。

3. 审阅工具更新的releases.json和首页下载入口，再运行严格检查：

```shell
python tools/check_site.py --require-downloads --remote
```

**严格检查通过后再合并/推送主分支并发布。**当前直接运行严格检查会因为19个附件待上传而失败，这是预期的发布阻断，不是静态页面检查失败。

4. 确认仓库GitHub Pages的既有发布来源；本分支不修改账户权限、分支保护或Pages配置。部署完成后核对首页、versions.html、log.html、字体、背景、快照、各版本下载及手机导航。

## 回退

变更基于提交4947ecd6698ee76676ee33fa4d38dcf468e314f0。保留原仓库历史；必要时通过新的revert提交回退站点，不强推历史。安装包归档与网页可以独立管理。

## 核验边界

Website Auditor返回PRO_REQUIRED，未得到本站审计评分。现有验证来自真实文件、HTTP和浏览器检查；不将示例报告视为本站结果。未完成真实屏幕阅读器、跨浏览器或操作系统200%缩放测试。
