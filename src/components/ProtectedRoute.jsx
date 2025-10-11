import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, isLoginRoute }) => {
    const userString = localStorage.getItem('user');
    let userData = null;

    if (userString && userString !== 'undefined') {
        try {
            userData = JSON.parse(userString);
        } catch (e) {
            console.error("Error al parsear el usuario de localStorage:", e);
        }
    }

    const isLoggedIn = !!userData;
    const userRole = userData ? userData.rol : null;

    if (isLoginRoute) {
        if (isLoggedIn) {
            return <Navigate to="/inicio" replace />;
        }
        return <Outlet />; 
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/inicio" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;