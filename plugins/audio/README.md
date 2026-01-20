# TinyMCE Voice Plugin

TinyMCE 音频插件，支持本地上传和外部链接两种方式插入音频。

## 功能特性

- 🎵 **本地上传**：支持拖拽或点击上传音频文件
- 🔗 **外部链接**：支持通过外链地址插入音频
- 📝 **元数据管理**：自动填充文件名，获取用户信息
- 🔐 **Token 认证**：支持 Basic Auth 认证上传
- 📊 **上传进度**：实时显示上传进度
- ✅ **表单验证**：友好的错误提示机制

## 支持格式

- MP3
- WAV
- AAC
- OGG
- M4A

**文件大小限制：** 最大 20MB

## 安装使用

### 1. 引入插件

```javascript
tinymce.init({
    selector: 'textarea',
    plugins: 'voice',
    toolbar: 'voice',
    // 设置根路径（可选）
    external_plugins: {
        voice: '/path/to/plugins/voice/plugin.min.js'
    }
});
```

### 2. 配置全局变量

```javascript
// Token 配置（用于上传认证）
window.RX_TINYMCE_ROOT = '/path/to/tinymce';
localStorage.setItem('token', 'your-auth-token');
```

### 3. 使用图标

在 `icons/custom/icons.js` 中添加自定义 voice 图标。

## 输出格式

插件会生成以下格式的内容：

```html
<pre class="w-audio e-audio">
name:音频名称;author:作者名称;user_id:用户ID;src:音频URL
</pre>
```

### 字段说明

| 字段 | 说明 | 必填 |
|------|------|------|
| `name` | 音频名称（上传时自动填充文件名） | 是 |
| `author` | 作者名称（自动从用户信息获取） | 否 |
| `user_id` | 用户ID（自动从用户信息获取） | 否 |
| `avatar` | 用户头像（自动从用户信息获取） | 否 |
| `src` | 音频文件URL | 是 |

## API 接口

### 上传接口

**地址：** `https://cms.jx3box.com/api/cms/upload/voice?folder=jx3cxk`

**方法：** POST

**认证：** Basic Auth

**请求头：**
```
Authorization: Basic base64(token + ':cms common request')
```

**请求体：** FormData
```
file: [音频文件]
```

**响应示例：**
```json
{
  "url": "https://example.com/audio.mp3"
}
```

### 用户信息接口

**地址：** `https://cms.jx3box.com/api/cms/user/my/info`

**方法：** GET

**认证：** Basic Auth

**响应示例：**
```json
{
  "data": {
    "ID": 123,
    "display_name": "用户名"
  }
}
```

## 消息通信

插件使用 `postMessage` 进行 iframe 通信：

### 请求 Token

```javascript
// 对话框 → 父窗口
{
  source: 'tinymce-voice',
  type: 'request-token'
}

// 父窗口 → 对话框
{
  source: 'tinymce-voice-parent',
  type: 'token-response',
  token: 'your-token'
}
```

### 插入音频

```javascript
{
  source: 'tinymce-voice',
  type: 'insert',
  payload: {
    name: '音频名称',
    author: '作者名称',
    user_id: 123,
    src: 'https://example.com/audio.mp3'
  }
}
```

### 关闭对话框

```javascript
{
  source: 'tinymce-voice',
  type: 'close'
}
```

## 文件结构

```
voice/
├── plugin.min.js          # 插件主文件
├── index.js               # 插件源码（开发用）
├── README.md              # 说明文档
└── voice-dialog/          # 对话框界面
    ├── index.html         # 对话框HTML
    ├── index.css          # 对话框样式
    └── index.js           # 对话框逻辑
```

## 开发说明

### 本地上传流程

1. 用户选择或拖拽文件
2. 验证文件类型和大小
3. 显示上传进度
4. 上传成功后自动填充文件名
5. 用户可编辑名称（必填）
6. 点击插入按钮提交

### 外部链接流程

1. 用户输入音频链接
2. 用户输入音频名称（必填）
3. 点击插入按钮提交

### 样式说明

对话框按钮样式完全匹配 TinyMCE Oxide 主题：
- 主按钮（插入）：蓝色主题 `#207ab7`
- 次要按钮（取消）：灰色主题 `#f0f0f0`
- 包含 hover、focus、active、disabled 状态

## 许可证

Copyright © 2026 JX3BOX

## 相关链接

- [JX3BOX](https://github.com/JX3BOX)
- [TinyMCE 文档](https://www.tiny.cloud/docs/)
