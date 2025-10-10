import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/Perfil.css';
import Navbar from "../components/navbar";
import NotificationDropdown from "../components/NotificacionDropdown";
import DetalleIncidenciaModal from "../components/DetalleIncidenciaModal"; 

const Perfil = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rol: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || userData === 'undefined') {
            navigate('/login');
            return;
        }
        setUser(userData);
        setFormData({
            nombre: userData.nombre,
            email: userData.email,
            rol: userData.rol,
            password: '',
            confirmPassword: ''
        });
        setIsLoading(false);
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Evaluar la fuerza de la contraseña
        if (name === 'password') {
            evaluatePasswordStrength(value);
        }
    };

    const evaluatePasswordStrength = (password) => {
        if (password.length === 0) {
            setPasswordStrength('');
            return;
        }
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) {
            setPasswordStrength('weak');
        } else if (strength <= 3) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('strong');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar que las contraseñas coincidan si se proporcionaron
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage('Las contraseñas no coinciden');
            return;
        }

        // Validar la fuerza de la contraseña si se proporcionó
        if (formData.password && passwordStrength !== 'strong') {
            setMessage('La contraseña debe ser segura (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos)');
            return;
        }

        try {
            // Preparar datos para enviar (excluir confirmPassword)
            const { confirmPassword, ...dataToSend } = formData;
            
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/usuarios/${user.id}`, dataToSend);
            
            // Actualizar el usuario en localStorage (sin la contraseña)
            const updatedUser = { ...user, nombre: dataToSend.nombre, email: dataToSend.email, rol: dataToSend.rol };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage('Perfil actualizado correctamente');
            setIsEditing(false);
            
            // Limpiar formularios
            setFormData({
                nombre: updatedUser.nombre,
                email: updatedUser.email,
                rol: updatedUser.rol,
                password: '',
                confirmPassword: ''
            });
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error al actualizar:', error);
            setMessage(error.response?.data?.message || 'Error al actualizar el perfil');
        }
    };

    
    const handleOpenIncidenciaDetail = async (incidenciaId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/incidencias/${incidenciaId}`);
            
            setSelectedIncidencia(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error al cargar la incidencia para el modal:', error);
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedIncidencia(null); 
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="error-card">
                <h3 className="error-title">Sesión Expirada</h3>
                <p className="error-message">Por favor inicie sesión nuevamente</p>
                <button onClick={() => navigate('/login')} className="btn-retry">
                    Iniciar Sesión
                </button>
            </div>
        );
    }

    return (
        <div className="main-layout">
            <Navbar />
            <NotificationDropdown onOpenIncidenciaDetail={handleOpenIncidenciaDetail} />
            <div className="profile-container">
                <div className="profile-header">
                    <h1 className="profile-title">
                        <svg className="profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                            </path>
                        </svg>
                        Mi Perfil
                    </h1>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn-edit">
                            <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                </path>
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
                        
                        <div className="form-group-password">
                            <label htmlFor="password" className="form-label">Nueva Contraseña (opcional)</label>
                            <div className="password-toggle">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="password-toggle-input"
                                    placeholder="Dejar en blanco para mantener la actual"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {showPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                            {passwordStrength && (
                                <div className={`password-strength strength-${passwordStrength}`}>
                                    Fuerza: {passwordStrength === 'weak' ? 'Débil' : passwordStrength === 'medium' ? 'Media' : 'Fuerte'}
                                </div>
                            )}
                            <div className="password-requirements">
                                Deje en blanco para mantener la contraseña actual
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
                            <div className="password-toggle">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="password-toggle-input"
                                    placeholder="Repetir la nueva contraseña"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {showConfirmPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="rol" className="form-label">Rol</label>
                            <select
                                id="rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={user.rol !== 'administrador'}
                            >
                                <option value="usuario">Usuario</option>
                                <option value="administrador">Administrador</option>
                            </select>
                            {user.rol !== 'administrador' && (
                                <small className="help-text">Solo los administradores pueden cambiar su rol</small>
                            )}
                        </div>
                        
                        <button type="submit" className="btn-save">
                            Guardar Cambios
                        </button>
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
                            <span className={`role-badge role-${user.rol}`}>
                                {user.rol}
                            </span>
                        </div>
                    </div>
                )}
            </div>
            {isModalOpen && selectedIncidencia && (
                <DetalleIncidenciaModal 
                    incidencia={selectedIncidencia} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default Perfil;