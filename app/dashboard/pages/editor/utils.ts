import { useState, useEffect } from 'react';

export type PreviewMode = 'preview' | 'visual-edit';

export function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export function buildIframeScript(mode: PreviewMode): string {
    return `(function(){
    var MODE = '${mode}';

    /* ── Link / form guard ── */
    document.addEventListener('click', function(e) {
        var a = e.target.closest('a');
        if (a) {
            e.preventDefault();
            e.stopPropagation();
            if (MODE !== 'visual-edit') {
                var href = a.getAttribute('href');
                if (href && href !== '#') {
                    showToast('Link: ' + href + ' (disabled in preview)');
                }
            }
        }
    }, true);
    document.addEventListener('submit', function(e) { e.preventDefault(); }, true);

    /* ── Toast helper ── */
    function showToast(msg) {
        var t = document.getElementById('__pt__');
        if (!t) {
            t = document.createElement('div');
            t.id = '__pt__';
            t.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1e1e2e;color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;font-family:system-ui,sans-serif;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:opacity .3s;pointer-events:none;white-space:nowrap;';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        clearTimeout(t._tid);
        t._tid = setTimeout(function(){ t.style.opacity = '0'; }, 2500);
    }

    if (MODE !== 'visual-edit') return;

    /* ── Visual Edit: inject contenteditable ── */
    var SEL = 'h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,button,label,figcaption,blockquote,dt,dd,legend,summary';
    var sty = document.createElement('style');
    sty.id = '__ve_style__';
    sty.textContent =
        '[data-ve]{cursor:text!important;transition:outline .15s,box-shadow .15s;}' +
        '[data-ve]:hover{outline:2px solid rgba(99,102,241,.45);outline-offset:2px;}' +
        '[data-ve]:focus{outline:2px solid #6366f1;outline-offset:2px;box-shadow:0 0 0 4px rgba(99,102,241,.12);border-radius:2px;}' +
        '.__tag__{position:fixed;padding:1px 6px;background:#6366f1;color:#fff;font-size:10px;font-family:system-ui,sans-serif;border-radius:3px;pointer-events:none;z-index:99999;font-weight:600;letter-spacing:.3px;}';
    document.head.appendChild(sty);

    document.querySelectorAll(SEL).forEach(function(el) {
        var hasBlockChild = false;
        for (var i = 0; i < el.children.length; i++) {
            var tag = el.children[i].tagName;
            if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE' || tag === 'NAV' || tag === 'HEADER' || tag === 'FOOTER' || tag === 'UL' || tag === 'OL') {
                hasBlockChild = true; break;
            }
        }
        if (!hasBlockChild) {
            el.setAttribute('contenteditable', 'true');
            el.setAttribute('data-ve', '');
            el.setAttribute('spellcheck', 'false');
        }
    });

    /* Floating tag label */
    var tag = document.createElement('div');
    tag.className = '__tag__';
    tag.style.display = 'none';
    document.body.appendChild(tag);

    function showTag(el) {
        var r = el.getBoundingClientRect();
        tag.style.display = 'block';
        tag.style.top = Math.max(0, r.top - 20) + 'px';
        tag.style.left = r.left + 'px';
        tag.textContent = el.tagName.toLowerCase();
    }

    document.addEventListener('focusin', function(e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-ve')) showTag(e.target);
    });
    document.addEventListener('focusout', function(e) {
        tag.style.display = 'none';
        if (e.target.hasAttribute && e.target.hasAttribute('data-ve')) sync();
    });
    document.addEventListener('input', function(e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-ve')) showTag(e.target);
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.activeElement) document.activeElement.blur();
    });

    /* ── Sync back to parent ── */
    function sync() {
        try {
            var clone = document.documentElement.cloneNode(true);
            var rm = clone.querySelectorAll('script, .__tag__, #__pt__, #__ve_style__');
            for (var i = 0; i < rm.length; i++) rm[i].remove();
            var eds = clone.querySelectorAll('[data-ve]');
            for (var j = 0; j < eds.length; j++) {
                eds[j].removeAttribute('contenteditable');
                eds[j].removeAttribute('data-ve');
                eds[j].removeAttribute('spellcheck');
            }
            var sts = clone.querySelectorAll('style');
            for (var k = 0; k < sts.length; k++) {
                if (sts[k].textContent.indexOf('data-ve') !== -1) sts[k].remove();
            }
            var html = '<!DOCTYPE html>' + '\\\\n' + clone.outerHTML;
            window.parent.postMessage({ type: 'VE_UPDATE', html: html }, '*');
        } catch(err) {
            console.error('Visual edit sync error:', err);
        }
    }

    showToast('\\\\u270f\\\\ufe0f Click any text to edit it directly');
})();`;
}

export function buildSrcdoc(html: string, css: string, js: string, mode: PreviewMode): string {
    const scriptCode = buildIframeScript(mode);
    const userJs = js ? `try{${js}}catch(e){console.error(e);}` : '';
    const allScripts = `<script>${scriptCode}${userJs ? '\\n' + userJs : ''}</script>`;

    const isFullDoc = /<!doctype|<html/i.test(html);
    if (isFullDoc) {
        let doc = html;
        if (css) {
            const style = `<style>${css}</style>`;
            doc = /<\/head>/i.test(doc)
                ? doc.replace(/<\/head>/i, `${style}\n</head>`)
                : style + doc;
        }
        doc = /<\/body>/i.test(doc)
            ? doc.replace(/<\/body>/i, `${allScripts}\n</body>`)
            : doc + allScripts;
        return doc;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>${css}</style>
</head>
<body>
${html}
${allScripts}
</body>
</html>`;
}
