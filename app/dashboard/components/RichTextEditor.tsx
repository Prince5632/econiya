'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    HiOutlineBold,
    HiOutlineItalic,
    HiOutlineLink,
    HiOutlinePhoto,
    HiOutlineListBullet,
    HiOutlineBars3BottomLeft,
    HiOutlineBars3,
    HiOutlineBars3BottomRight,
    HiOutlineBars4,
} from 'react-icons/hi2';
import {
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuQuote,
    LuCode,
    LuStrikethrough,
    LuListOrdered,
    LuUndo2,
    LuRedo2,
    LuMinus,
    LuUnderline,
    LuHighlighter,
} from 'react-icons/lu';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Custom BubbleMenu – appears on text selection
   ═══════════════════════════════════════════════════════════════════════════ */
function BubbleMenu({ editor, setLink }: { editor: ReturnType<typeof useEditor>; setLink: () => void }) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (!editor) return;

        const updatePos = () => {
            const { from, to, empty } = editor.state.selection;
            if (empty || from === to) {
                setCoords(null);
                return;
            }

            // Get the DOM rect of the selection using the editor's view
            const start = editor.view.coordsAtPos(from);
            const end = editor.view.coordsAtPos(to);

            // Get editor wrapper bounding box so we can position relative to it
            const editorEl = editor.view.dom.closest('.rte-root');
            if (!editorEl) return;
            const editorRect = editorEl.getBoundingClientRect();

            const menuWidth = menuRef.current?.offsetWidth ?? 340;
            const selCenterX = (start.left + end.right) / 2;
            let left = selCenterX - editorRect.left - menuWidth / 2;
            // Clamp so it doesn't overflow edges
            left = Math.max(8, Math.min(left, editorRect.width - menuWidth - 8));

            const top = start.top - editorRect.top - 52; // 52px above the selection

            setCoords({ top, left });
        };

        editor.on('selectionUpdate', updatePos);
        editor.on('blur', () => setCoords(null));

        return () => {
            editor.off('selectionUpdate', updatePos);
            editor.off('blur', () => setCoords(null));
        };
    }, [editor]);

    if (!editor || !coords) return null;

    return (
        <div
            ref={menuRef}
            className="bubble-toolbar"
            style={{ top: coords.top, left: coords.left }}
            onMouseDown={(e) => e.preventDefault()} // prevent losing selection
        >
            <BubbleBtn
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold"
            >
                <HiOutlineBold size={15} />
            </BubbleBtn>
            <BubbleBtn
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic"
            >
                <HiOutlineItalic size={15} />
            </BubbleBtn>
            <BubbleBtn
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Underline"
            >
                <LuUnderline size={15} />
            </BubbleBtn>
            <BubbleBtn
                active={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
            >
                <LuStrikethrough size={14} />
            </BubbleBtn>

            <span className="bubble-sep" />

            <BubbleBtn
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
                title="Inline Code"
            >
                <LuCode size={15} />
            </BubbleBtn>
            <BubbleBtn
                active={editor.isActive('highlight')}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                title="Highlight"
            >
                <LuHighlighter size={15} />
            </BubbleBtn>

            <span className="bubble-sep" />

            <BubbleBtn
                active={editor.isActive('link')}
                onClick={setLink}
                title="Link"
            >
                <HiOutlineLink size={15} />
            </BubbleBtn>

            <span className="bubble-sep" />

            <BubbleBtn
                active={editor.isActive('heading', { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                title="H1"
            >
                <LuHeading1 size={16} />
            </BubbleBtn>
            <BubbleBtn
                active={editor.isActive('heading', { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="H2"
            >
                <LuHeading2 size={16} />
            </BubbleBtn>
            <BubbleBtn
                active={editor.isActive('blockquote')}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Blockquote"
            >
                <LuQuote size={14} />
            </BubbleBtn>
        </div>
    );
}

function BubbleBtn({ children, onClick, active, title }: {
    children: React.ReactNode; onClick: () => void; active?: boolean; title?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`bubble-btn ${active ? 'active' : ''}`}
        >
            {children}
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Editor component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Highlight.configure({ HTMLAttributes: { class: 'blog-highlight' } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            ImageExt.configure({ HTMLAttributes: { class: 'blog-img' } }),
            LinkExt.configure({ openOnClick: false, HTMLAttributes: { class: 'blog-link' } }),
            Placeholder.configure({
                placeholder: placeholder ?? 'Start writing your blog post...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'blog-editor-body focus:outline-none min-h-[500px] px-8 py-6',
            },
        },
    });

    const addImage = useCallback(() => {
        const url = window.prompt('Image URL:');
        if (url && editor) editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const prev = editor.getAttributes('link').href;
        const url = window.prompt('URL:', prev);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    const wordCount = editor.getText().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="rte-root flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-950" style={{ position: 'relative' }}>
            {/* ── Scoped Styles ── */}
            <style>{`
                /* ─── Bubble Menu ─────────────────────────────────────── */
                .bubble-toolbar {
                    position: absolute;
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    padding: 4px 6px;
                    background: #18181b;
                    border-radius: 10px;
                    box-shadow: 0 8px 30px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.06);
                    animation: bubbleIn 0.15s ease-out;
                }
                .bubble-toolbar::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 6px solid #18181b;
                }
                @keyframes bubbleIn {
                    from { opacity: 0; transform: translateY(6px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .bubble-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    color: #a1a1aa;
                    transition: all 0.12s;
                    cursor: pointer;
                    border: none;
                    background: none;
                }
                .bubble-btn:hover {
                    color: #fff;
                    background: rgba(255,255,255,.1);
                }
                .bubble-btn.active {
                    color: #818cf8;
                    background: rgba(129,140,248,.15);
                }
                .bubble-sep {
                    width: 1px;
                    height: 18px;
                    margin: 0 3px;
                    background: #3f3f46;
                }

                /* ─── Editor Body ─────────────────────────────────────── */
                .blog-editor-body {
                    color: #3f3f46;
                    font-size: 1.05rem;
                    line-height: 1.75;
                }
                @media (prefers-color-scheme: dark) {
                    .blog-editor-body { color: #d4d4d8; }
                }

                .blog-editor-body .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #a1a1aa;
                    pointer-events: none;
                    height: 0;
                }

                .blog-editor-body h1 {
                    font-size: 2.25rem; font-weight: 800; line-height: 1.2;
                    margin: 2rem 0 1rem; color: #18181b; letter-spacing: -0.02em;
                }
                .blog-editor-body h2 {
                    font-size: 1.5rem; font-weight: 700; line-height: 1.3;
                    margin: 1.75rem 0 0.75rem; color: #18181b; letter-spacing: -0.015em;
                }
                .blog-editor-body h3 {
                    font-size: 1.25rem; font-weight: 600; line-height: 1.4;
                    margin: 1.5rem 0 0.5rem; color: #18181b;
                }
                @media (prefers-color-scheme: dark) {
                    .blog-editor-body h1, .blog-editor-body h2, .blog-editor-body h3 { color: #fff; }
                }

                .blog-editor-body p { margin-bottom: 1.25rem; }

                .blog-editor-body blockquote {
                    border-left: 4px solid #e4e4e7;
                    padding-left: 1.25rem;
                    margin: 1.5rem 0;
                    color: #71717a;
                    font-style: italic;
                    font-size: 1.15rem;
                }
                @media (prefers-color-scheme: dark) {
                    .blog-editor-body blockquote {
                        border-left-color: #3f3f46;
                        color: #a1a1aa;
                    }
                }

                .blog-editor-body code {
                    background: #f4f4f5; border-radius: 4px;
                    padding: 0.2em 0.4em; font-size: 0.85em; 
                    font-family: 'ui-monospace', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
                    color: #ef4444;
                }
                @media (prefers-color-scheme: dark) {
                    .blog-editor-body code {
                        background: #27272a;
                        color: #f87171;
                    }
                }
                
                .blog-highlight {
                    background-color: #fef08a;
                    border-radius: 2px;
                    padding: 0.1em 0;
                }
                @media (prefers-color-scheme: dark) {
                    .blog-highlight {
                        background-color: #854d0e;
                        color: #fef08a;
                    }
                }

                .blog-editor-body pre {
                    background: #1e1e2e; color: #cdd6f4;
                    border-radius: 8px; padding: 1.25rem;
                    overflow-x: auto; margin: 1.5rem 0;
                    font-size: 0.9rem; line-height: 1.6;
                }
                .blog-editor-body pre code { 
                    background: none; padding: 0; color: inherit; 
                }

                .blog-editor-body .blog-img {
                    max-width: 100%; border-radius: 8px;
                    display: block; margin: 2rem auto;
                    border: 1px solid #e4e4e7;
                }
                @media (prefers-color-scheme: dark) {
                    .blog-editor-body .blog-img { border-color: #3f3f46; }
                }

                .blog-editor-body .blog-link {
                    color: #4f46e5; text-decoration: none; font-weight: 500;
                }
                .blog-editor-body .blog-link:hover { text-decoration: underline; }
                @media (prefers-color-scheme: dark) {
                    .blog-editor-body .blog-link { color: #818cf8; }
                }

                .blog-editor-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
                .blog-editor-body ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
                .blog-editor-body li { margin-bottom: 0.5rem; }
                .blog-editor-body li p { margin-bottom: 0; }
                
                .blog-editor-body hr {
                    border: 0; border-top: 2px solid #e4e4e7;
                    margin: 2.5rem 0;
                }
                @media (prefers-color-scheme: dark) {
                    .blog-editor-body hr { border-top-color: #3f3f46; }
                }
                
                /* Editor content max width */
                .blog-editor-wrapper > div > .tiptap {
                    max-width: 800px;
                    margin: 0 auto;
                }
            `}</style>

            {/* ── Sticky Toolbar ── */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-zinc-50/90 py-2 px-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
                <div className="flex items-center gap-0.5 mr-2 pr-2 border-r border-zinc-200 dark:border-zinc-700">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <LuUndo2 size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <LuRedo2 size={16} />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        active={editor.isActive('heading', { level: 1 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        title="Heading 1"
                    >
                        <LuHeading1 size={17} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('heading', { level: 2 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        title="Heading 2"
                    >
                        <LuHeading2 size={17} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('heading', { level: 3 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        title="Heading 3"
                    >
                        <LuHeading3 size={17} />
                    </ToolbarButton>
                </div>

                <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        active={editor.isActive('bold')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        title="Bold (Ctrl+B)"
                    >
                        <HiOutlineBold size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('italic')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        title="Italic (Ctrl+I)"
                    >
                        <HiOutlineItalic size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('underline')}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        title="Underline (Ctrl+U)"
                    >
                        <LuUnderline size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('strike')}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        title="Strikethrough"
                    >
                        <LuStrikethrough size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('code')}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        title="Inline Code"
                    >
                        <LuCode size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('highlight')}
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        title="Highlight"
                    >
                        <LuHighlighter size={16} />
                    </ToolbarButton>
                </div>

                <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'left' })}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        title="Align Left"
                    >
                        <HiOutlineBars3BottomLeft size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'center' })}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        title="Align Center"
                    >
                        <HiOutlineBars3 size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'right' })}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        title="Align Right"
                    >
                        <HiOutlineBars3BottomRight size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'justify' })}
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        title="Justify"
                    >
                        <HiOutlineBars4 size={16} />
                    </ToolbarButton>
                </div>

                <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        active={editor.isActive('bulletList')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Bullet List"
                    >
                        <HiOutlineListBullet size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('orderedList')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        title="Ordered List"
                    >
                        <LuListOrdered size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('blockquote')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        title="Blockquote"
                    >
                        <LuQuote size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal Rule"
                    >
                        <LuMinus size={16} />
                    </ToolbarButton>
                </div>

                <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        active={editor.isActive('link')}
                        onClick={setLink}
                        title="Insert Link"
                    >
                        <HiOutlineLink size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={addImage}
                        title="Insert Image"
                    >
                        <HiOutlinePhoto size={16} />
                    </ToolbarButton>
                </div>
            </div>

            {/* ── Editor Canvas ── */}
            <div className="blog-editor-wrapper flex-1 bg-white dark:bg-zinc-950">
                {/* Floating Bubble Toolbar */}
                <BubbleMenu editor={editor} setLink={setLink} />
                <EditorContent editor={editor} />
            </div>

            {/* ── Footer Stats ── */}
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                    <span>{wordCount} words</span>
                    <span>·</span>
                    <span>~{readTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500" title="Auto-saving enabled"></span>
                    Ready
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({
    children,
    onClick,
    active,
    disabled,
    title,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${active
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
        >
            {children}
        </button>
    );
}
