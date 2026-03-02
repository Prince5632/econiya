'use client';

import { useState } from 'react';

interface SpecsTabsProps {
    specs: Record<string, Record<string, string>> | null;
}

export default function SpecsTabs({ specs }: SpecsTabsProps) {
    const tabs = specs && typeof specs === 'object' ? Object.keys(specs) : [];
    const [activeTab, setActiveTab] = useState(0);

    if (tabs.length === 0) return null;

    const activeTabData = specs![tabs[activeTab]];
    const entries = activeTabData && typeof activeTabData === 'object' ? Object.entries(activeTabData) : [];

    return (
        <section className="product-specs-section product-section-animate">
            <div className="product-specs-tabs">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(idx)}
                        className={`product-specs-tab ${idx === activeTab ? 'active' : ''}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="product-specs-table">
                {entries.length > 0 ? (
                    <table>
                        <tbody>
                            {entries.map(([key, value], idx) => (
                                <tr key={key} className={idx % 2 === 0 ? 'even' : 'odd'}>
                                    <td className="spec-label">{key}</td>
                                    <td className="spec-value">{value || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="specs-empty">No specifications available for this tab.</div>
                )}
            </div>
        </section>
    );
}
