'use client';

import { useState, useEffect } from 'react';

interface GetQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: { id: string; name: string }[];
    defaultCategory?: string;
    productName?: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function GetQuoteModal({ isOpen, onClose, categories, defaultCategory, productName }: GetQuoteModalProps) {
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        category: defaultCategory || '',
        message: '',
    });

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    function updateField(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function resetForm() {
        setForm({ name: '', email: '', phone: '', company: '', category: '', message: '' });
        setSubmitState('idle');
        setErrorMessage('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitState('submitting');
        setErrorMessage('');

        try {
            const res = await fetch('/api/quote-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone || null,
                    company: form.company || null,
                    category: form.category,
                    productName: productName || null,
                    message: form.message || null,
                }),
            });

            if (res.ok) {
                setSubmitState('success');
            } else {
                const data = await res.json();
                setErrorMessage(data.error || 'Failed to submit request');
                setSubmitState('error');
            }
        } catch {
            setErrorMessage('Network error. Please try again.');
            setSubmitState('error');
        }
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="gq-modal-overlay" onClick={handleClose}>
            <div className="gq-modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="gq-modal-header">
                    <div>
                        <h2 className="gq-modal-title">Get a Quote</h2>
                        <p className="gq-modal-subtitle">{productName ? `for ${productName}` : "Tell us about your requirements and we'll get back to you"}</p>
                    </div>
                    <button onClick={handleClose} className="gq-modal-close" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Success State */}
                {submitState === 'success' ? (
                    <div className="gq-success-state">
                        <div className="gq-success-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h3>Quote Request Submitted!</h3>
                        <p>Thank you for your interest. Our team will review your request and get back to you within 24-48 hours.</p>
                        <button onClick={handleClose} className="gq-btn-primary">Close</button>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="gq-form">
                        {/* Error Message */}
                        {submitState === 'error' && (
                            <div className="gq-error-msg">{errorMessage}</div>
                        )}

                        {/* Contact Info Section */}
                        <div className="gq-form-section">
                            <h4 className="gq-form-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Contact Information
                            </h4>
                            <div className="gq-form-grid">
                                <div className="gq-form-field">
                                    <label>Full Name <span className="gq-required">*</span></label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => updateField('name', e.target.value)}
                                        required
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="gq-form-field">
                                    <label>Email Address <span className="gq-required">*</span></label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => updateField('email', e.target.value)}
                                        required
                                        placeholder="you@company.com"
                                    />
                                </div>
                                <div className="gq-form-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => updateField('phone', e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div className="gq-form-field">
                                    <label>Company</label>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={e => updateField('company', e.target.value)}
                                        placeholder="Your company name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quote Details Section */}
                        <div className="gq-form-section">
                            <h4 className="gq-form-section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                Quote Details
                            </h4>
                            <div className="gq-form-grid">
                                <div className="gq-form-field gq-field-full">
                                    <label>Category <span className="gq-required">*</span></label>
                                    <select
                                        value={form.category}
                                        onChange={e => updateField('category', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="gq-form-field gq-field-full">
                                    <label>Message / Requirements</label>
                                    <textarea
                                        value={form.message}
                                        onChange={e => updateField('message', e.target.value)}
                                        placeholder="Tell us about your requirements, quantities, specifications..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="gq-form-actions">
                            <button type="button" onClick={handleClose} className="gq-btn-secondary">Cancel</button>
                            <button type="submit" disabled={submitState === 'submitting'} className="gq-btn-primary">
                                {submitState === 'submitting' ? (
                                    <>
                                        <span className="gq-spinner" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
