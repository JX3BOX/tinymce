/**
 * KaTeX 独立渲染器 - 浏览器版本
 * 依赖: KaTeX (通过 CDN 或本地引入)
 */
(function(window) {
    'use strict';

    // 检查 KaTeX 是否已加载
    if (typeof katex === 'undefined') {
        console.error('KaTeX 未加载，请先引入 KaTeX 库');
        return;
    }

    /**
     * 渲染 LaTeX 到指定元素
     * @param {HTMLElement} element - 目标元素
     * @param {string} latex - LaTeX 代码
     * @param {Object} options - 渲染选项
     * @returns {boolean} 是否渲染成功
     */
    function renderLatex(element, latex, options = {}) {
        const defaultOptions = {
            displayMode: true,
            throwOnError: false,
            strict: false,
            trust: true
        };

        try {
            katex.render(latex, element, { ...defaultOptions, ...options });
            element.classList.remove('latex-error');
            return true;
        } catch (e) {
            console.error('KaTeX render error:', e.message, latex);
            element.textContent = '渲染错误: ' + e.message;
            element.classList.add('latex-error');
            return false;
        }
    }

    /**
     * 渲染 LaTeX 到字符串
     * @param {string} latex - LaTeX 代码
     * @param {Object} options - 渲染选项
     * @returns {string} HTML 字符串
     */
    function renderLatexToString(latex, options = {}) {
        const defaultOptions = {
            displayMode: false,
            throwOnError: false,
            strict: false,
            trust: true
        };

        try {
            return katex.renderToString(latex, { ...defaultOptions, ...options });
        } catch (e) {
            console.error('KaTeX render error:', e.message, latex);
            return '<span class="latex-error">渲染错误: ' + e.message + '</span>';
        }
    }

    /**
     * 清空预览区域
     * @param {HTMLElement} element - 目标元素
     */
    function clearPreview(element) {
        element.innerHTML = '<span class="placeholder">公式预览</span>';
    }

    // 暴露到全局
    window.LatexRenderer = {
        render: renderLatex,
        renderToString: renderLatexToString,
        clear: clearPreview
    };

    console.log('LatexRenderer 已加载');

})(window);
