# TinyMCE

## 引用

```html
https://oss.jx3box.com/static/tinymce/tinymce.min.js https://oss.jx3box.com/static/jx3box-editor/css/article.css
```

## 构建

如使用 oss 域名，需手动更新 cdn
npm run build 更新 css

## 特性

-   基于 tinymce v5.2.2 扩展
-   保留 v4 版本分割线规则
-   内置 powerpaste&&checklist 插件
-   增加插入 B 站视频插件
-   增加插入折叠文本插件
-   增加 mathjax 支持 latex - 2020/06/05

## 插件添加步骤

1. icons/custom/icons.js 添加 svg 图标,需设置尺寸,注意视口大小,移除换行符等
2. plugins 目录，复制 videox(input),foldtext(null)目录作为参考新建插件目录，替换 videox 为新插件名
3. 更新 cdn：https://cdn.jx3box.com/static/tinymce/tinymce.min.js
4. 编辑器配置中激活插件和添加工具栏项

## 更新样式

```
npm run update
npm run build
CDN https://oss.jx3box.com/static/tinymce/skins/content/default/content.min.css
```
