'use client';

import { useEffect, useRef } from 'react';

interface CustomPageClientProps {
    htmlContent?: string | null;
    jsContent?: string | null;
}

export default function CustomPageClient({ htmlContent, jsContent }: CustomPageClientProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Execute any inline <script> tags inside htmlContent
        // React dangerouslySetInnerHTML does not execute <script> tags by default
        if (containerRef.current && htmlContent) {
            const scripts = containerRef.current.querySelectorAll('script');
            scripts.forEach((oldScript) => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach((attr) => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.text = oldScript.innerHTML;
                // Re-inserting the script tells the browser to execute it
                oldScript.parentNode?.replaceChild(newScript, oldScript);
            });
        }

        // 2. Inject and execute the dedicated jsContent
        let customScript: HTMLScriptElement | null = null;
        if (jsContent) {
            customScript = document.createElement('script');
            // Adding a try-catch could be helpful, but we'll stick to basic text assignment
            customScript.text = jsContent;
            document.body.appendChild(customScript);

            // Many templates wrap JS in DOMContentLoaded or load events.
            // Since evaluating dynamically happens after those events have originally fired,
            // we mock/dispatch them so the scripts' listeners will trigger.
            setTimeout(() => {
                window.dispatchEvent(new Event('DOMContentLoaded'));
                window.dispatchEvent(new Event('load'));
            }, 50);
        }

        return () => {
            if (customScript && customScript.parentNode) {
                customScript.parentNode.removeChild(customScript);
            }
        };
    }, [htmlContent, jsContent]);

    return (
        <>
            {htmlContent && (
                <div
                    ref={containerRef}
                    className="custom-page-content"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            )}
        </>
    );
}
