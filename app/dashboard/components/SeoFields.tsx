'use client';

interface SeoFieldsProps {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage: string;
    slug: string;
    onChange: (field: string, value: string) => void;
    onSlugGenerate?: () => void;
}

export default function SeoFields({
    metaTitle,
    metaDescription,
    metaKeywords,
    ogImage,
    slug,
    onChange,
    onSlugGenerate,
}: SeoFieldsProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                SEO Settings
            </h3>

            <div className="space-y-4">
                {/* Slug */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        URL Slug
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => onChange('slug', e.target.value)}
                            placeholder="url-friendly-slug"
                            className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        />
                        {onSlugGenerate && (
                            <button
                                type="button"
                                onClick={onSlugGenerate}
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            >
                                Auto
                            </button>
                        )}
                    </div>
                </div>

                {/* Meta Title */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Meta Title
                    </label>
                    <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => onChange('metaTitle', e.target.value)}
                        placeholder="Page title for search engines"
                        maxLength={70}
                        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-zinc-400">{metaTitle.length}/70 characters</p>
                </div>

                {/* Meta Description */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Meta Description
                    </label>
                    <textarea
                        value={metaDescription}
                        onChange={(e) => onChange('metaDescription', e.target.value)}
                        placeholder="Brief description for search engine results"
                        maxLength={160}
                        rows={3}
                        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-zinc-400">{metaDescription.length}/160 characters</p>
                </div>

                {/* Meta Keywords */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Meta Keywords
                    </label>
                    <input
                        type="text"
                        value={metaKeywords}
                        onChange={(e) => onChange('metaKeywords', e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                </div>

                {/* OG Image */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        OG Image URL
                    </label>
                    <input
                        type="text"
                        value={ogImage}
                        onChange={(e) => onChange('ogImage', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                </div>
            </div>
        </div>
    );
}
