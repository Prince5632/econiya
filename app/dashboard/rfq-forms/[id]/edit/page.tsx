'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineArrowsUpDown } from 'react-icons/hi2';

interface FormField {
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string | string[];
}

export default function EditRfqFormPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);

    useEffect(() => {
        fetch(`/api/rfq-forms/${id}`).then(r => r.json()).then(data => {
            setName(data.name || '');
            setDescription(data.description || '');
            const loadedFields = (data.fields as FormField[]) || [];
            setFields(loadedFields.map(f => ({
                ...f,
                options: Array.isArray(f.options) ? f.options.join(', ') : (f.options || ''),
            })));
            setLoading(false);
        });
    }, [id]);

    function addField() { setFields([...fields, { name: '', label: '', type: 'text', required: false }]); }
    function updateField(index: number, key: keyof FormField, value: any) {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        if (key === 'label') updated[index].name = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        setFields(updated);
    }
    function removeField(index: number) { setFields(fields.filter((_, i) => i !== index)); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setSaving(true); setError('');
        const processedFields = fields.map(f => ({
            ...f,
            options: f.type === 'select' && typeof f.options === 'string' ? f.options.split(',').map(o => o.trim()) : undefined,
        }));
        const res = await fetch(`/api/rfq-forms/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description, fields: processedFields }) });
        if (res.ok) router.push('/dashboard/rfq-forms');
        else { const data = await res.json(); setError(data.error); setSaving(false); }
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Edit RFQ Form</h1>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <div><label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Form Name *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" /></div>
                    <div><label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" /></div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Form Fields</h3>
                        <button type="button" onClick={addField} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"><HiOutlinePlus className="h-3.5 w-3.5" /> Add Field</button>
                    </div>
                    <div className="space-y-3">
                        {fields.map((field, idx) => (
                            <div key={idx} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="grid flex-1 grid-cols-4 gap-3">
                                    <div className="col-span-2"><input type="text" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} placeholder="Label" className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" /></div>
                                    <div><select value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"><option value="text">Text</option><option value="email">Email</option><option value="number">Number</option><option value="textarea">Textarea</option><option value="select">Dropdown</option><option value="checkbox">Checkbox</option></select></div>
                                    <div className="flex items-center gap-2"><label className="flex items-center gap-1.5 text-xs text-zinc-500"><input type="checkbox" checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} className="h-3.5 w-3.5 rounded border-zinc-300 text-indigo-600" />Req</label><button type="button" onClick={() => removeField(idx)} className="ml-auto text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Update Form'}</button>
                </div>
            </form>
        </div>
    );
}
