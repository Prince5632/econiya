'use client';

import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';

interface LinkItem {
    label: string;
    url: string;
}

interface SocialLink {
    platform: string;
    url: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        siteName: '',
        logoUrl: '',
        headerLinks: [] as LinkItem[],
        footerLinks: [] as LinkItem[],
        socialLinks: [] as SocialLink[],
        copyrightText: '',
        footerContent: '',
    });

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(data => {
            setForm({
                siteName: data.siteName || '',
                logoUrl: data.logoUrl || '',
                headerLinks: data.headerLinks || [],
                footerLinks: data.footerLinks || [],
                socialLinks: data.socialLinks || [],
                copyrightText: data.copyrightText || '',
                footerContent: data.footerContent || '',
            });
            setLoading(false);
        });
    }, []);

    function updateField(field: string, value: any) { setForm(prev => ({ ...prev, [field]: value })); }

    // Header links
    function addHeaderLink() { updateField('headerLinks', [...form.headerLinks, { label: '', url: '' }]); }
    function updateHeaderLink(i: number, key: string, val: string) { const u = [...form.headerLinks]; u[i] = { ...u[i], [key]: val }; updateField('headerLinks', u); }
    function removeHeaderLink(i: number) { updateField('headerLinks', form.headerLinks.filter((_, idx) => idx !== i)); }

    // Footer links
    function addFooterLink() { updateField('footerLinks', [...form.footerLinks, { label: '', url: '' }]); }
    function updateFooterLink(i: number, key: string, val: string) { const u = [...form.footerLinks]; u[i] = { ...u[i], [key]: val }; updateField('footerLinks', u); }
    function removeFooterLink(i: number) { updateField('footerLinks', form.footerLinks.filter((_, idx) => idx !== i)); }

    // Social links
    function addSocialLink() { updateField('socialLinks', [...form.socialLinks, { platform: '', url: '' }]); }
    function updateSocialLink(i: number, key: string, val: string) { const u = [...form.socialLinks]; u[i] = { ...u[i], [key]: val }; updateField('socialLinks', u); }
    function removeSocialLink(i: number) { updateField('socialLinks', form.socialLinks.filter((_, idx) => idx !== i)); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        const res = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setSaving(false);
        if (res.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    const inputCls = "w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Site Settings</h1>

            {saved && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Settings saved successfully!</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">General</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Site Name</label>
                            <input type="text" value={form.siteName} onChange={e => updateField('siteName', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Logo URL</label>
                            <input type="text" value={form.logoUrl} onChange={e => updateField('logoUrl', e.target.value)} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Header Links */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Header Navigation Links</h3>
                        <button type="button" onClick={addHeaderLink} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"><HiOutlinePlus className="h-3.5 w-3.5" /> Add</button>
                    </div>
                    <div className="space-y-2">
                        {form.headerLinks.map((link, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="text" value={link.label} onChange={e => updateHeaderLink(i, 'label', e.target.value)} placeholder="Label" className={`flex-1 ${inputCls}`} />
                                <input type="text" value={link.url} onChange={e => updateHeaderLink(i, 'url', e.target.value)} placeholder="URL" className={`flex-1 ${inputCls}`} />
                                <button type="button" onClick={() => removeHeaderLink(i)} className="text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button>
                            </div>
                        ))}
                        {form.headerLinks.length === 0 && <p className="text-xs text-zinc-400">No header links configured.</p>}
                    </div>
                </div>

                {/* Footer Links */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Footer Links</h3>
                        <button type="button" onClick={addFooterLink} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"><HiOutlinePlus className="h-3.5 w-3.5" /> Add</button>
                    </div>
                    <div className="space-y-2">
                        {form.footerLinks.map((link, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="text" value={link.label} onChange={e => updateFooterLink(i, 'label', e.target.value)} placeholder="Label" className={`flex-1 ${inputCls}`} />
                                <input type="text" value={link.url} onChange={e => updateFooterLink(i, 'url', e.target.value)} placeholder="URL" className={`flex-1 ${inputCls}`} />
                                <button type="button" onClick={() => removeFooterLink(i)} className="text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button>
                            </div>
                        ))}
                        {form.footerLinks.length === 0 && <p className="text-xs text-zinc-400">No footer links configured.</p>}
                    </div>
                </div>

                {/* Social Links */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Social Links</h3>
                        <button type="button" onClick={addSocialLink} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"><HiOutlinePlus className="h-3.5 w-3.5" /> Add</button>
                    </div>
                    <div className="space-y-2">
                        {form.socialLinks.map((link, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <select value={link.platform} onChange={e => updateSocialLink(i, 'platform', e.target.value)} className={`w-40 ${inputCls}`}>
                                    <option value="">Platform</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="twitter">Twitter/X</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                                <input type="text" value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)} placeholder="URL" className={`flex-1 ${inputCls}`} />
                                <button type="button" onClick={() => removeSocialLink(i)} className="text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button>
                            </div>
                        ))}
                        {form.socialLinks.length === 0 && <p className="text-xs text-zinc-400">No social links configured.</p>}
                    </div>
                </div>

                {/* Copyright */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Footer Content</h3>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Copyright Text</label>
                        <input type="text" value={form.copyrightText} onChange={e => updateField('copyrightText', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Additional Footer Content</label>
                        <textarea value={form.footerContent || ''} onChange={e => updateField('footerContent', e.target.value)} rows={3} className={inputCls} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Settings'}</button>
                </div>
            </form>
        </div>
    );
}
