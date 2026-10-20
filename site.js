'use strict';
const featureData = {
  overview:{number:'01',label:'程序主页',subtitle:'案例与证据',title:'程序主页与案例浏览',description:'从主页进入47个试点案例，按批次、地区和特征筛选；再查看单案介绍、政策工具与相关资料。',points:['第一、二、三批典型案例','案例、政策与资料入口集中呈现'],boundary:'快照来自当前0.6.6程序。界面内的研究统计遵循相应数据版本，不能替代具体材料核验。',image:'assets/current-home.jpg',caption:'程序主页 · 导航、检索入口与案例库介绍'},
  policy:{number:'02',label:'政策工具',subtitle:'案例与证据',title:'查看政策工具的实施内容与依据',description:'以泖港镇为例，展开“农民集中居住与村庄布局优化政策”，查看实施内容、创新点、牵头单位与依据文件，并通过字母标签关联研究变量。',points:['工具分类与条目展开','实施内容、创新点、主体和政策依据'],boundary:'政策条目是项目整理内容；核对政策适用范围与效力时，应返回对应原文。',image:'assets/current-policy-tools.jpg',caption:'泖港镇 · 政策工具条目与依据文件'},
  sources:{number:'03',label:'资料溯源',subtitle:'案例与证据',title:'从材料提要回到原始出处',description:'逐条查看资料来源、发布日期、提要与已收录摘录；通过关联字母定位细则，通过原文入口核对报道内容。截图展示朱湖案例的来源条目。',points:['来源、日期、提要与原文入口','关联细则与全文摘录'],boundary:'提要、摘录和原始报道分开呈现。仅有元数据的条目不视为已收录完整正文。',image:'assets/current-source-trace.jpg',caption:'朱湖案例 · 来源日期、提要、摘录与原文入口'},
  domain:{number:'01',label:'域内全文检索',subtitle:'让收录资料可以被检索',title:'从关键词，直达材料与出处。',description:'在本库案例、政策工具及已收录来源文本中检索，借助命中片段、条件筛选和关联定位，减少来回翻找材料。',points:['关键词组合、仅正文与多维条件筛选','命中片段高亮，关联案例、工具与材料出处'],boundary:'仅覆盖已收录的可检索文本；只有元数据的条目不等同于完整正文。',image:'assets/current-domain-search.jpg',caption:'域内正文检索 · 真实本地命中与片段高亮'},
  corpus:{number:'02',label:'域外收录',subtitle:'把库外公开材料带入研究',title:'让域外材料，有出处、有时间。',description:'将维护端收录的政府公开资料组织成可检索快照，按主题、地区、内容类型和关联情况筛选，逐条查看来源与已提取正文。',points:['多个土地管理主题的外部资料快照','公开来源、收录范围与正文状态清楚区分'],boundary:'域外收录来自维护端发布的离线快照；内容覆盖范围不等于全网，也不等于自动核验。',image:'assets/current-external-corpus.jpg',caption:'域外离线收录 · 已发布快照与真实条目'},
  online:{number:'03',label:'域外在线检索域',subtitle:'连接已批准的政府公开来源',title:'从已批准来源，检索新的线索。',description:'在独立在线检索区域输入主题词，向已批准来源发起检索，并查看来源状态、相关标题与原始链接，为后续人工核验提供线索。',points:['按来源反馈检索状态，保留已取回结果','在线入口与本地快照分开，区分自动取回和跳转'],boundary:'在线条目需要联网且尚待人工核验，不会自动进入已发布快照。本图展示来源配置与输入状态，未伪造联网结果。',image:'assets/current-online-search.jpg',caption:'在线检索区域 · 已批准来源清单，尚未提交查询'},
  rules:{number:'04',label:'fsQCA细则色块',subtitle:'在色块之间看见差异与证据',title:'比较细则，也能回到评分依据。',description:'用五档色阶组织案例与细则，横向比较同一细则、纵向查看单案差异。色块是进入细则说明、原始评分与关联证据的入口。',points:['47案例 × 35细则热力矩阵，缺失与不适用另行标记','细则详情与来源、政策工具建立回溯关系'],boundary:'颜色表达编码档位和状态，不是政策优劣排名。截图保留当前软件状态，论文测量口径仍按研究复核流程完善。',image:'assets/current-fsqca-rules.jpg',caption:'细则热力矩阵 · 五档色阶与状态图例'},
  qca:{number:'05',label:'组态分析',subtitle:'用条件组合理解不同的实践路径',title:'比较条件组合，而不止单个因素。',description:'选择结果与条件，设置校准及筛选参数，查看真值表和组态解。在参数变化之间检查路径，结合案例证据理解结果。',points:['结果、条件与参数可配置，查看真值表和组态解','以可见参数记录分析过程，支持导出与回看'],boundary:'截图是交互分析界面，输出随数据与参数变化；历史必要性口径仍待纠正，不将当前数值作为论文结论。',image:'assets/current-configurations.jpg',caption:'组态分析交互 · 真值表与解项，非论文结论发布'}
};
Object.assign(featureData.domain,{number:'04',subtitle:'资料检索',title:'跨案例检索已收录文本'});
Object.assign(featureData.corpus,{number:'05',subtitle:'资料检索',title:'域外公开资料的离线收录'});
Object.assign(featureData.online,{number:'06',subtitle:'资料检索',title:'面向已批准来源的在线检索'});
Object.assign(featureData.rules,{number:'07',subtitle:'评分与分析',title:'47案例 × 35细则的色块比较'});
Object.assign(featureData.qca,{number:'08',subtitle:'评分与分析',title:'设置条件与参数，查看真值表和组态解'});
const menuButton=document.querySelector('.menu-toggle');
const siteNav=document.getElementById('site-nav');
function closeMenu(restoreFocus=false){if(!menuButton||!siteNav)return;menuButton.setAttribute('aria-expanded','false');siteNav.classList.remove('is-open');if(restoreFocus)menuButton.focus();}
if(menuButton&&siteNav){menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));siteNav.classList.toggle('is-open',open);});siteNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu()));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true')closeMenu(true);});document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});}
const dialog = document.querySelector('.image-dialog');
function showImage(src,title,caption){if(!dialog)return;dialog.querySelector('.dialog-img').src=src;dialog.querySelector('.dialog-img').alt=title;dialog.querySelector('#dialog-title').textContent=title;dialog.querySelector('.dialog-caption').textContent=caption||'';const original=dialog.querySelector('#dialog-original');if(original)original.href=src;dialog.showModal();}
if(dialog){dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>showImage(button.dataset.photo,button.dataset.title,button.dataset.caption)));
let activeFeature='overview';
function setFeature(key,focus=false){
  const data=featureData[key];if(!data)return;activeFeature=key;
  document.querySelectorAll('[data-feature]').forEach(button=>{const active=button.dataset.feature===key;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();});
  document.getElementById('feature-index').textContent=`${data.number} / ${data.subtitle}`;
  document.getElementById('feature-title').textContent=data.title;
  document.getElementById('feature-desc').textContent=data.description;
  const points=document.getElementById('feature-points');points.replaceChildren(...data.points.map(point=>{const li=document.createElement('li');li.textContent=point;return li;}));
  document.getElementById('feature-boundary').textContent=data.boundary;
  const shotTitle=document.getElementById('feature-shot-title');if(shotTitle)shotTitle.textContent=data.label;
  document.getElementById('feature-caption').textContent=data.caption+' · 点击放大';
  const picture=document.getElementById('feature-image');picture.src=data.image;picture.alt=`v0.6.6 ${data.label}真实程序快照`;
  document.querySelector('[data-current-image]').setAttribute('aria-label',`放大${data.label}截图`);
  const panel=document.getElementById('feature-panel');panel.setAttribute('aria-labelledby',`tab-${key}`);panel.classList.remove('changed');requestAnimationFrame(()=>panel.classList.add('changed'));
}
document.querySelectorAll('[data-feature]').forEach(button=>{
  button.addEventListener('click',()=>setFeature(button.dataset.feature));
  button.addEventListener('keydown',event=>{const keys=Object.keys(featureData),index=keys.indexOf(button.dataset.feature);let target=null;if(event.key==='ArrowRight'||event.key==='ArrowDown')target=keys[(index+1)%keys.length];if(event.key==='ArrowLeft'||event.key==='ArrowUp')target=keys[(index+keys.length-1)%keys.length];if(event.key==='Home')target=keys[0];if(event.key==='End')target=keys[keys.length-1];if(target){event.preventDefault();setFeature(target,true);}});
});
document.querySelector('[data-current-image]')?.addEventListener('click',()=>{const data=featureData[activeFeature];showImage(data.image,`v0.6.6 · ${data.label}`,data.caption+'。'+data.boundary);});
const groupsTitle={'0.6.6':'E99来源复查与原因展示','0.6.5':'分析展示与材料关联，保留同号修订','0.6.3':'统一深色配色与导航，改善分析界面','0.6.2':'在线检索可靠性与来源修复','0.6.1':'组态分析与真值表','0.6.0':'细则评分、热力矩阵与证据反查','0.5.5':'检索翻页、查询扩展与来源覆盖','0.5.3':'域外语料与在线来源扩展','0.4.0':'本地全文检索第一档','1.0.0':'首次桌面程序打包','1.0.1':'加入案例政策工具页面','1.1':'地方特色背景与案例视觉'};
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
let loadedReleases=[];let loadedMissing=[];let versionFilter='all';
function renderReleases(){
  const target=document.getElementById('releases');if(!target)return;target.replaceChildren();
  const grouped=new Map();for(const release of loadedReleases){if(versionFilter==='legacy'&&!release.legacy)continue;if(versionFilter!=='all'&&versionFilter!=='legacy'&&!release.version.startsWith(versionFilter))continue;if(!grouped.has(release.version))grouped.set(release.version,[]);grouped.get(release.version).push(release);}
  const versions=[...grouped.keys()].sort((a,b)=>Number(Boolean(grouped.get(a)[0].legacy))-Number(Boolean(grouped.get(b)[0].legacy))||b.localeCompare(a,undefined,{numeric:true}));
  for(const version of versions){const builds=grouped.get(version);const entry=element('article','release-entry');entry.id='v'+version.replaceAll('.','-');
    const head=element('header');head.append(element('div','release-v',(builds[0].legacy?'早期 v':'v')+version),element('div','release-date',builds[0].date||'历史归档'));if(version==='0.6.6')head.append(element('span','release-badge','当前版本'));else if(builds.length>1)head.append(element('span','release-badge',builds.length+' 个归档构建'));
    const body=element('div');body.append(element('h2','',groupsTitle[version]||'版本更新'),element('p','summary',builds.length===1?builds[0].summary:`此版本保留 ${builds.length} 个归档构建，主要改动与具体界面分别记录。`));const list=element('div','build-list');
    for(const build of builds){const row=element('div','build-row');const info=element('div');info.append(element('span','',build.label),element('span','build-size',`${(build.bytes/1024/1024).toFixed(1)} MiB · Windows x64`));if(builds.length>1)info.append(element('span','build-desc',build.summary));const ready=Boolean(build.downloadUrl);const download=element(ready?'a':'span',ready?(version==='0.6.6'?'current-download':''):'download-pending',ready?'下载安装包 ↓':'安装包待上传');if(ready)download.href=build.downloadUrl;else download.setAttribute('aria-disabled','true');download.setAttribute('aria-label',ready?`下载v${build.version} ${build.label}`:`v${build.version} ${build.label}安装包待上传`);row.append(info,download);list.append(row);}
    body.append(list);if(builds.length>1)body.append(element('p','builds-note','同号构建分别保留。未留存逐构建说明时，不推定具体改动或推荐顺序。'));
    const shots=[];const seen=new Set();for(const build of builds){for(const shot of build.screenshots||[]){if(seen.has(shot.src))continue;seen.add(shot.src);shots.push({...shot,buildLabel:build.label});}}
    if(shots.length){const gallery=element('div','history-shots');for(const shot of shots){const button=element('button','history-shot');button.type='button';const caption=`${shot.buildLabel} · ${shot.caption||'改动处快照'}`;const img=element('img');img.src=shot.src;img.alt=`v${version} ${caption}`;img.loading='lazy';button.append(img,element('span','',caption+' ↗'));button.setAttribute('aria-label','放大'+img.alt);button.addEventListener('click',()=>showImage(shot.src,`v${version} · ${caption}`,shot.provenance||'由对应历史包只读渲染，保留当时界面与口径。'));gallery.append(button);}body.append(gallery);}else{body.append(element('p','no-shot','该构建历史截图尚待核验，不以现版界面替代。'));}
    entry.append(head,body);target.append(entry);
  }
  if(!versions.length)target.append(element('p','skeleton','此系列暂无可下载安装包。'));
  const count=document.getElementById('release-count');if(count)count.textContent=`${versions.length} 个版本 · ${[...grouped.values()].flat().length} 个归档安装包 · 按确切版本查看主要改动与快照`;
  const missing=document.getElementById('missing-versions');missing.replaceChildren();const items=loadedMissing.filter(item=>versionFilter==='all'||(versionFilter==='legacy'?Boolean(item.legacy)||item.version.startsWith('早期'):item.version.startsWith(versionFilter)));if(items.length){missing.append(element('h2','', '归档缺口与规划记录'));for(const item of items){const row=element('div','missing-entry');row.append(element('b','',item.version.startsWith('早期')?item.version:'v'+item.version),element('span','',item.status));missing.append(row);}}
  if(location.hash){const anchor=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(anchor)requestAnimationFrame(()=>anchor.scrollIntoView({block:'start'}));}
}
function renderRecentReleases(){
  const target=document.getElementById('recent-releases');if(!target)return;target.replaceChildren();
  for(const id of ['v066','v065-reviewed','v063-b']){
    const release=loadedReleases.find(item=>item.id===id);if(!release)continue;
    const row=element('article','recent-release');
    const label=element('div','recent-version','v'+release.version);label.append(element('small','',release.version==='0.6.6'?'当前版本':'历史版本'));
    const title=element('div','recent-title',groupsTitle[release.version]||release.summary);
    const actions=element('div','recent-actions');
    const ready=Boolean(release.downloadUrl);const download=element(ready?'a':'span',ready?'':'download-pending',ready?'下载 ↓':'安装包待上传');if(ready)download.href=release.downloadUrl;else download.setAttribute('aria-disabled','true');download.setAttribute('aria-label',(ready?'下载v':'待上传v')+release.version+' '+release.label);
    const details=element('a','','主要改动');details.href='versions.html#v'+release.version.replaceAll('.','-');
    actions.append(download,details);
    const shot=release.screenshots?.[0];if(shot){const preview=element('button','','查看快照 ↗');preview.type='button';preview.setAttribute('aria-label','查看v'+release.version+'历史快照');preview.addEventListener('click',()=>showImage(shot.src,'v'+release.version+' · '+release.label+' · '+shot.caption,shot.provenance||''));actions.append(preview);}
    row.append(label,title,actions);target.append(row);
  }
}
async function loadReleaseData(){const response=await fetch('./releases.json',{cache:'no-store'});if(!response.ok)throw new Error('版本清单暂不可用');const data=await response.json();loadedReleases=data.installers;loadedMissing=data.missingInstallers||[];if(document.body.dataset.page==='versions')renderReleases();renderRecentReleases();const current=loadedReleases.find(item=>item.id==='v066');if(current&&document.getElementById('current-package-meta'))document.getElementById('current-package-meta').textContent=`${current.date} · Windows x64 · ${(current.bytes/1024/1024).toFixed(1)} MiB`;}
function showReleaseError(){for(const id of ['releases','recent-releases']){const target=document.getElementById(id);if(!target)continue;const message=element('p','history-load-error','版本清单暂时读取失败，请重试。');const retry=element('button','retry-button','重新读取版本');retry.type='button';retry.addEventListener('click',()=>{target.replaceChildren(element('p','skeleton','正在读取版本归档…'));loadReleaseData().catch(showReleaseError);});target.replaceChildren(message,retry);}}
if(document.body.dataset.page==='home'||document.body.dataset.page==='versions')loadReleaseData().catch(showReleaseError);
document.querySelectorAll('[data-version-filter]').forEach(button=>button.addEventListener('click',()=>{versionFilter=button.dataset.versionFilter;document.querySelectorAll('[data-version-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));renderReleases();}));
