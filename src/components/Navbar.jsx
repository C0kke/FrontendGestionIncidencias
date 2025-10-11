import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../utils/AuthContext';
import './styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const rol = user?.rol;
    
    const handleLogout = () => {
        logout(); 
    }   

    return (
        <nav className="sidebar-nav">
            <div className="nav-menu">
                <Link to="/inicio" className="nav-button">Inicio</Link>
                <Link to="/reporte" className="nav-button">Reportar Incidente</Link>
                <Link to="/tareas" className="nav-button">Ver Tareas</Link>
                <Link to="/perfil" className="nav-button">Gestionar Perfil</Link>
                <Link to="/estadisticas" className="nav-button">Ver Estadísticas</Link>
                
                {rol === "administrador" && (
                    <>
                        <Link to="/gestion-usuarios" className="nav-button">Gestionar Usuarios</Link>
                        <Link to="/gestion-incidencias" className="nav-button">Gestionar Incidencias</Link>
                    </>
                )}
            </div>

            <div className="nav-footer">
                <button className="nav-button logout-button" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default Navbar;