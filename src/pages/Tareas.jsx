import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import './styles/Tareas.css';
import DetalleIncidenciaModal from '../components/DetalleIncidenciaModal'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import NotificacionDropdown from "../components/NotificacionDropdown";
import { handleDownloadReporteById, downloadFileFromResponse } from "../utils/DownloadReporte";

const ESTADOS = {
    PENDIENTE: 'Pendiente',
    EN_CURSO: 'En curso',
    RESUELTO: 'Resuelto',
};

const ESTADO_KEYS = [ESTADOS.PENDIENTE, ESTADOS.EN_CURSO, ESTADOS.RESUELTO];

const TarjetaIncidencia = ({ incidencia, onSelect, index }) => {
    const [usuario, setUsuario] = useState(null);
    const getPriorityClass = (prioridad) => {
        return `priority-tag tag-${prioridad}`; 
    };
    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/${incidencia.responsable_id}`);
                setUsuario(response.data);
                console.log('Usuario obtenido:', response.data);
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
                return null;
            }
        };

        fetchUsuario();
    }, [incidencia.responsable_id]);

    return (
        <Draggable draggableId={String(incidencia.id)} index={index}>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`incidencia-card card-priority-${incidencia.prioridad} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    onClick={() => onSelect(incidencia)}
                >
                    <div className="card-header">
                        <span className="incidencia-id">#{incidencia.id}</span>
                        <span className={getPriorityClass(incidencia.prioridad)}>
                            {incidencia.prioridad.toUpperCase()}
                        </span>
                    </div>
                    <p className="incidencia-area">Área: {incidencia.area}</p>
                    <p className="incidencia-area">Tipo: {incidencia.modulo}</p>
                    <p className="incidencia-detail">{incidencia.descripcion.substring(0, 70)}...</p>
                    <div className="card-footer">
                        <span className="responsable">Responsable: {usuario ? usuario.nombre : 'Cargando...'}</span>
                        <span className="fecha">Creada: {new Date(incidencia.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

const ColumnaTareas = ({ droppableId, titulo, tareas, onSelectIncidencia }) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided) => (
                <div 
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    <h2 className="column-title">
                        {titulo} <span className="task-count">({tareas.length})</span>
                    </h2>
                    <div className="task-list">
                        {tareas.map((incidencia, index) => (
                            <TarjetaIncidencia 
                                key={incidencia.id} 
                                incidencia={incidencia} 
                                onSelect={onSelectIncidencia}
                            />
                        ))}
                        {provided.placeholder}
                        {tareas.length === 0 && (
                            <p className="no-tasks">No hay tareas en este estado.</p>
                        )}
                    </div>
                </div>
            )}
        </Droppable>
    );
};


const Tareas = () => {
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);

    // Obtener información del usuario logueado
    const userData = JSON.parse(localStorage.getItem('user'));
    const rolUsuario = userData?.rol;
    const idUsuario = userData?.id;

    useEffect(() => {
        const fetchIncidencias = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/incidencias`);
                let todasLasIncidencias = response.data;

                // Filtrar incidencias según el rol del usuario
                let incidenciasFiltradas = todasLasIncidencias;
                if (rolUsuario !== 'administrador') {
                    // Si no es administrador, solo mostrar incidencias asignadas a él
                    incidenciasFiltradas = todasLasIncidencias.filter(incidencia => 
                        incidencia.responsable_id === idUsuario
                    );
                }

                setIncidencias(incidenciasFiltradas);
                setError(null);
            } catch (err) {
                console.error("Error al obtener incidencias:", err);
                setError("Error al cargar las tareas. Asegúrate de que la API esté funcionando.");
            } finally {
                setLoading(false);
            }
        };
        
        if (userData) { // Solo ejecutar si hay datos de usuario
             fetchIncidencias();
        } else {
            // Si no hay usuario en localStorage, redirigir o manejar error
            console.error("Usuario no encontrado en localStorage");
            setError("Sesión expirada. Por favor, inicie sesión.");
            setLoading(false);
        }
        
    }, [rolUsuario, idUsuario, userData]); // Añadir dependencias para refetch si cambian
    
    // Agrupar incidencias filtradas
    const tareasAgrupadas = useMemo(() => {
        const grupos = ESTADO_KEYS.reduce((acc, key) => ({ ...acc, [key]: [] }), {});
        
        incidencias.forEach(incidencia => {
            if (grupos[incidencia.estado]) {
                grupos[incidencia.estado].push(incidencia);
            }
        });
        return grupos;
    }, [incidencias]);
    
    
    const handleSelectIncidencia = (incidencia) => {
        setSelectedIncidencia(incidencia);
        setIsModalOpen(true);
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
        
    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const incidenciaId = parseInt(draggableId);
        const nuevoEstado = destination.droppableId;
        const incidenciaMovida = incidencias.find(i => i.id === incidenciaId);
        
        if (source.droppableId === destination.droppableId) {
            return; 
        }

        const nuevasIncidencias = incidencias.map(i => 
            i.id === incidenciaId ? { ...i, estado: nuevoEstado } : i
        );
        setIncidencias(nuevasIncidencias);

        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/incidencias/${incidenciaId}/estado`,
                { estado: nuevoEstado }
            );
            console.log(`Incidencia ${incidenciaId} movida a ${nuevoEstado} y guardada en el backend.`);

        } catch (error) {
            console.error('Error al actualizar el estado en el backend:', error);
            setIncidencias(incidencias); 
            alert('Error al guardar el cambio de estado. Por favor, inténtalo de nuevo.');
        }
    };

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    return (
        <div className="main-layout">
            <Navbar />
            <NotificacionDropdown onOpenIncidenciaDetail={handleOpenIncidenciaDetail} />
            
            {loading && (
                <div className="loading-state">Cargando tablero...</div>
            )}
            <div className="content-area tasks-container">
                <h1 className="board-title">Tablero de Seguimiento de Incidencias</h1>
                <p className="board-subtitle">Arrastra y suelta las tarjetas para cambiar el estado de la tarea.</p>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="kanban-board">
                        {ESTADO_KEYS.map(estado => (
                            <ColumnaTareas
                                key={estado}
                                droppableId={estado}
                                titulo={estado}
                                tareas={tareasAgrupadas[estado]}
                                onSelectIncidencia={handleSelectIncidencia}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </div>

            {selectedIncidencia && isModalOpen && (
                <DetalleIncidenciaModal 
                    incidencia={selectedIncidencia} 
                    onClose={handleCloseModal} 
                    onDownloadReporte={handleDownloadReporteById}
                />
            )}
        </div>
    );
};

export default Tareas;