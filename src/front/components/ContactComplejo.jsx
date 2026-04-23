import React from "react";
import { Link } from 'react-router-dom';
import useGlobalReducer from "../hooks/useGlobalReducer"; 

const ComplejoContact = ({ contact }) => {
    const { dispatch } = useGlobalReducer();

    const handleDelete = (id) => {
        // CORRECCIÓN: La URL debe ser la de la API de 4Geeks y usar el template string correctamente
        const baseUrl = "https://4geeks.com";
        
        fetch(`${baseUrl}/${id}`, {
            method: "DELETE",
        })
        .then((response) => {
            if (response.ok) {
                // Esto elimina el contacto visualmente de inmediato
                dispatch({ type: "delete_contact", payload: id });
            }
        })
        .catch((error) => console.log("Error al eliminar:", error));
    };

    return (
        <li className="list-group-item d-flex justify-content-center">
            <div className="d-flex align-items-center w-75">
                <div className="col-md-3 d-flex justify-content-center">
                    {/* Imagen de ejemplo mejorada */}
                    <img 
                        className="rounded-circle" 
                        src={`https://ui-avatars.com{contact.name}&background=random`} 
                        alt="contacto" 
                        style={{ width: "80px", height: "80px" }}
                    />
                </div>
                <div className="col-md-6">
                    <h5 className="card-title mb-1">{contact.name}</h5>
                    <p className="card-text mb-1 text-secondary"><i className="fas fa-map-marker-alt me-2"></i>{contact.address}</p>
                    <p className="card-text mb-1 text-secondary"><i className="fas fa-phone me-2"></i>{contact.phone}</p>
                    <p className="card-text mb-1 text-secondary"><i className="fas fa-envelope me-2"></i>{contact.email}</p>
                </div>
                <div className="col-md-3 d-flex justify-content-end align-items-start">
                    <Link to={"/editContact/" + contact.id} className="btn btn-link p-0 me-3 text-dark">
                        <i className="fa fa-pencil fa-lg"></i>
                    </Link>
                    <button type="button" className="btn btn-link p-0 text-danger" data-bs-toggle="modal" data-bs-target={"#delete-" + contact.id}>
                        <i className="fa fa-trash fa-lg"></i>
                    </button>
                </div>
            </div>

            {/* Modal de confirmación (Bootstrap) */}
            <div className="modal fade" id={"delete-" + contact.id} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">¿Eliminar contacto?</h5>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que quieres borrar a <strong>{contact.name}</strong>?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button 
                                className="btn btn-danger" 
                                data-bs-dismiss="modal" 
                                onClick={() => handleDelete(contact.id)}
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

export default ComplejoContact;