import React, { useState, useEffect } from 'react';
import { kbService } from '../services';
import BaseModal from './BaseModal';

interface KBModalProps {
    article: any | null;
    onClose: () => void;
    onSave: () => void;
    viewMode?: boolean;
}

export const KBModal: React.FC<KBModalProps> = ({ article, onClose, onSave, viewMode = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'geral',
        tags: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title || '',
                content: article.content || '',
                category: article.category || 'geral',
                tags: article.tags ? article.tags.join(', ') : ''
            });
        }
    }, [article]);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
        if (!formData.content.trim()) newErrors.content = 'Conteúdo é obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            if (article) {
                await kbService.update(article._id, dataToSend);
            } else {
                await kbService.create(dataToSend);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar artigo:', error);
            alert('Erro ao salvar artigo');
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <>
            <button type="button" className="btn-secondary" onClick={onClose}>
                {viewMode ? 'Fechar' : 'Cancelar'}
            </button>
            {!viewMode && (
                <button
                    type="button"
                    className="btn-primary"
                    disabled={loading}
                    onClick={() => handleSubmit()}
                    style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Salvando...' : article ? 'Atualizar Artigo' : 'Publicar Artigo'}
                </button>
            )}
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={viewMode ? article?.title : (article ? 'Editar Artigo' : 'Novo Artigo')}
            footer={modalFooter}
        >
            {viewMode ? (
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '6px 14px', background: '#ecfdf5', borderRadius: '20px', fontSize: '12px', color: '#059669', fontWeight: '700', border: '1px solid #d1fae5', textTransform: 'uppercase' }}>
                            📁 {formData.category}
                        </span>
                        {formData.tags && formData.tags.split(',').map((tag, i) => (
                            <span key={i} style={{ padding: '6px 14px', background: '#eff6ff', borderRadius: '20px', fontSize: '12px', color: '#2563eb', fontWeight: '700', border: '1px solid #dbeafe' }}>
                                # {tag.trim()}
                            </span>
                        ))}
                    </div>
                    <div style={{
                        background: '#ffffff',
                        padding: '24px',
                        borderRadius: '12px',
                        lineHeight: '1.8',
                        fontSize: '16px',
                        color: '#334155',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #f1f5f9',
                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        {formData.content}
                    </div>
                </div>
            ) : (
                <>
                    <div className="form-group">
                        <label className="required">Título do Artigo</label>
                        <input
                            type="text"
                            className={errors.title ? 'field-error' : ''}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Como configurar a impressora, Procedimento de backup, etc"
                        />
                        {errors.title && <span className="error-msg">{errors.title}</span>}
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Categoria</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="geral">Geral</option>
                                <option value="hardware">Hardware</option>
                                <option value="software">Software</option>
                                <option value="rede">Rede</option>
                                <option value="procedimentos">Procedimentos</option>
                                <option value="campo">Operação de Campo</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tags (separadas por vírgula)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="ex: wifi, senha, impressora"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="required">Conteúdo do Artigo</label>
                        <textarea
                            className={errors.content ? 'field-error' : ''}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={12}
                            placeholder="Descreva passo a passo o conhecimento que deseja compartilhar..."
                            style={{ resize: 'vertical', fontFamily: 'monospace' }}
                        />
                        {errors.content && <span className="error-msg">{errors.content}</span>}
                    </div>
                </>
            )}
        </BaseModal>
    );
};
