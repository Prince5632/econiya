'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineArrowUpTray,
    HiOutlineArrowPath,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiOutlineDevicePhoneMobile,
    HiOutlineDeviceTablet,
    HiOutlineComputerDesktop,
    HiOutlineArrowsPointingOut,
    HiOutlineArrowsPointingIn,
    HiOutlineDocumentArrowUp,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineCursorArrowRipple,
    HiOutlinePencilSquare,
} from 'react-icons/hi2';
import slugify from 'slugify';
import SeoFields from '../../components/SeoFields';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Types & constants
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
type PageStatus = 'DRAFT' | 'PUBLISHED';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

import { useDebounce, buildIframeScript, buildSrcdoc, type PreviewMode } from './utils';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
};

interface PageForm {
    title: string;
    slug: string;
    content: string;
    htmlContent: string;
    cssContent: string;
    jsContent: string;
    pageType: 'custom_code' | 'template';
    status: PageStatus;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage: string;
    template: { sections: { id: string; type: string }[] };
}

const TAB_META = {
    html: { label: 'HTML', accept: '.html,.htm', icon: '🌐', hint: 'Page structure & content' },
    css: { label: 'CSS', accept: '.css', icon: '🎨', hint: 'Styles & appearance' },
    js: { label: 'JS', accept: '.js', icon: '⚡', hint: 'Interactivity & logic' },
} as const;


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Main component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function PageEditorPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;
    const isEditing = !!id;

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEditing);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
    const [showPreview, setShowPreview] = useState(true);
    const [fullPreview, setFullPreview] = useState(false);
    const [viewport, setViewport] = useState<ViewportSize>('desktop');
    const [dragOver, setDragOver] = useState(false);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('preview');

    // The srcdoc currently displayed in the iframe — managed manually
    const [liveSrcdoc, setLiveSrcdoc] = useState('');
    const iframeKeyRef = useRef(0);

    const [form, setForm] = useState<PageForm>({
        title: '',
        slug: '',
        content: '',
        htmlContent: '',
        cssContent: '',
        jsContent: '',
        pageType: 'custom_code',
        status: 'DRAFT',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogImage: '',
        template: { sections: [] },
    });

    // ── Debounce code content for preview (600ms) ────────────────────────
    const debouncedHtml = useDebounce(form.htmlContent, 600);
    const debouncedCss = useDebounce(form.cssContent, 600);
    const debouncedJs = useDebounce(form.jsContent, 600);

    // ── Update liveSrcdoc when debounced content or mode changes ────────
    // In visual-edit mode, DON'T auto-update from code changes (user is editing in iframe)
    useEffect(() => {
        if (previewMode === 'visual-edit') return; // Frozen during visual editing
        const next = buildSrcdoc(debouncedHtml, debouncedCss, debouncedJs, 'preview');
        setLiveSrcdoc(next);
    }, [debouncedHtml, debouncedCss, debouncedJs, previewMode]);

    // ── When entering visual-edit mode, snapshot current content into iframe ──
    useEffect(() => {
        if (previewMode === 'visual-edit') {
            const next = buildSrcdoc(form.htmlContent, form.cssContent, form.jsContent, 'visual-edit');
            setLiveSrcdoc(next);
            iframeKeyRef.current += 1; // Force iframe remount to inject new script
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewMode]);

    // ── Listen for postMessage from visual editor ────────────────────────
    useEffect(() => {
        function onMessage(e: MessageEvent) {
            if (e.data?.type === 'VE_UPDATE' && typeof e.data.html === 'string') {
                let updated = e.data.html;
                // Strip the CSS <style> block we injected (keep user's original styles separate)
                if (form.cssContent) {
                    updated = updated.replace(new RegExp(`<style>${form.cssContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</style>`, 'i'), '');
                }
                setForm(prev => ({ ...prev, htmlContent: updated }));
            }
        }
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [form.cssContent]);

    // ── Load page data if editing ────────────────────────────────────────
    useEffect(() => {
        if (isEditing) {
            fetch(`/api/pages/${id}`)
                .then(r => r.json())
                .then(data => {
                    setForm({
                        title: data.title || '',
                        slug: data.slug || '',
                        content: data.content || '',
                        htmlContent: data.htmlContent || '',
                        cssContent: data.cssContent || '',
                        jsContent: data.jsContent || '',
                        pageType: data.pageType || 'custom_code',
                        status: data.status || (data.isPublished ? 'PUBLISHED' : 'DRAFT'),
                        metaTitle: data.metaTitle || '',
                        metaDescription: data.metaDescription || '',
                        metaKeywords: data.metaKeywords || '',
                        ogImage: data.ogImage || '',
                        template: data.template || { sections: [] },
                    });
                    setLoading(false);
                });
        }
    }, [id, isEditing]);

    // ── Field updater ────────────────────────────────────────────────────
    const updateField = useCallback((field: string, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const generateSlug = useCallback(() => {
        setForm(prev => ({ ...prev, slug: slugify(prev.title, { lower: true, strict: true }) }));
    }, []);

    // ── File upload & drag-drop ──────────────────────────────────────────
    const handleFileUpload = useCallback((field: 'htmlContent' | 'cssContent' | 'jsContent') => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => setForm(prev => ({ ...prev, [field]: ev.target?.result as string }));
            reader.readAsText(file);
            e.target.value = '';
        };
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        let field: 'htmlContent' | 'cssContent' | 'jsContent';
        let tab: 'html' | 'css' | 'js';
        if (ext === 'html' || ext === 'htm') { field = 'htmlContent'; tab = 'html'; }
        else if (ext === 'css') { field = 'cssContent'; tab = 'css'; }
        else if (ext === 'js') { field = 'jsContent'; tab = 'js'; }
        else return;
        const reader = new FileReader();
        reader.onload = ev => {
            setForm(prev => ({ ...prev, [field]: ev.target?.result as string }));
            setActiveTab(tab);
        };
        reader.readAsText(file);
    }, []);

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        const endpoint = isEditing ? `/api/pages/${id}` : '/api/pages';
        const method = isEditing ? 'PUT' : 'POST';
        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setSuccess(isEditing ? 'Page updated!' : 'Page created!');
                setTimeout(() => router.push('/dashboard/pages'), 1000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save page');
                setSaving(false);
            }
        } catch {
            setError('Network error — please try again.');
            setSaving(false);
        }
    }, [form, id, isEditing, router]);

    // ── Helpers ──────────────────────────────────────────────────────────
    const codeField = activeTab === 'html' ? 'htmlContent' : activeTab === 'css' ? 'cssContent' : 'jsContent';
    const codeValue = activeTab === 'html' ? form.htmlContent : activeTab === 'css' ? form.cssContent : form.jsContent;
    const hasContent = (tab: 'html' | 'css' | 'js') =>
        tab === 'html' ? !!form.htmlContent.trim() : tab === 'css' ? !!form.cssContent.trim() : !!form.jsContent.trim();
    const hasAnyContent = !!(form.htmlContent.trim() || form.cssContent.trim() || form.jsContent.trim());

    // ── Loading state ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Shared UI pieces (rendered as JSX, NOT as components)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    // Viewport toggle buttons
    const viewportButtons = (
        <>
            {([
                { s: 'desktop' as ViewportSize, I: HiOutlineComputerDesktop },
                { s: 'tablet' as ViewportSize, I: HiOutlineDeviceTablet },
                { s: 'mobile' as ViewportSize, I: HiOutlineDevicePhoneMobile },
            ]).map(({ s, I }) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => setViewport(s)}
                    title={s.charAt(0).toUpperCase() + s.slice(1)}
                    className={`rounded-md p-2 transition-colors ${viewport === s
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                        }`}
                >
                    <I className="h-4 w-4" />
                </button>
            ))}
        </>
    );

    // Mode toggle (Preview / Visual Edit)
    const modeToggle = (
        <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${previewMode === 'preview'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                    }`}
            >
                <HiOutlineEye className="h-3.5 w-3.5" />
                Preview
            </button>
            <button
                type="button"
                onClick={() => setPreviewMode('visual-edit')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${previewMode === 'visual-edit'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                    }`}
            >
                <HiOutlinePencilSquare className="h-3.5 w-3.5" />
                Visual Edit
            </button>
        </div>
    );

    // The iframe (reference by key so it only remounts when we increment the key)
    const previewIframe = hasAnyContent && liveSrcdoc ? (
        <iframe
            key={iframeKeyRef.current}
            srcDoc={liveSrcdoc}
            title="Page Preview"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin"
        />
    ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-800">
                <HiOutlineEye className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-500">Live preview will appear here</p>
            <p className="text-xs text-zinc-400">Paste HTML or upload a file to get started</p>
        </div>
    );

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Full-screen preview
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    if (fullPreview) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-zinc-100 dark:bg-zinc-900">
                {/* Toolbar */}
                <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                        {modeToggle}
                        {form.title && (
                            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                {form.title}
                            </span>
                        )}
                        {previewMode === 'visual-edit' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <HiOutlineCursorArrowRipple className="h-3 w-3" />
                                Click text to edit
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {viewportButtons}
                        <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
                        <button
                            type="button"
                            onClick={() => setFullPreview(false)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            <HiOutlineArrowsPointingIn className="h-3.5 w-3.5" />
                            Exit
                        </button>
                    </div>
                </div>
                {/* Preview body */}
                <div className="flex flex-1 items-start justify-center overflow-auto p-4">
                    <div
                        className="h-full overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-zinc-200 transition-all duration-300 dark:ring-zinc-800"
                        style={{ width: VIEWPORT_WIDTHS[viewport], maxWidth: '100%' }}
                    >
                        {previewIframe}
                    </div>
                </div>
            </div>
        );
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Main editor layout
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {isEditing ? 'Edit Page' : 'Create New Page'}
                    </h1>
                    <p className="mt-0.5 text-sm text-zinc-500">
                        {isEditing ? 'Modify content and see changes live' : 'Upload or paste HTML, CSS & JS — use Visual Edit to change text directly'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => updateField('status', form.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${form.status === 'PUBLISHED'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20'
                        }`}
                >
                    <span className={`h-2 w-2 rounded-full ${form.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {form.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    <HiOutlineExclamationTriangle className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
                </div>
            )}
            {success && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
                    <HiOutlineCheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Title & Slug ──────────────────────────────────────── */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Page Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => updateField('title', e.target.value)}
                            onBlur={() => { if (!form.slug && form.title) generateSlug(); }}
                            required
                            placeholder="e.g. About Us, Contact, Privacy Policy"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            URL Slug
                        </label>
                        <div className="flex gap-2">
                            <div className="flex flex-1 items-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                                <span className="pl-4 text-sm text-zinc-400">/</span>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => updateField('slug', e.target.value)}
                                    placeholder="auto-generated-from-title"
                                    className="flex-1 border-0 bg-transparent px-1 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-0 dark:text-white"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={generateSlug}
                                title="Auto-generate from title"
                                className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-500 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                            >
                                <HiOutlineArrowPath className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Page Type Toggle ──────────────────────────────────── */}
                {!isEditing && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Page Type:</span>
                        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                            <button
                                type="button"
                                onClick={() => updateField('pageType', 'custom_code')}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${form.pageType === 'custom_code'
                                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                                    }`}
                            >
                                🌐 Custom Code
                            </button>
                            <button
                                type="button"
                                onClick={() => updateField('pageType', 'template')}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${form.pageType === 'template'
                                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                                    }`}
                            >
                                🧩 Template
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Template Section Builder (shown when pageType is template) ── */}
                {form.pageType === 'template' && (
                    <TemplateSectionBuilder
                        sections={form.template.sections}
                        onChange={(sections) => setForm(prev => ({ ...prev, template: { sections } }))}
                    />
                )}

                {/* ── Editor + Preview (shown when pageType is custom_code) ──── */}
                {form.pageType === 'custom_code' && <div
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`relative overflow-hidden rounded-xl border shadow-sm transition-all ${dragOver ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                >
                    {/* Drag overlay */}
                    {dragOver && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-indigo-500/5 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-indigo-400 bg-white/90 px-12 py-8 dark:bg-zinc-900/90">
                                <HiOutlineDocumentArrowUp className="h-10 w-10 text-indigo-500" />
                                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Drop your file here</span>
                                <span className="text-xs text-zinc-500">HTML, CSS, or JS — auto-detected</span>
                            </div>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/80">
                        {/* Code tabs */}
                        <div className="flex items-center gap-1">
                            {(['html', 'css', 'js'] as const).map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    title={TAB_META[tab].hint}
                                    className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${activeTab === tab
                                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                                        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                        }`}
                                >
                                    <span>{TAB_META[tab].icon}</span>
                                    <span>{TAB_META[tab].label}</span>
                                    {hasContent(tab) && (
                                        <span className={`h-1.5 w-1.5 rounded-full ${activeTab === tab ? 'bg-indigo-500' : 'bg-green-500'}`} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-1.5">
                            <label
                                title={`Upload .${activeTab} file`}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            >
                                <HiOutlineArrowUpTray className="h-3.5 w-3.5" />
                                Upload
                                <input type="file" accept={TAB_META[activeTab].accept} onChange={handleFileUpload(codeField as 'htmlContent' | 'cssContent' | 'jsContent')} className="hidden" />
                            </label>

                            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

                            {showPreview && (<>
                                {([
                                    { s: 'desktop' as ViewportSize, I: HiOutlineComputerDesktop },
                                    { s: 'tablet' as ViewportSize, I: HiOutlineDeviceTablet },
                                    { s: 'mobile' as ViewportSize, I: HiOutlineDevicePhoneMobile },
                                ]).map(({ s, I }) => (
                                    <button key={s} type="button" onClick={() => setViewport(s)} title={s}
                                        className={`rounded-md p-1.5 transition-colors ${viewport === s ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
                                        <I className="h-3.5 w-3.5" />
                                    </button>
                                ))}
                                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
                            </>)}

                            <button type="button" onClick={() => setFullPreview(true)} title="Full-screen" className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                <HiOutlineArrowsPointingOut className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => setShowPreview(!showPreview)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${showPreview ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}>
                                {showPreview ? <HiOutlineEyeSlash className="h-3.5 w-3.5" /> : <HiOutlineEye className="h-3.5 w-3.5" />}
                                {showPreview ? 'Hide' : 'Preview'}
                            </button>
                        </div>
                    </div>

                    {/* Editor + Preview body */}
                    <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                        {/* Code pane */}
                        <div className={showPreview ? 'border-r border-zinc-200 dark:border-zinc-800' : ''}>
                            <div className="border-b border-zinc-200 bg-zinc-50/50 px-4 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <span className="text-xs text-zinc-400">
                                    {TAB_META[activeTab].hint} — paste code or drag & drop a file
                                </span>
                            </div>
                            <textarea
                                value={codeValue}
                                onChange={e => updateField(codeField, e.target.value)}
                                rows={26}
                                placeholder={`Paste your ${TAB_META[activeTab].label} code here…\n\nYou can also drag & drop a .${activeTab} file.`}
                                className="block w-full resize-none border-0 bg-[#0d1117] px-4 py-3 font-mono text-sm leading-relaxed text-[#c9d1d9] placeholder-zinc-600 focus:outline-none focus:ring-0"
                                spellCheck={false}
                            />
                        </div>

                        {/* Preview pane */}
                        {showPreview && (
                            <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900">
                                {/* Preview header */}
                                <div className="border-b border-zinc-200 px-4 py-1.5 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                            </div>
                                            {modeToggle}
                                        </div>
                                        <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
                                            {viewport}
                                        </span>
                                    </div>
                                </div>
                                {/* Visual-edit hint */}
                                {previewMode === 'visual-edit' && hasAnyContent && (
                                    <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50/80 px-4 py-1.5 dark:border-indigo-500/20 dark:bg-indigo-500/5">
                                        <HiOutlineCursorArrowRipple className="h-3.5 w-3.5 text-indigo-500" />
                                        <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                            Click any text to edit — changes sync to source on blur
                                        </span>
                                    </div>
                                )}
                                {/* Iframe container */}
                                <div className="flex flex-1 items-start justify-center overflow-auto p-2">
                                    <div
                                        className="overflow-hidden rounded-md bg-white shadow-sm transition-all duration-300"
                                        style={{ width: VIEWPORT_WIDTHS[viewport], maxWidth: '100%', height: '600px' }}
                                    >
                                        {previewIframe}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>}

                {/* ── SEO Fields ──────────────────────────────────────── */}
                <SeoFields
                    metaTitle={form.metaTitle}
                    metaDescription={form.metaDescription}
                    metaKeywords={form.metaKeywords}
                    ogImage={form.ogImage}
                    slug={form.slug}
                    onChange={updateField}
                    onSlugGenerate={generateSlug}
                />

                {/* ── Actions ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between pb-6">
                    <p className="text-xs text-zinc-400">
                        💡 Use <b>Visual Edit</b> to edit text without code
                    </p>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => router.back()}
                            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !form.title.trim()}
                            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                            {saving ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving…
                                </span>
                            ) : isEditing ? 'Update Page' : 'Create Page'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Template Section Builder sub-component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import { TEMPLATE_SECTIONS, generateSectionId } from '@/lib/templates';
import type { TemplateSectionConfig } from '@/lib/templates';

function TemplateSectionBuilder({
    sections,
    onChange,
}: {
    sections: TemplateSectionConfig[];
    onChange: (sections: TemplateSectionConfig[]) => void;
}) {
    const addSection = (type: string) => {
        onChange([...sections, { id: generateSectionId(), type }]);
    };

    const removeSection = (id: string) => {
        onChange(sections.filter(s => s.id !== id));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= newSections.length) return;
        [newSections[index], newSections[target]] = [newSections[target], newSections[index]];
        onChange(newSections);
    };

    // Sections already added
    const usedTypes = new Set(sections.map(s => s.type));
    // Sections available to add
    const availableSections = TEMPLATE_SECTIONS.filter(s => !usedTypes.has(s.type));

    return (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            {/* Left: Current sections list */}
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Page Sections</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Drag to reorder, click ✕ to remove</p>
                </div>
                {sections.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                            <span className="text-2xl">🧩</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-500">No sections added yet</p>
                        <p className="text-xs text-zinc-400 mt-1">Pick sections from the right panel to build your page</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {sections.map((section, index) => {
                            const meta = TEMPLATE_SECTIONS.find(s => s.type === section.type);
                            return (
                                <div
                                    key={section.id}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-base dark:bg-zinc-800">
                                        {meta?.icon || '📄'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{meta?.label || section.type}</p>
                                        <p className="text-[11px] text-zinc-400 truncate">{meta?.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveSection(index, 'up')}
                                            disabled={index === 0}
                                            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            title="Move up"
                                        >
                                            <HiOutlineChevronUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveSection(index, 'down')}
                                            disabled={index === sections.length - 1}
                                            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            title="Move down"
                                        >
                                            <HiOutlineChevronDown className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeSection(section.id)}
                                            className="rounded-md p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                            title="Remove section"
                                        >
                                            <HiOutlineTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right: Available sections to add */}
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Available Sections</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Click to add to your page</p>
                </div>
                <div className="p-3 space-y-1.5">
                    {TEMPLATE_SECTIONS.map((tmpl) => {
                        const isAdded = usedTypes.has(tmpl.type);
                        return (
                            <button
                                key={tmpl.type}
                                type="button"
                                onClick={() => !isAdded && addSection(tmpl.type)}
                                disabled={isAdded}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isAdded
                                    ? 'bg-green-50/50 text-green-600 cursor-default dark:bg-green-500/5 dark:text-green-400'
                                    : 'hover:bg-indigo-50 text-zinc-700 dark:text-zinc-300 dark:hover:bg-indigo-500/10'
                                    }`}
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-lg dark:bg-zinc-800">
                                    {tmpl.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{tmpl.label}</p>
                                    <p className="text-[11px] text-zinc-400 truncate">{tmpl.description}</p>
                                </div>
                                {isAdded ? (
                                    <span className="text-xs font-medium text-green-500">✓ Added</span>
                                ) : (
                                    <HiOutlinePlus className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
