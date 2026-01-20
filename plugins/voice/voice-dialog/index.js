// 全局变量存储token
let authToken = '';
let userInfo = {};

// 向父窗口请求token
function requestToken() {
    return new Promise((resolve) => {
        // 监听父窗口的响应
        const handler = (e) => {
            if (e.data?.source === 'tinymce-voice-parent' && e.data.type === 'token-response') {
                authToken = e.data.token || '';
                window.removeEventListener('message', handler);
                resolve(authToken);
            }
        };
        
        window.addEventListener('message', handler);
        
        // 发送token请求
        window.parent.postMessage(
            {
                source: 'tinymce-voice',
                type: 'request-token'
            },
            '*'
        );
        
        // 超时处理
        setTimeout(() => {
            window.removeEventListener('message', handler);
            resolve('');
        }, 2000);
    });
}

// 模式切换
function toggleMode(mode) {
    const contentUpload = document.getElementById('content-upload');
    const contentLink = document.getElementById('content-link');
    const labelUpload = document.getElementById('label-upload');
    const labelLink = document.getElementById('label-link');

    if (mode === 'upload') {
        contentUpload.classList.remove('hidden');
        contentLink.classList.add('hidden');
        labelUpload.classList.add('radio-active');
        labelLink.classList.remove('radio-active');
    } else {
        contentUpload.classList.add('hidden');
        contentLink.classList.remove('hidden');
        labelLink.classList.add('radio-active');
        labelUpload.classList.remove('radio-active');
    }
}

// 处理文件上传
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    uploadFile(file);
}

// 上传文件的通用方法
function uploadFile(file) {
    // 检查文件类型
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/x-m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|aac|ogg|m4a)$/i)) {
        alert('请上传有效的音频文件（MP3, WAV, AAC, OGG, M4A）');
        return;
    }

    // 检查文件大小（20MB限制）
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('文件大小不能超过 20MB');
        return;
    }

    const status = document.getElementById('upload-status');
    const progressBar = document.getElementById('progress-bar');
    const percentDisplay = document.getElementById('percent-display');
    const filenameDisplay = document.getElementById('filename-display');
    const resultZone = document.getElementById('upload-result');
    const urlInput = document.getElementById('uploaded-url');

    // 初始化显示
    status.classList.remove('hidden');
    resultZone.classList.add('hidden');
    filenameDisplay.textContent = file.name;

    // 获取上传接口地址（可以从全局变量或URL参数获取）
    const uploadUrl = 'https://cms.jx3box.com/api/cms/upload/voice?folder=jx3cxk';

    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);

    // 使用XMLHttpRequest上传（支持进度监听）
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
            percentDisplay.textContent = percent + '%';
        }
    });

    // 监听上传完成
    xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                // 根据你的接口响应格式调整，这里假设返回 {url: '...'} 或 {data: {url: '...'}}
                const audioUrl = response.url || response.data?.url || response.data;
                
                if (audioUrl) {
                    status.classList.add('hidden');
                    resultZone.classList.remove('hidden');
                    urlInput.value = audioUrl;
                    
                    // 自动填充文件名到name字段（去除扩展名）
                    const nameInput = document.getElementById('audio-name-upload');
                    if (!nameInput.value.trim()) {
                        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 去除扩展名
                        nameInput.value = fileName;
                    }
                } else {
                    throw new Error('服务器未返回有效的URL');
                }
            } catch (error) {
                status.classList.add('hidden');
            }
        } else {
            status.classList.add('hidden');
            alert(`上传失败: ${xhr.status} ${xhr.statusText}`);
        }
    });

    // 监听上传错误
    xhr.addEventListener('error', () => {
        status.classList.add('hidden');
        alert('上传失败，请检查网络连接');
    });

    // 监听上传取消
    xhr.addEventListener('abort', () => {
        status.classList.add('hidden');
        alert('上传已取消');
    });

    // 开始上传
    xhr.open('POST', uploadUrl);
    
    // 设置token到请求头
    if (authToken) {
        const auth = btoa(`${authToken}:cms common request`);
        xhr.setRequestHeader('Authorization', `Basic ${auth}`);
    } else {
        console.warn('警告：未找到token，将发送未授权的请求');
    }

    xhr.send(formData);
}

// 复制URL
function copyUrl(id) {
    const input = document.getElementById(id);
    input.select();
    input.setSelectionRange(0, 99999); // 移动端兼容
    
    try {
        document.execCommand('copy');
        const btn = event.currentTarget;
        const originalIcon = btn.innerHTML;
        
        // 显示成功图标
        btn.innerHTML = `<svg class="icon-copy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`;
        btn.style.color = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalIcon;
            btn.style.color = '#2563eb';
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
    }
}

// 获取当前音频URL
function getAudioUrl() {
    const mode = document.querySelector('input[name="source-type"]:checked').value;
    
    if (mode === 'upload') {
        return document.getElementById('uploaded-url').value;
    } else {
        return document.getElementById('audio-link-input').value;
    }
}

// 初始化拖拽上传
function initDragUpload() {
    const dropZone = document.getElementById('drop-zone');
    
    // 阻止浏览器默认行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // 高亮效果
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.borderColor = '#3b82f6';
            dropZone.style.backgroundColor = '#eff6ff';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.borderColor = '#d1d5db';
            dropZone.style.backgroundColor = '#f9fafb';
        }, false);
    });
    
    // 处理拖放的文件
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    }, false);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 获取个人信息
function fetchUserInfo() {
    const url = 'https://cms.jx3box.com/api/cms/user/my/info';

    return fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Basic ${btoa(`${authToken}:cms common request`)}` : ''
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.data) {
            userInfo = data.data;
        } else {
            console.warn('获取用户信息失败，响应格式异常');
        }
    })
    .catch(error => {
        console.error('获取用户信息失败:', error);
    });
}

function init() {
    toggleMode('upload');
    initDragUpload();
    
    // 请求token
    requestToken().then(() => {
        // 获取用户信息
        fetchUserInfo();
    });
    
    // 插入按钮
    document.getElementById('insert').onclick = () => {
        // 获取当前模式
        const mode = document.querySelector('input[name="source-type"]:checked').value;
        
        // 清除之前的错误提示
        const errorSuffix = mode === 'upload' ? '-upload' : '-link';
        document.getElementById(`name-error${errorSuffix}`).classList.add('hidden');
        document.getElementById(`audio-name${errorSuffix}`).classList.remove('error');
        
        const url = getAudioUrl();
        
        if (!url) {
            if (mode === 'upload') {
                alert('请先上传音频文件');
            } else {
                alert('请输入音频链接');
            }
            return;
        }
        
        // 验证URL格式
        if (!url.match(/^https?:\/\/.+/)) {
            alert('请输入有效的URL地址');
            return;
        }
        
        // 获取user_id（从global变量或localStorage）
        const userId = userInfo.ID || '';
        const author = userInfo.display_name || '';
        
        // 根据模式获取对应的name字段
        const name = mode === 'upload' 
            ? document.getElementById('audio-name-upload').value.trim()
            : document.getElementById('audio-name-link').value.trim();
        
        // 验证必填字段
        if (!name) {
            document.getElementById(`name-error${errorSuffix}`).classList.remove('hidden');
            document.getElementById(`audio-name${errorSuffix}`).classList.add('error');
            return;
        }
        
        // 发送消息给父窗口
        window.parent.postMessage(
            {
                source: 'tinymce-voice',
                type: 'insert',
                payload: { 
                    name: name || '',
                    author: author || '',
                    user_id: userId,
                    src: url
                }
            },
            '*'
        );
    };
    
    // 取消按钮
    document.getElementById('cancel').onclick = () => {
        window.parent.postMessage(
            {
                source: 'tinymce-voice',
                type: 'close'
            },
            '*'
        );
    };
}