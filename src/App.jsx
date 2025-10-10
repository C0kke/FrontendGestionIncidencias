import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Reporte from './pages/Reporte';
import Tareas from './pages/Tareas';
import ProtectedRoute from './components/ProtectedRoute'; 
import Estadisticas from './pages/Estadisticas';
import Perfil from './pages/Perfil';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionIncidencias from './pages/GestionIncidencias';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="flex flex-col">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/inicio" element={<Inicio />} />
              <Route path="/reporte" element={<Reporte />} />
              <Route path="/tareas" element={<Tareas />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/estadisticas" element={<Estadisticas />}/>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
              <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
              <Route path="/gestion-incidencias" element={<GestionIncidencias />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;