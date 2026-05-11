

import React from "react";
import { Link } from 'react-router-dom';

const ContactComplejoDeportivo = ({ complejo, onDelete }) => {
    // Imagen de marcador de posición si no hay imagen_url
    const defaultImage = "https://placeholder.com"; 

    return (
        <li className="list-group-item d-flex justify-content-center border-bottom py-3">
            <div className="d-flex align-items-center w-100">
                {/* Contenedor de la Foto */}
                <div className="col-md-2 d-flex justify-content-center">
                    <img 
                        className="rounded-circle border shadow-sm" 
                        src={complejo.imagen_url || defaultImage} 
                        alt="Logo Complejo" 
                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                </div>
                
                {/* Información Central */}
                <div className="col-md-6 px-3">
                  
                    <h5 className="mb-1 text-primary fw-bold">{complejo.nombre}</h5>
                    
                    {/* Ubicación: Ciudad y País */}
                    <p className="mb-1 text-muted fw-bold small">
                        <i className="fa fa-globe me-2"></i>{complejo.city}, {complejo.country}
                    </p>

                    {/* Dirección Física */}
                    <p className="mb-1 text-secondary small">
                        <i className="fa fa-map-marker-alt me-2 text-danger"></i>{complejo.address}
                    </p>
                    
                    {/* Datos de contacto */}
                    <div className="d-flex flex-wrap gap-3">
                        <small className="text-muted"><i className="fa fa-phone me-1"></i>{complejo.phone}</small>
                        <small className="text-muted"><i className="fa fa-envelope me-1"></i>{complejo.email}</small>
                    </div>
                    
                    {/* Link de Google Maps dinámico */}
                    {complejo.google_map && (
                        <a 
                            href={complejo.google_map.startsWith('http') ? complejo.google_map : `https://${complejo.google_map}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm btn-link p-0 text-info mt-1 text-decoration-none"
                        >
                            <i className="fa fa-map me-1"></i> Ver ubicación
                        </a>
                    )}
                </div>

                {/* Acciones del Administrador */}
                <div className="col-md-4 d-flex justify-content-end align-items-center gap-2">
                    {/* Botón para ir a la gestión de canchas de este complejo */}
                    <Link to={`/complejo/${complejo.id}/add-cancha`} className="btn btn-outline-success btn-sm rounded-pill">
                        <i className="fa fa-futbol me-1"></i> Cargar y Ver Canchas Disponibles
                    </Link>
                    
                    {/* Botón para editar el complejo */}
                    <Link to={`/add-complejo/${complejo.id}`} className="btn btn-outline-secondary btn-sm rounded-pill">
                        <i className="fa fa-pencil-alt"></i> Actualizar Datos
                    </Link>
                </div>
            </div>
        </li>
    );
};

export default ContactComplejoDeportivo;
