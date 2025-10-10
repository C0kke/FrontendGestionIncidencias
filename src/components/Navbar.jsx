import React from "react";
import { Link } from "react-router-dom";
import './styles/Navbar.css';

const Navbar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const rol = user?.rol;
    
    const handleLogout = () => {
        localStorage.removeItem('user');
    }   

    return (
        <nav className="sidebar-nav">
            <div className="nav-menu">
                <Link to="/inicio" className="nav-button">
                    Inicio
                </Link>
                <Link to="/reporte" className="nav-button">
                    Reportar Incidente
                </Link>
                <Link to="/tareas" className="nav-button">
                    Ver Tareas
                </Link>
                <Link to="/perfil" className="nav-button">
                    Gestionar Perfil
                </Link>
                <Link to="/estadisticas" className="nav-button">
                    Ver Estadísticas
                </Link>
                {rol == "administrador" && (
                    <Link to="/gestion-usuarios" className="nav-button">
                        Gestionar Usuarios
                    </Link>
                )}
                {rol == "administrador" && (
                    <Link to="/gestion-incidencias" className="nav-button">
                        Gestionar Incidencias
                    </Link>
                )}
            </div>

            <div className="nav-footer">
                <button className="nav-button logout-button" onClick={handleLogout}>
                    <Link to="/login">Cerrar Sesión</Link>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;