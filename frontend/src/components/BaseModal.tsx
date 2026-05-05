import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = '800px'
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth }}
            >
                <div className="modal-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            color: '#6b7280',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{
                    padding: '24px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer" style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        background: '#f9fafb'
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BaseModal;
