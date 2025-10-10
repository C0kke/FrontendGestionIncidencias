import React, { useState, useEffect } from 'react';
import './styles/EditarUsuarioModal.css';

const EditarUsuarioModal = ({ usuario, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'usuario'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                password: '', // Siempre vacío por seguridad
                rol: usuario.rol || 'usuario'
            });
        }
    }, [usuario]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                rol: checked ? 'administrador' : 'usuario'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones básicas
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            setLoading(false);
            return;
        }

        if (!formData.email.trim()) {
            setError('El correo es requerido');
            setLoading(false);
            return;
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('El formato del correo no es válido');
            setLoading(false);
            return;
        }

        try {
            const dataToSend = {
                id: usuario.id,
                nombre: formData.nombre.trim(),
                email: formData.email.trim(),
                rol: formData.rol
            };

            if (!formData.password || formData.password.trim().length === 0) {
                dataToSend.password = usuario.password;
            } else {
                if (formData.password.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres');
                    setLoading(false);
                    return;
                }
                dataToSend.password = formData.password.trim();
            }

            await onUpdate(dataToSend);
        } catch (error) {
            setError('Error al actualizar el usuario');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-container usuario-modal">
                <div className="modal-header">
                    <h2>Editar Usuario</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Nueva Contraseña
                            <span className="field-hint">(Dejar vacío para mantener la actual)</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Ingresa nueva contraseña (opcional)"
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="esAdministrador"
                                name="esAdministrador"
                                checked={formData.rol === 'administrador'}
                                onChange={handleInputChange}
                                className="checkbox-input"
                            />
                            <label htmlFor="esAdministrador" className="checkbox-label">
                                Es Administrador
                            </label>
                        </div>
                        <div className="role-info">
                            Rol actual: <span className={`role-badge ${formData.rol === 'administrador' ? 'admin-badge' : 'user-badge'}`}>
                                {formData.rol}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="save-button"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarUsuarioModal;