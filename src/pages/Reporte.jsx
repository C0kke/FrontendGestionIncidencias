import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import './styles/Reporte.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationDropdown from "../components/NotificacionDropdown";
import DetalleIncidenciaModal from "../components/DetalleIncidenciaModal"; 
import { handleDownloadReporteById, downloadFileFromResponse } from "../utils/DownloadReporte";
const areas = ["Pasillo industrial 3", "Planta eléctrica"];
const modulos = ["Eléctrica", "Mecánica", "Civil", "Estructural"];
const PRIORITIES = [
    { id: 'baja', label: 'Baja' },
    { id: 'media', label: 'Media' },
    { id: 'alta', label: 'Alta' },
];

const Reporte = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [area, setArea] = useState(areas[0]);
    const [modulo, setModulo] = useState(modulos[0]);
    const [detalle, setDetalle] = useState('');
    const [hora, setHora] = useState(Date.now().toLocaleString());
    const [prioridad, setPrioridad] = useState(PRIORITIES[0].id);
    const [responsable, setResponsable] = useState(''); 
    const [foto, setFoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('user') || localStorage.getItem('user') === 'undefined') {
            navigate('/login');
            return;
        }
    }, [navigate]);

    const rol = JSON.parse(localStorage.getItem('user')).rol;

    useEffect(() => {
        /* Cambiar logica a mostrar primero usuarios sin tareas y con mas tiempo sin realizar una */
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios`)
                setUsuarios(response.data)
                if (response.data.length > 0) {
                    setResponsable(response.data[0].id);
                }
            } catch(error) {
                console.error("Error al obtener usuarios " + error)
            }

        }

        fetchUsuarios();
    }, [])

    const handleResetInputs = () => {
        setArea(areas[0])
        setDetalle('')
        setPrioridad(PRIORITIES[0].id)
        setResponsable(usuarios.length > 0 ? usuarios[0].id : '');
        setFoto(null);
    }

     const prepareFormData = () => {
        const formData = new FormData();
        formData.append('area', area);
        formData.append('modulo', modulo);
        formData.append('detalle', detalle);
        formData.append('hora', hora);
        formData.append('prioridad', prioridad);
        formData.append('responsable_id', responsable); 

        if (foto) {
            formData.append('foto', foto);
        }
        return formData;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('');

        const formData = new FormData();
        
        formData.append('area', area);
        formData.append('modulo', modulo);
        formData.append('detalle', detalle);
        formData.append('hora', hora);
        formData.append('prioridad', prioridad);
        formData.append('responsable_id', responsable); 

        if (foto) {
            formData.append('foto', foto);
        }

        try {
            const response = await axios.post(
                import.meta.env.VITE_API_BASE_URL + '/incidencias', 
                formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', 
                    },
                }
            );
            setMensaje('¡Reporte generado correctamente!');
            handleResetInputs();
            console.log(response.data);
        } catch(error) {
            console.error(error);
            setMensaje('Error: No se pudo registrar la incidencia. Consulta la consola.');
        } finally {
            setLoading(false);
        }
    }

     const handleGenerateAndDownload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('');

        try {
            const formData = prepareFormData();

            // Usamos el NUEVO ENDPOINT
            const response = await fetch(
                import.meta.env.VITE_API_BASE_URL + '/incidencias/registrar-y-descargar', 
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                // Descargar el archivo DOCX
                await downloadFileFromResponse(response, 'reporte_incidencia.docx');
                
                setMensaje('¡Incidencia registrada y reporte Word descargado con éxito!');
                handleResetInputs();
            } else {
                // Manejar error de servidor
                const errorText = await response.text();
                throw new Error(errorText || "Error en el servidor al generar el reporte.");
            }
        } catch(error) {
            console.error(error);
            setMensaje(`Error: ${error.message || 'No se pudo completar la operación.'}`);
        } finally {
            setLoading(false);
        }
    }

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
            <NotificationDropdown onOpenIncidenciaDetail={handleOpenIncidenciaDetail} />
            <div className="content-area report-container">
                <h1 className="report-title">Reporte de Incidencias</h1>
                <p className="report-subtitle">Utiliza este formulario para registrar un nuevo incidente en la planta.</p>

                <form onSubmit={handleSubmit} className="form-card form-reporte">                    
                    <div className="form-group">
                        <label htmlFor="area-select" className="form-label">Área de la Incidencia</label>
                        <select
                            id="area-select"
                            className="form-input"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            required
                        >
                            {areas.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="modulo-select" className="form-label">Tipo de la Incidencia</label>
                        <select
                            id="modulo-select"
                            className="form-input"
                            value={modulo}
                            onChange={(e) => setModulo(e.target.value)}
                            required
                        >
                            {modulos.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="detalle-text" className="form-label">Detalle de la Incidencia</label>
                        <textarea 
                            id="detalle-text"
                            placeholder="Describe el incidente (qué pasó, dónde, cuándo)."
                            className="form-input textarea"
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="hora-input" className="form-label">Hora de la Incidencia</label>
                        <input
                            id="hora-input"
                            type="datetime-local"
                            className="form-input"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Prioridad</label>
                        <div className="priority-selector">
                            {PRIORITIES.map(p => (
                                <div key={p.id} className="radio-group">
                                    <input 
                                        id={`prioridad-${p.id}`} 
                                        type="radio" 
                                        name="prioridad" 
                                        value={p.id}
                                        checked={prioridad === p.id}
                                        onChange={() => setPrioridad(p.id)}
                                        className="radio-input"
                                    />
                                    <label htmlFor={`prioridad-${p.id}`} className={`radio-label priority-${p.color}`}>
                                        {p.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {rol === 'administrador' &&(
                        <div className="form-group">
                            <label htmlFor="responsable-select" className="form-label">Responsable</label>
                            <select 
                                id="responsable-select"
                                className="form-input"
                                value={responsable}
                                onChange={(e) => setResponsable(e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    {usuarios.length > 0 ? "Selecciona un usuario..." : "Cargando usuarios..."}
                                </option>
                                {usuarios.map((usuario) => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nombre}
                                    </option>
                                ))}
                            </select>    
                        </div>
                    )}

                    {/* <div className="form-group file-upload-group">
                        <label htmlFor="foto-upload" className="form-label">Adjuntar Fotografía</label>
                        <input 
                            id="foto-upload"
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setFoto(e.target.files[0])}
                            className="file-input-hidden"
                        />
                        <label htmlFor="foto-upload" className="file-input-button">
                             {foto ? `1 archivo adjunto (${(foto.size / 1024).toFixed(1)} KB)` : "Seleccionar Imagen"}
                        </label>
                        {foto && <span className="file-name-display">{foto.name}</span>}
                    </div> */}

                    {mensaje && (
                        <p className={`message-box ${mensaje.includes('exito') ? 'success' : 'error'}`}>
                            {mensaje}
                        </p>
                    )}

                    <div className="button-group">
                        {/* BOTÓN 1: Registrar y descargar (llama al nuevo endpoint) */}
                        <button type="button" onClick={handleGenerateAndDownload} className="form-button secondary-button" disabled={loading}>
                            {loading ? 'Generando...' : 'Generar y Descargar Reporte 📄'}
                        </button>

                        {/* BOTÓN 2: Solo registrar (llama al endpoint original) */}
                        <button type="submit" onClick={handleSubmit} className="form-button primary-button" disabled={loading}>
                            {loading ? 'Enviando...' : 'Registrar Incidencia'}
                        </button>
                    </div>
                </form>
            </div>
            {isModalOpen && selectedIncidencia && (
                <DetalleIncidenciaModal 
                    incidencia={selectedIncidencia} 
                    onClose={handleCloseModal} 
                    onDownloadReporte={handleDownloadReporteById}
                />
            )}
        </div>
    );
};

export default Reporte;