import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Perfil.css';
import { useAuth } from '../utils/AuthContext';

const Perfil = () => {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                email: user.email || '',
                rol: user.rol || '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [user, isEditing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            evaluatePasswordStrength(value);
        }
    };

    const evaluatePasswordStrength = (password) => {
        if (!password) {
            setPasswordStrength('');
            return;
        }
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) setPasswordStrength('weak');
        else if (strength <= 4) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage('Las contraseñas no coinciden');
            return;
        }
        if (formData.password && passwordStrength !== 'strong') {
            setMessage('La contraseña debe ser segura');
            return;
        }

        try {
            const { confirmPassword, ...dataToSend } = formData;
            if (!dataToSend.password) {
              delete dataToSend.password;
            }

            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/usuarios/${user.id}`, dataToSend);
            
            const updatedUser = { ...user, nombre: dataToSend.nombre, email: dataToSend.email };
            localStorage.setItem('user', JSON.stringify(updatedUser)); 

            setMessage('Perfil actualizado correctamente');
            setIsEditing(false);
            
            setTimeout(() => {
                setMessage('');
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error al actualizar:', error);
            setMessage(error.response?.data?.message || 'Error al actualizar el perfil');
        }
    };

    if (!user) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <>
            <div className="profile-container">
                <div className="profile-header">
                    <h1 className="profile-title">
                        <svg className="profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mi Perfil
                    </h1>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn-edit">
                            <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Perfil
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(false)} className="btn-cancel">
                            Cancelar
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`message-box ${message.includes('Error') || message.includes('no coinciden') || message.includes('segura') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="form-group">
                            <label htmlFor="nombre" className="form-label">Nombre</label>
                            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-input" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Correo Electrónico</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required />
                        </div>

                        <div className="form-group-password">
                            <label htmlFor="password" className="form-label">Nueva Contraseña (opcional)</label>
                            <div className="password-toggle">
                                <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleInputChange} className="password-toggle-input" placeholder="Dejar en blanco para mantener la actual" />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} />
                            </div>
                            {passwordStrength && <div className={`password-strength strength-${passwordStrength}`}>Fuerza: {passwordStrength}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
                            <div className="password-toggle">
                                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="password-toggle-input" placeholder="Repetir la nueva contraseña" />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="rol" className="form-label">Rol</label>
                            <input type="text" id="rol" name="rol" value={formData.rol} className="form-input" disabled />
                            <small className="help-text">Tu rol solo puede ser cambiado por un administrador.</small>
                        </div>

                        <button type="submit" className="btn-save">Guardar Cambios</button>
                    </form>
                ) : (
                    <div className="profile-details-grid">
                        <div className="info-group">
                            <p className="info-label">Nombre</p>
                            <p className="info-value">{user.nombre}</p>
                        </div>
                        <div className="info-group">
                            <p className="info-label">Correo Electrónico</p>
                            <p className="info-value">{user.email}</p>
                        </div>
                        <div className="info-group">
                            <p className="info-label">Rol</p>
                            <span className={`role-badge role-${user.rol}`}>{user.rol}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Perfil;