import React from "react";

const downloadFileFromResponse = async (response, defaultFilename) => {
    const blob = await response.blob();
    let filename = defaultFilename;
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches && matches[1]) {
            filename = matches[1];
        }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url); 
};

const handleDownloadReporteById = async (id) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/incidencias/descargar-reporte/${id}`);

        if (response.ok) {
            await downloadFileFromResponse(response, `Reporte_Incidencia_${id}.docx`);
        } else {
            const errorText = await response.text();
            alert(`Error al descargar el reporte: ${errorText}`);
        }
    } catch (error) {
        console.error('Error de red al descargar:', error);
        alert('Error de conexión con el servidor.');
    }
};

export { handleDownloadReporteById, downloadFileFromResponse };