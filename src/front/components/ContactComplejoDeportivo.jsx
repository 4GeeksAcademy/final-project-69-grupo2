import React from "react";
import { Link } from 'react-router-dom';

const ContactComplejoDeportivo = ({ complejo, onDelete }) => {
    return (
        <li className="list-group-item d-flex justify-content-center">
            <div className="d-flex align-items-center w-75">
                <div className="col-md-3 d-flex justify-content-center">
                    <img 
                        className="rounded" 
                        src={complejo.imagen_url || "https://placeholder.com"} 
                        alt="Logo" 
                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                </div>
                
                <div className="col-md-6">
                    <h5 className="card-title mb-1 text-primary">{complejo.name}</h5>
                    <p className="card-text mb-1 text-secondary">
                        <i className="fa fa-map-marker me-2"></i>{complejo.address}
                    </p>
                    <p className="card-text mb-1 text-secondary">
                        <i className="fa fa-phone me-2"></i>{complejo.phone}
                    </p>
                    <p className="card-text mb-1 text-secondary">
                        <i className="fa fa-envelope me-2"></i>{complejo.email}
                    </p>
       
                    <p className="mb-1 text-muted">
                        <small><i className="fa fa-globe me-2"></i>{complejo.city}, {complejo.country}</small>
                    </p>
                    
                    {complejo.google_map && (
                        <a 
                            href={complejo.google_map.startsWith('http') ? complejo.google_map : `https://${complejo.google_map}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm btn-outline-info mt-2"
                        >
                            <i className="fa fa-external-link-alt me-1"></i> Ver en Google Maps
                        </a>
                    )}
                </div>
                 <Link to={`/complejo/${complejo.id}/add-cancha`} className="btn btn-outline-success btn-sm">
                    <i className="fa fa-futbol me-1"></i> Canchas
                </Link>

                <div className="col-md-3 d-flex justify-content-end align-items-start">
                    <Link to={`/add-complejo/${complejo.id}`} className="btn btn-link p-0 me-3 text-dark">
                        <i className="fa fa-pencil fa-lg"></i>
                    </Link>
                    <button 
                        type="button" 
                        className="btn btn-link p-0 text-danger" 
                        data-bs-toggle="modal" 
                        data-bs-target={`#delete-${complejo.id}`}
                    >
                        <i className="fa fa-trash fa-lg"></i>
                    </button>
                </div>
            </div>

            {/* Modal de confirmación */}
            <div className="modal fade" id={`delete-${complejo.id}`} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">¿Eliminar {complejo.name}?</h5>
                        </div>
                        <div className="modal-body">
                            Esta acción no se puede deshacer y borrará toda la información asociada.
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button 
                                className="btn btn-danger" 
                                data-bs-dismiss="modal" 
                                onClick={() => onDelete(complejo.id)}
                            >
                                Sí, eliminar complejo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

export default ContactComplejoDeportivo;