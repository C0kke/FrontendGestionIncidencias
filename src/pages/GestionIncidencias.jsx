import React, { useEffect, useState } from "react";
import "./styles/GestionIncidencias.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { hasPermission } from "../utils/permissions";
import DetalleIncidenciaModal from "../components/DetalleIncidenciaModal"; 

const GestionIncidencias = () => {
  const { user } = useAuth();
  const [incidencias, setIncidencias] = useState([]);
  const [filteredIncidencias, setFilteredIncidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    area: "",
    modulo: "",
    estado: "",
    prioridad: "",
  });
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // --- Control de cantidad de incidencias por página ---
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const [responsableMap, setResponsableMap] = useState({});

  useEffect(() => {
    if (!user || !hasPermission(user.rol, "puedeVerTodasLasIncidencias")) {
      setLoading(false);
      return;
    }
    fetchIncidencias();
  }, []);

  const fetchIncidencias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/incidencias`);
      const data = response.data || [];
      setIncidencias(data);
      setFilteredIncidencias(data);
      populateResponsables(data);
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
      setMensaje("Error al cargar las incidencias. Consulta la consola.");
    } finally {
      setLoading(false);
    }
  };

  const populateResponsables = async (incidenciasList) => {
    const ids = [
      ...new Set(
        incidenciasList.map((i) => i.responsable_id).filter((id) => id != null)
      ),
    ];
    if (ids.length === 0) return;

    try {
      const usersResp = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios`);
      const map = {};
      usersResp.data.forEach((u) => {
        map[u.id] = u.nombre;
      });
      setResponsableMap(map);
    } catch (err) {
      console.error("Error al obtener el listado de usuarios:", err);
    }
  };

  // Filtrado y búsqueda
  useEffect(() => {
    let data = [...incidencias];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (i) =>
          i.area?.toLowerCase().includes(term) ||
          i.modulo?.toLowerCase().includes(term) ||
          i.descripcion?.toLowerCase().includes(term) ||
          i.estado?.toLowerCase().includes(term)
      );
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        data = data.filter((i) => i[key]?.toLowerCase() === filters[key].toLowerCase());
      }
    });

    setFilteredIncidencias(data);
    setCurrentPage(1);
  }, [searchTerm, filters, incidencias]);

  const uniqueValues = (field) => {
    return [...new Set(incidencias.map((i) => i[field]).filter(Boolean))];
  };
    
  const formatChileanDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
          return 'Fecha inválida';
      }
      return new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Santiago'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return isoString;
    }
  };

  const handleOpenIncidenciaDetail = (incidencia) => {
    setSelectedIncidencia(incidencia);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncidencia(null);
  };

  const handleEliminarIncidencia = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta incidencia? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/incidencias/${id}`);
      setMensaje("Incidencia eliminada correctamente.");
      fetchIncidencias(); // Recargar la lista
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al eliminar la incidencia:", error);
      setMensaje("Error al eliminar la incidencia.");
    }
  };

  // Redirigir si el usuario no tiene permiso
  if (!user || !hasPermission(user.rol, "puedeVerTodasLasIncidencias")) {
    return <Navigate to="/tareas" replace />;
  }

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredIncidencias.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentIncidencias = filteredIncidencias.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <>
      <div className="usuarios-container">
        <div className="usuarios-header">
          <div className="header-text">
            <h1 className="usuarios-title">Gestión de Incidencias</h1>
            <p className="usuarios-subtitle">
              Visualiza, busca y filtra las incidencias registradas.
            </p>
          </div>
        </div>

        {mensaje && (
          <div className={`message-box ${mensaje.includes("Error") ? "error" : "success"}`}>
            {mensaje}
          </div>
        )}

        <div className="filter-header">
          <input
            type="text"
            placeholder="Buscar por área, módulo, descripción o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="filter-toggle-button" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
        </div>

        {showFilters && (
          <div className="filters-dropdown">
            <div className="filter-group">
              <label>Área:</label>
              <select value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })}>
                <option value="">Todas</option>
                {uniqueValues("area").map((v) => (<option key={v} value={v}>{v}</option>))}
              </select>
            </div>
            <div className="filter-group">
              <label>Módulo:</label>
              <select value={filters.modulo} onChange={(e) => setFilters({ ...filters, modulo: e.target.value })}>
                <option value="">Todos</option>
                {uniqueValues("modulo").map((v) => (<option key={v} value={v}>{v}</option>))}
              </select>
            </div>
            <div className="filter-group">
              <label>Estado:</label>
              <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Prioridad:</label>
              <select value={filters.prioridad} onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}>
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <p>Cargando incidencias...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Fecha de Incidencia</th>
                  <th>Descripcion</th>
                  <th>Estado</th>
                  <th>Última Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentIncidencias.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No hay incidencias que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  currentIncidencias.map((i) => (
                    <tr key={i.id} className="usuario-row">
                      <td>{i.id}</td>
                      <td>{formatChileanDate(i.hora)}</td>
                      <td>{i.descripcion}</td>
                      <td>{i.estado}</td>
                      <td>{formatChileanDate(i.fecha_actualizacion)}</td>
                      <td className="actions-container">
                        <button className="edit-button action-button" onClick={() => handleOpenIncidenciaDetail(i)}>
                          Ver
                        </button>
                        {user && hasPermission(user.rol, "puedeEditarIncidencias") && (
                          <button className="edit-button action-button" onClick={() => handleOpenIncidenciaDetail(i)}>
                            Editar
                          </button>
                        )}
                        {user && hasPermission(user.rol, "puedeEliminarIncidencias") && (
                          <button className="deactivate-button action-button" onClick={() => handleEliminarIncidencia(i.id)}>
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-container">
          <button className="pagination-button" onClick={handlePrevPage} disabled={currentPage === 1}>
            {'<'} Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button className="pagination-button" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Siguiente {'>'}
          </button>
        </div>
      </div>

      {isModalOpen && selectedIncidencia && (
        <DetalleIncidenciaModal incidencia={selectedIncidencia} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default GestionIncidencias;
