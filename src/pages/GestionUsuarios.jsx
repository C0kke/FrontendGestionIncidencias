import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import './styles/GestionUsuarios.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationDropdown from "../components/NotificacionDropdown";
import DetalleIncidenciaModal from "../components/DetalleIncidenciaModal"; 
import EditarUsuarioModal from "../components/EditarUsuarioModal";
import CrearUsuarioModal from "../components/CrearUsuarioModal";

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [sortField, setSortField] = useState('nombre');
    const [sortDirection, setSortDirection] = useState('asc');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user || user === 'undefined') {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(user);
            if (userData.rol !== 'administrador') {
                navigate('/');
                return;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
            return;
        }
    }, [navigate]);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios`);
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setMensaje('Error al cargar los usuarios. Consulta la consola.');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedUsuarios = [...usuarios].sort((a, b) => {
        const aValue = a[sortField]?.toString().toLowerCase() || '';
        const bValue = b[sortField]?.toString().toLowerCase() || '';
        
        if (sortDirection === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleOpenEditModal = (usuario) => {
        setSelectedUsuario(usuario);
        setIsModalOpen(true);
    };
    

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUsuario(null);
        setSelectedIncidencia(null); 
    };

    const handleUpdateUsuario = async (updatedUsuario) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/${updatedUsuario.id}`,
                updatedUsuario
            );
            
            setUsuarios(usuarios.map(u => 
                u.id === updatedUsuario.id ? response.data : u
            ));
            
            setMensaje('Usuario actualizado correctamente');
            handleCloseModal();
            fetchUsuarios();
            setTimeout(() => setMensaje(''), 3000);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            setMensaje('Error al actualizar el usuario. Consulta la consola.');
        }
    };

    const handleCreateUsuario = async (newUsuario) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios`,
                newUsuario
            );
            
            setUsuarios([...usuarios, response.data]);
            
            setMensaje('Usuario creado correctamente');
            handleCloseCreateModal();
            fetchUsuarios();
            setTimeout(() => setMensaje(''), 3000);
        } catch (error) {
            console.error("Error al crear usuario:", error);
            if (error.response?.status === 409) {
                setMensaje('Error: Ya existe un usuario con ese email.');
            } else {
                setMensaje('Error al crear el usuario. Consulta la consola.');
            }
        }
    };

    const handleDeleteUsuario = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/usuarios/${id}`);
            setUsuarios(usuarios.filter(u => u.id !== id));
            setMensaje("Usuario eliminado correctamente");
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            setMensaje("Error al eliminar el usuario. Consulta la consola.");
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

    const getSortIcon = (field) => {
        if (sortField !== field) return '';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const getRoleBadge = (rol) => {
        const roleClasses = {
            'administrador': 'admin-badge',
            'gestor' : 'manager-badge',
            'reportador' : 'reporter-badge',
            'lector': 'lector-badge'
        };
        return roleClasses[rol] || 'lector-badge';
    };

    return (
        <div className="main-layout">
            <Navbar />
            <NotificationDropdown onOpenIncidenciaDetail={handleOpenIncidenciaDetail} />
            <div className="content-area usuarios-container">
                <div className="usuarios-header">
                    <div className="header-text">
                        <h1 className="usuarios-title">Gestión de Usuarios</h1>
                        <p className="usuarios-subtitle">
                            Administra los usuarios del sistema. Usa los botones para editar o eliminar datos.
                        </p>
                    </div>
                </div>

                {mensaje && (
                    <div className={`message-box ${mensaje.includes('Error') ? 'error' : 'success'}`}>
                        {mensaje}
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">
                        <p>Cargando usuarios...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="usuarios-table">
                            <thead>
                                <tr>
                                    <th 
                                        className="sortable-header" 
                                        onClick={() => handleSort('nombre')}
                                    >
                                        Nombre {getSortIcon('nombre')}
                                    </th>
                                    <th 
                                        className="sortable-header" 
                                        onClick={() => handleSort('email')}
                                    >
                                        Email {getSortIcon('email')}
                                    </th>
                                    <th 
                                        className="sortable-header" 
                                        onClick={() => handleSort('rol')}
                                    >
                                        Rol {getSortIcon('rol')}
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="no-data">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    sortedUsuarios.map((usuario) => (
                                        <tr key={usuario.id} className="usuario-row">
                                            <td className="usuario-nombre">{usuario.nombre}</td>
                                            <td className="usuario-email">{usuario.email}</td>
                                            <td>
                                                <span className={`role-badge ${getRoleBadge(usuario.rol)}`}>
                                                    {usuario.rol}
                                                </span>
                                            </td>
                                            <td className="actions-container">
                                                <button 
                                                    className="edit-button action-button"
                                                    onClick={() => handleOpenEditModal(usuario)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="delete-button action-button"
                                                    onClick={() => handleDeleteUsuario(usuario.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="table-footer">
                    <button className="create-user-button" onClick={handleOpenCreateModal}>
                        <span className="button-icon">+</span>
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            {isModalOpen && selectedUsuario && (
                <EditarUsuarioModal 
                    usuario={selectedUsuario} 
                    onClose={handleCloseModal}
                    onUpdate={handleUpdateUsuario}
                />
            )}

            {isModalOpen && selectedIncidencia && (
                <DetalleIncidenciaModal 
                    incidencia={selectedIncidencia} 
                    onClose={handleCloseModal} 
                />
            )}

            {isCreateModalOpen && (
                <CrearUsuarioModal 
                    onClose={handleCloseCreateModal}
                    onCreate={handleCreateUsuario}
                />
            )}
        </div>
    );
};

export default GestionUsuarios;