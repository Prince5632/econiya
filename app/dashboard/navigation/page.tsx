'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineChevronRight,
    HiOutlineCheck,
    HiOutlineXMark,
} from 'react-icons/hi2';

interface NavItem {
    id: string;
    label: string;
    url: string;
    order: number;
    target: string;
    parentId: string | null;
    children?: NavItem[];
}

interface NavMenu {
    id: string;
    name: string;
    items: NavItem[];
}

export default function NavigationPage() {
    const [menus, setMenus] = useState<NavMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMenuName, setNewMenuName] = useState('');
    const [creatingMenu, setCreatingMenu] = useState(false);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [itemForm, setItemForm] = useState({ label: '', url: '', target: '_self' });
    const [addingToMenu, setAddingToMenu] = useState<string | null>(null);
    const [addingSubItem, setAddingSubItem] = useState<string | null>(null);
    const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);

    const fetchMenus = useCallback(async () => {
        try {
            const res = await fetch('/api/navigation');
            const data = await res.json();
            setMenus(Array.isArray(data) ? data : []);
        } catch {
            setMenus([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    async function createMenu() {
        if (!newMenuName.trim()) return;
        setCreatingMenu(true);
        await fetch('/api/navigation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newMenuName.toLowerCase().replace(/\s+/g, '-') }),
        });
        setNewMenuName('');
        setCreatingMenu(false);
        fetchMenus();
    }

    async function addItem(menuId: string, parentId: string | null = null) {
        if (!itemForm.label.trim()) return;
        await fetch(`/api/navigation/${menuId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...itemForm,
                parentId,
                order: 0,
            }),
        });
        setItemForm({ label: '', url: '', target: '_self' });
        setAddingToMenu(null);
        setAddingSubItem(null);
        fetchMenus();
    }

    async function updateItem(itemId: string) {
        await fetch(`/api/navigation/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemForm),
        });
        setEditingItem(null);
        setItemForm({ label: '', url: '', target: '_self' });
        fetchMenus();
    }

    async function deleteItem(itemId: string) {
        await fetch(`/api/navigation/items/${itemId}`, { method: 'DELETE' });
        fetchMenus();
    }

    async function deleteMenu(menuId: string) {
        await fetch(`/api/navigation?id=${menuId}`, { method: 'DELETE' });
        setDeletingMenuId(null);
        fetchMenus();
    }

    function startEdit(item: NavItem) {
        setEditingItem(item.id);
        setItemForm({ label: item.label, url: item.url, target: item.target });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Navigation</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Manage header, footer, and other navigation menus
                    </p>
                </div>
            </div>

            {/* Create Menu */}
            <div className="mb-6 flex gap-3">
                <input
                    type="text"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="New menu name (e.g. header, footer)"
                    className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && createMenu()}
                />
                <button
                    onClick={createMenu}
                    disabled={creatingMenu || !newMenuName.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                    <HiOutlinePlus className="h-4 w-4" />
                    Create Menu
                </button>
            </div>

            {/* Menu List */}
            <div className="space-y-6">
                {menus.length === 0 && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
                        <p className="text-sm text-zinc-400">
                            No menus yet. Create &quot;header&quot; and &quot;footer&quot; menus to get started.
                        </p>
                    </div>
                )}

                {menus.map((menu) => (
                    <div
                        key={menu.id}
                        className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        {/* Menu Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold uppercase text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    {menu.name}
                                </span>
                                <span className="text-xs text-zinc-400">
                                    {menu.items.length} items
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setAddingToMenu(addingToMenu === menu.id ? null : menu.id);
                                        setItemForm({ label: '', url: '', target: '_self' });
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                                >
                                    <HiOutlinePlus className="h-3.5 w-3.5" />
                                    Add Item
                                </button>
                                {deletingMenuId === menu.id ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-red-500">Delete menu?</span>
                                        <button onClick={() => deleteMenu(menu.id)} className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">Yes</button>
                                        <button onClick={() => setDeletingMenuId(null)} className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400">No</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeletingMenuId(menu.id)}
                                        className="rounded-md p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        title="Delete menu"
                                    >
                                        <HiOutlineTrash className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Add Item Form */}
                        {addingToMenu === menu.id && (
                            <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={itemForm.label}
                                        onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                                        placeholder="Label"
                                        className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={itemForm.url}
                                        onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                                        placeholder="URL (e.g. /about)"
                                        className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    />
                                    <select
                                        value={itemForm.target}
                                        onChange={(e) => setItemForm({ ...itemForm, target: e.target.value })}
                                        className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="_self">Same tab</option>
                                        <option value="_blank">New tab</option>
                                    </select>
                                    <button
                                        onClick={() => addItem(menu.id)}
                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        <HiOutlineCheck className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setAddingToMenu(null)}
                                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400"
                                    >
                                        <HiOutlineXMark className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Items List */}
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {menu.items.map((item) => (
                                <div key={item.id}>
                                    {/* Main Item */}
                                    <div className="flex items-center justify-between px-5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        {editingItem === item.id ? (
                                            <div className="flex flex-1 gap-2">
                                                <input
                                                    type="text"
                                                    value={itemForm.label}
                                                    onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                                                    className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={itemForm.url}
                                                    onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                                                    className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                                />
                                                <button
                                                    onClick={() => updateItem(item.id)}
                                                    className="rounded-md bg-indigo-600 px-2.5 py-1 text-white"
                                                >
                                                    <HiOutlineCheck className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem(null)}
                                                    className="rounded-md border border-zinc-300 px-2.5 py-1 dark:border-zinc-600"
                                                >
                                                    <HiOutlineXMark className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {item.label}
                                                    </span>
                                                    <span className="text-xs text-zinc-400">{item.url}</span>
                                                    {item.children && item.children.length > 0 && (
                                                        <span className="flex items-center gap-0.5 text-xs text-zinc-400">
                                                            <HiOutlineChevronRight className="h-3 w-3" />
                                                            {item.children.length} sub-items
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setAddingSubItem(addingSubItem === item.id ? null : item.id);
                                                            setItemForm({ label: '', url: '', target: '_self' });
                                                        }}
                                                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                        title="Add sub-item"
                                                    >
                                                        <HiOutlinePlus className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    >
                                                        <HiOutlinePencilSquare className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteItem(item.id)}
                                                        className="rounded-md p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    >
                                                        <HiOutlineTrash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Add Sub-Item Form */}
                                    {addingSubItem === item.id && (
                                        <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-2 pl-10 dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={itemForm.label}
                                                    onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                                                    placeholder="Sub-item label"
                                                    className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={itemForm.url}
                                                    onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                                                    placeholder="URL"
                                                    className="flex-1 rounded-md border border-zinc-300 px-2.5 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                                />
                                                <button
                                                    onClick={() => addItem(menu.id, item.id)}
                                                    className="rounded-md bg-indigo-600 px-2.5 py-1 text-white text-sm"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => setAddingSubItem(null)}
                                                    className="rounded-md border border-zinc-300 px-2.5 py-1 text-sm dark:border-zinc-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Children */}
                                    {item.children && item.children.length > 0 && (
                                        <div className="border-t border-zinc-100 dark:border-zinc-800">
                                            {item.children.map((child) => (
                                                <div
                                                    key={child.id}
                                                    className="flex items-center justify-between px-5 py-2 pl-10 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                                >
                                                    {editingItem === child.id ? (
                                                        <div className="flex flex-1 gap-2">
                                                            <input
                                                                type="text"
                                                                value={itemForm.label}
                                                                onChange={(e) =>
                                                                    setItemForm({ ...itemForm, label: e.target.value })
                                                                }
                                                                className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={itemForm.url}
                                                                onChange={(e) =>
                                                                    setItemForm({ ...itemForm, url: e.target.value })
                                                                }
                                                                className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                                            />
                                                            <button
                                                                onClick={() => updateItem(child.id)}
                                                                className="rounded-md bg-indigo-600 px-2 py-1 text-white"
                                                            >
                                                                <HiOutlineCheck className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingItem(null)}
                                                                className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-600"
                                                            >
                                                                <HiOutlineXMark className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-zinc-300 dark:text-zinc-600">└</span>
                                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                                    {child.label}
                                                                </span>
                                                                <span className="text-xs text-zinc-400">{child.url}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => startEdit(child)}
                                                                    className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                                >
                                                                    <HiOutlinePencilSquare className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteItem(child.id)}
                                                                    className="rounded-md p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                                >
                                                                    <HiOutlineTrash className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {menu.items.length === 0 && (
                                <div className="px-5 py-8 text-center text-sm text-zinc-400">
                                    No items in this menu yet. Click &quot;Add Item&quot; above to get started.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
