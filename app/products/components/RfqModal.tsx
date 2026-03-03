'use client';

import { useState } from 'react';

interface RfqField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
}

interface RfqFormConfig {
    id: string;
    name: string;
    description?: string;
    fields: RfqField[];
}

interface RfqModalProps {
    rfqForm: RfqFormConfig;
    productName: string;
    categoryName?: string;
    isOpen: boolean;
    onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function RfqModal({ rfqForm, productName, categoryName, isOpen, onClose }: RfqModalProps) {
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Standard contact fields
    const [contact, setContact] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
    });

    // Dynamic form data
    const [formData, setFormData] = useState<Record<string, any>>({});

    function updateContact(field: string, value: string) {
        setContact(prev => ({ ...prev, [field]: value }));
    }

    function updateFormData(field: string, value: any) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    function resetForm() {
        setContact({ name: '', email: '', phone: '', company: '' });
        setFormData({});
        setSubmitState('idle');
        setErrorMessage('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitState('submitting');
        setErrorMessage('');

        try {
            let res: Response;

            if (rfqForm.id) {
                // Custom RFQ form — submit to rfq-submissions
                // Extract name/email from the dynamic form fields
                res = await fetch('/api/rfq-submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        formId: rfqForm.id,
                        name: formData.name || formData.full_name || 'N/A',
                        email: formData.email || 'N/A',
                        phone: formData.phone || null,
                        company: formData.company || null,
                        formData: {
                            ...formData,
                            _productName: productName,
                        },
                    }),
                });
            } else {
                // Default form — submit to quote-requests with product info
                res = await fetch('/api/quote-requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: contact.name,
                        email: contact.email,
                        phone: contact.phone || null,
                        company: contact.company || null,
                        category: categoryName || 'General',
                        productName: productName,
                        message: formData.requirements || formData.message || null,
                    }),
                });
            }

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

    const fields: RfqField[] = Array.isArray(rfqForm.fields) ? rfqForm.fields : [];

    return (
        <div className="rfq-modal-overlay" onClick={handleClose}>
            <div className="rfq-modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="rfq-modal-header">
                    <div>
                        <h2 className="rfq-modal-title">Request a Quote</h2>
                        <p className="rfq-modal-subtitle">for {productName}</p>
                    </div>
                    <button onClick={handleClose} className="rfq-modal-close" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Success State */}
                {submitState === 'success' ? (
                    <div className="rfq-success-state">
                        <div className="rfq-success-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h3>Quote Request Submitted!</h3>
                        <p>Thank you for your interest. Our team will review your request and get back to you within 24-48 hours.</p>
                        <button onClick={handleClose} className="rfq-btn-primary">Close</button>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="rfq-form">
                        {/* Error Message */}
                        {submitState === 'error' && (
                            <div className="rfq-error-msg">{errorMessage}</div>
                        )}

                        {/* Contact Info Section — only for default form (no custom RFQ) */}
                        {!rfqForm.id && (
                            <div className="rfq-form-section">
                                <h4 className="rfq-form-section-title">Contact Information</h4>
                                <div className="rfq-form-grid">
                                    <div className="rfq-form-field">
                                        <label>Full Name <span className="rfq-required">*</span></label>
                                        <input
                                            type="text"
                                            value={contact.name}
                                            onChange={e => updateContact('name', e.target.value)}
                                            required
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="rfq-form-field">
                                        <label>Email Address <span className="rfq-required">*</span></label>
                                        <input
                                            type="email"
                                            value={contact.email}
                                            onChange={e => updateContact('email', e.target.value)}
                                            required
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                    <div className="rfq-form-field">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={contact.phone}
                                            onChange={e => updateContact('phone', e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="rfq-form-field">
                                        <label>Company</label>
                                        <input
                                            type="text"
                                            value={contact.company}
                                            onChange={e => updateContact('company', e.target.value)}
                                            placeholder="Your company name"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Fields Section */}
                        {fields.length > 0 && (
                            <div className="rfq-form-section">
                                {!rfqForm.id && <h4 className="rfq-form-section-title">Quote Details</h4>}
                                <div className="rfq-form-grid">
                                    {fields.map((field, idx) => (
                                        <div key={idx} className={`rfq-form-field ${field.type === 'textarea' ? 'rfq-field-full' : ''}`}>
                                            <label>
                                                {field.label}
                                                {field.required && <span className="rfq-required"> *</span>}
                                            </label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    value={formData[field.name] || ''}
                                                    onChange={e => updateFormData(field.name, e.target.value)}
                                                    required={field.required}
                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    rows={3}
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    value={formData[field.name] || ''}
                                                    onChange={e => updateFormData(field.name, e.target.value)}
                                                    required={field.required}
                                                >
                                                    <option value="">Select {field.label.toLowerCase()}</option>
                                                    {(field.options || []).map((opt, i) => (
                                                        <option key={i} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'checkbox' ? (
                                                <label className="rfq-checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData[field.name] || false}
                                                        onChange={e => updateFormData(field.name, e.target.checked)}
                                                    />
                                                    <span>{field.label}</span>
                                                </label>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={formData[field.name] || ''}
                                                    onChange={e => updateFormData(field.name, e.target.value)}
                                                    required={field.required}
                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="rfq-form-actions">
                            <button type="button" onClick={handleClose} className="rfq-btn-secondary">Cancel</button>
                            <button type="submit" disabled={submitState === 'submitting'} className="rfq-btn-primary">
                                {submitState === 'submitting' ? (
                                    <>
                                        <span className="rfq-spinner" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
