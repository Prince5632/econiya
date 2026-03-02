'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import dynamic from 'next/dynamic';
import SeoFields from '../../components/SeoFields';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';

const RichTextEditor = dynamic(() => import('../../components/RichTextEditor'), { ssr: false });

interface Category { id: string; name: string; }
interface RfqForm { id: string; name: string; }
interface KeyFeature { title: string; description: string; icon: string; }
interface HighlightSpec { label: string; value: string; icon: string; }
interface SpecEntry { key: string; value: string; }
interface SpecGroup { tabName: string; entries: SpecEntry[]; }

const ICON_OPTIONS = [
    { value: 'shield', label: '🛡️ Shield' },
    { value: 'display', label: '🖥️ Display' },
    { value: 'camera', label: '📷 Camera' },
    { value: 'battery', label: '🔋 Battery' },
    { value: 'wifi', label: '📶 WiFi' },
    { value: 'sim', label: '📱 SIM' },
    { value: 'audio', label: '🔊 Audio' },
    { value: 'zap', label: '⚡ Zap' },
    { value: 'settings', label: '⚙️ Settings' },
    { value: 'star', label: '⭐ Star' },
];

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [rfqForms, setRfqForms] = useState<RfqForm[]>([]);
    const [form, setForm] = useState({
        name: '', slug: '', description: '', content: '', categoryId: '', rfqFormId: '',
        images: [] as string[], isPublished: false, sortOrder: 0,
        metaTitle: '', metaDescription: '', metaKeywords: '', ogImage: '',
    });

    // New structured fields
    const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>([]);
    const [highlightSpecs, setHighlightSpecs] = useState<HighlightSpec[]>([]);
    const [specGroups, setSpecGroups] = useState<SpecGroup[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(setCategories);
        fetch('/api/rfq-forms').then(r => r.json()).then(setRfqForms);
    }, []);

    function updateField(field: string, value: any) { setForm(prev => ({ ...prev, [field]: value })); }

    // ── Image helpers ──────────────────────────────────────────────────────────
    function addImage() {
        if (newImageUrl.trim()) {
            setForm(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
            setNewImageUrl('');
        }
    }
    function removeImage(idx: number) {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    }

    // ── Key Features helpers ───────────────────────────────────────────────────
    function addKeyFeature() { setKeyFeatures([...keyFeatures, { title: '', description: '', icon: 'star' }]); }
    function updateKeyFeature(idx: number, key: keyof KeyFeature, value: string) {
        const updated = [...keyFeatures]; updated[idx] = { ...updated[idx], [key]: value }; setKeyFeatures(updated);
    }
    function removeKeyFeature(idx: number) { setKeyFeatures(keyFeatures.filter((_, i) => i !== idx)); }

    // ── Highlight Specs helpers ────────────────────────────────────────────────
    function addHighlightSpec() { setHighlightSpecs([...highlightSpecs, { label: '', value: '', icon: 'camera' }]); }
    function updateHighlightSpec(idx: number, key: keyof HighlightSpec, value: string) {
        const updated = [...highlightSpecs]; updated[idx] = { ...updated[idx], [key]: value }; setHighlightSpecs(updated);
    }
    function removeHighlightSpec(idx: number) { setHighlightSpecs(highlightSpecs.filter((_, i) => i !== idx)); }

    // ── Specs Group helpers ────────────────────────────────────────────────────
    function addSpecGroup() { setSpecGroups([...specGroups, { tabName: '', entries: [{ key: '', value: '' }] }]); }
    function updateSpecGroupName(idx: number, name: string) {
        const updated = [...specGroups]; updated[idx] = { ...updated[idx], tabName: name }; setSpecGroups(updated);
    }
    function addSpecEntry(groupIdx: number) {
        const updated = [...specGroups]; updated[groupIdx].entries.push({ key: '', value: '' }); setSpecGroups(updated);
    }
    function updateSpecEntry(groupIdx: number, entryIdx: number, key: 'key' | 'value', value: string) {
        const updated = [...specGroups]; updated[groupIdx].entries[entryIdx] = { ...updated[groupIdx].entries[entryIdx], [key]: value }; setSpecGroups(updated);
    }
    function removeSpecEntry(groupIdx: number, entryIdx: number) {
        const updated = [...specGroups]; updated[groupIdx].entries = updated[groupIdx].entries.filter((_, i) => i !== entryIdx); setSpecGroups(updated);
    }
    function removeSpecGroup(idx: number) { setSpecGroups(specGroups.filter((_, i) => i !== idx)); }

    // ── Build specs JSON from groups ───────────────────────────────────────────
    function buildSpecsJson(): Record<string, Record<string, string>> | null {
        const result: Record<string, Record<string, string>> = {};
        for (const group of specGroups) {
            if (!group.tabName.trim()) continue;
            const entries: Record<string, string> = {};
            for (const entry of group.entries) {
                if (entry.key.trim()) entries[entry.key.trim()] = entry.value;
            }
            if (Object.keys(entries).length > 0) result[group.tabName.trim()] = entries;
        }
        return Object.keys(result).length > 0 ? result : null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setSaving(true); setError('');
        const payload = {
            ...form,
            images: form.images.length ? form.images : null,
            specs: buildSpecsJson(),
            keyFeatures: keyFeatures.length > 0 ? keyFeatures.filter(f => f.title.trim()) : null,
            highlightSpecs: highlightSpecs.length > 0 ? highlightSpecs.filter(s => s.label.trim()) : null,
        };
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) router.push('/dashboard/products');
        else { const data = await res.json(); setError(data.error); setSaving(false); }
    }

    const inputCls = "w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";
    const labelCls = "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
    const sectionCls = "rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4";
    const sectionTitleCls = "text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
    const addBtnCls = "inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">New Product</h1>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── Basic Info ─────────────────────────────────────────────── */}
                <div className={sectionCls}>
                    <div>
                        <label className={labelCls}>Product Name *</label>
                        <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} required className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Category *</label>
                            <select value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)} required className={inputCls}>
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>RFQ Form (optional)</label>
                            <select value={form.rfqFormId} onChange={e => updateField('rfqFormId', e.target.value)} className={inputCls}>
                                <option value="">No RFQ form</option>
                                {rfqForms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Short Description</label>
                        <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={2} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Content</label>
                        <RichTextEditor content={form.content} onChange={html => updateField('content', html)} />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" checked={form.isPublished} onChange={e => updateField('isPublished', e.target.checked)} className="peer sr-only" />
                            <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-zinc-600" />
                        </label>
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Publish immediately</span>
                    </div>
                </div>

                {/* ── Product Images ─────────────────────────────────────────── */}
                <div className={sectionCls}>
                    <div className="flex items-center justify-between">
                        <h3 className={sectionTitleCls}>Product Images</h3>
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Paste image URL..." className={inputCls} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }} />
                        <button type="button" onClick={addImage} className={addBtnCls}><HiOutlinePlus className="h-3.5 w-3.5" /> Add</button>
                    </div>
                    {form.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                            {form.images.map((img, idx) => (
                                <div key={idx} className="group relative rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900">
                                    <img src={img} alt={`Product ${idx + 1}`} className="h-20 w-full rounded object-contain" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"><HiOutlineTrash className="h-3 w-3" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-zinc-400">Add image URLs for the product gallery. First image will be the primary image.</p>
                </div>

                {/* ── Highlight Specs (Hero Quick-Glance) ─────────────────────── */}
                <div className={sectionCls}>
                    <div className="flex items-center justify-between">
                        <h3 className={sectionTitleCls}>Highlight Specs</h3>
                        <button type="button" onClick={addHighlightSpec} className={addBtnCls}><HiOutlinePlus className="h-3.5 w-3.5" /> Add Spec</button>
                    </div>
                    <p className="text-xs text-zinc-400">Quick specs shown in the hero section (e.g. Camera: 12MP, Display: FHD).</p>
                    {highlightSpecs.map((spec, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="grid flex-1 grid-cols-3 gap-3">
                                <input type="text" value={spec.label} onChange={e => updateHighlightSpec(idx, 'label', e.target.value)} placeholder="Label (e.g. Camera)" className={inputCls} />
                                <input type="text" value={spec.value} onChange={e => updateHighlightSpec(idx, 'value', e.target.value)} placeholder="Value (e.g. 12MP)" className={inputCls} />
                                <select value={spec.icon} onChange={e => updateHighlightSpec(idx, 'icon', e.target.value)} className={inputCls}>
                                    {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <button type="button" onClick={() => removeHighlightSpec(idx)} className="mt-1 text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>

                {/* ── Key Features ───────────────────────────────────────────── */}
                <div className={sectionCls}>
                    <div className="flex items-center justify-between">
                        <h3 className={sectionTitleCls}>Key Features</h3>
                        <button type="button" onClick={addKeyFeature} className={addBtnCls}><HiOutlinePlus className="h-3.5 w-3.5" /> Add Feature</button>
                    </div>
                    <p className="text-xs text-zinc-400">Feature cards shown in the product detail page grid section.</p>
                    {keyFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="grid flex-1 gap-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="text" value={feature.title} onChange={e => updateKeyFeature(idx, 'title', e.target.value)} placeholder="Feature title" className={`col-span-2 ${inputCls}`} />
                                    <select value={feature.icon} onChange={e => updateKeyFeature(idx, 'icon', e.target.value)} className={inputCls}>
                                        {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <input type="text" value={feature.description} onChange={e => updateKeyFeature(idx, 'description', e.target.value)} placeholder="Short description" className={inputCls} />
                            </div>
                            <button type="button" onClick={() => removeKeyFeature(idx)} className="mt-1 text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>

                {/* ── Specifications (Tabbed) ────────────────────────────────── */}
                <div className={sectionCls}>
                    <div className="flex items-center justify-between">
                        <h3 className={sectionTitleCls}>Specifications</h3>
                        <button type="button" onClick={addSpecGroup} className={addBtnCls}><HiOutlinePlus className="h-3.5 w-3.5" /> Add Tab</button>
                    </div>
                    <p className="text-xs text-zinc-400">Grouped specifications shown as tabs (e.g. Tech Specs, Connectivity, Physical Characteristics).</p>
                    {specGroups.map((group, gIdx) => (
                        <div key={gIdx} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900 space-y-3">
                            <div className="flex items-center gap-3">
                                <input type="text" value={group.tabName} onChange={e => updateSpecGroupName(gIdx, e.target.value)} placeholder="Tab name (e.g. Tech Specs)" className={`flex-1 font-medium ${inputCls}`} />
                                <button type="button" onClick={() => removeSpecGroup(gIdx)} className="text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button>
                            </div>
                            <div className="space-y-2 pl-2">
                                {group.entries.map((entry, eIdx) => (
                                    <div key={eIdx} className="flex items-center gap-2">
                                        <input type="text" value={entry.key} onChange={e => updateSpecEntry(gIdx, eIdx, 'key', e.target.value)} placeholder="Spec name" className={`flex-1 ${inputCls}`} />
                                        <input type="text" value={entry.value} onChange={e => updateSpecEntry(gIdx, eIdx, 'value', e.target.value)} placeholder="Value" className={`flex-1 ${inputCls}`} />
                                        <button type="button" onClick={() => removeSpecEntry(gIdx, eIdx)} className="text-red-400 hover:text-red-600"><HiOutlineTrash className="h-3.5 w-3.5" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addSpecEntry(gIdx)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">+ Add row</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── SEO ────────────────────────────────────────────────────── */}
                <SeoFields metaTitle={form.metaTitle} metaDescription={form.metaDescription} metaKeywords={form.metaKeywords} ogImage={form.ogImage} slug={form.slug} onChange={updateField} onSlugGenerate={() => updateField('slug', slugify(form.name, { lower: true, strict: true }))} />

                {/* ── Actions ──────────────────────────────────────────────── */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create Product'}</button>
                </div>
            </form>
        </div>
    );
}
