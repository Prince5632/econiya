'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineArrowsUpDown } from 'react-icons/hi2';

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox';
    required: boolean;
    options?: string; // comma-separated for select
}

export default function NewRfqFormPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'message', label: 'Additional Requirements', type: 'textarea', required: false },
    ]);

    function addField() {
        setFields([...fields, { name: '', label: '', type: 'text', required: false }]);
    }

    function updateField(index: number, key: keyof FormField, value: any) {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        // Auto-generate name from label
        if (key === 'label') {
            updated[index].name = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        }
        setFields(updated);
    }

    function removeField(index: number) {
        setFields(fields.filter((_, i) => i !== index));
    }

    function moveField(index: number, direction: 'up' | 'down') {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fields.length) return;
        const updated = [...fields];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setFields(updated);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');

        const processedFields = fields.map(f => ({
            ...f,
            options: f.type === 'select' && f.options ? f.options.split(',').map(o => o.trim()) : undefined,
        }));

        const res = await fetch('/api/rfq-forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, fields: processedFields }),
        });

        if (res.ok) router.push('/dashboard/rfq-forms');
        else { const data = await res.json(); setError(data.error); setSaving(false); }
    }

    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Create RFQ Form</h1>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Form Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Mobile Device Quote Request" className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    </div>
                </div>

                {/* Dynamic Fields Builder */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Form Fields</h3>
                        <button type="button" onClick={addField} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                            <HiOutlinePlus className="h-3.5 w-3.5" /> Add Field
                        </button>
                    </div>

                    <p className="mb-4 text-xs text-zinc-400">Note: Name, Email, Phone, and Company fields are automatically included in all RFQ forms.</p>

                    <div className="space-y-3">
                        {fields.map((field, idx) => (
                            <div key={idx} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="flex flex-col gap-1 pt-1">
                                    <button type="button" onClick={() => moveField(idx, 'up')} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"><HiOutlineArrowsUpDown className="h-3 w-3" /></button>
                                </div>
                                <div className="grid flex-1 grid-cols-4 gap-3">
                                    <div className="col-span-2">
                                        <input type="text" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} placeholder="Field label" className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
                                    </div>
                                    <div>
                                        <select value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
                                            <option value="text">Text</option>
                                            <option value="email">Email</option>
                                            <option value="number">Number</option>
                                            <option value="textarea">Textarea</option>
                                            <option value="select">Dropdown</option>
                                            <option value="checkbox">Checkbox</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                                            <input type="checkbox" checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} className="h-3.5 w-3.5 rounded border-zinc-300 text-indigo-600" />
                                            Required
                                        </label>
                                        <button type="button" onClick={() => removeField(idx)} className="ml-auto text-red-500 hover:text-red-700"><HiOutlineTrash className="h-4 w-4" /></button>
                                    </div>
                                </div>
                                {field.type === 'select' && (
                                    <div className="col-span-4 mt-1 w-full">
                                        <input type="text" value={field.options || ''} onChange={e => updateField(idx, 'options', e.target.value)} placeholder="Option1, Option2, Option3" className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create Form'}</button>
                </div>
            </form>
        </div>
    );
}
