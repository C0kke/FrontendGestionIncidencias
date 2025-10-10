import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './styles/Inicio.css';
import Navbar from "../components/navbar";
import DetalleIncidenciaModal from "../components/DetalleIncidenciaModal";
import NotificacionDropdown from "../components/NotificacionDropdown";

const Inicio = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('user') || localStorage.getItem('user') === 'undefined') {
            navigate('/login');
            return;
        }
    }, [navigate]);

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

    return (
        <div className="main-layout">
            <Navbar />
            <NotificacionDropdown onOpenIncidenciaDetail={handleOpenIncidenciaDetail} />
            <div className="content-area">
                <h1 className="content-title">Bienvenido a la gestión de Incidencias</h1>
                <p className="content-subtitle">Aquí puedes gestionar y reportar incidencias de manera eficiente.</p>
                <p className="content-text">Navega por el menú para comenzar.</p>
                <div className="dynamic-view">
                    {}
                </div>
            </div>
            {selectedIncidencia && isModalOpen && (
                <DetalleIncidenciaModal 
                    incidencia={selectedIncidencia} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default Inicio;