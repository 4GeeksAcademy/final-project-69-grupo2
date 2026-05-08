

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContactComplejoDeportivo from "../components/ContactComplejoDeportivo.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Swal from "sweetalert2";

export const AddComplejoDeportivo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();
    const [complejos, setComplejos] = useState([]);
    const [verFormulario, setVerFormulario] = useState(id ? true : false);

    const [complejo, setComplejo] = useState({
        name: "", 
        email: "", 
        phone: "", 
        address: "", 
        country: "", 
        city: "", 
        google_map: "", 
        image: null 
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    // Obtenemos el token de forma segura
    const token = localStorage.getItem("token") || store.auth?.token;

    const cargarDatos = async () => {
        if (!token) return;

        try {
            // 1. Cargamos solo los complejos del usuario logueado
            const resp = await fetch(`${backendUrl}/api/mis-complejos`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setComplejos(data);
            }
        } catch (error) {
            console.error("Error cargando lista:", error);
        }

        // 2. Si estamos editando (hay un ID), cargamos los datos del complejo específico
        if (id) {
            try {
                const resp = await fetch(`${backendUrl}/api/complejo/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setComplejo({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        country: data.country || "",
                        city: data.city || "",
                        google_map: data.google_map || "",
                        image: null 
                    });
                    setVerFormulario(true);
                }
            } catch (error) {
                console.error("Error cargando detalle:", error);
            }
        }
    };

    useEffect(() => { cargarDatos(); }, [id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = id ? `${backendUrl}/api/complejo/${id}` : `${backendUrl}/api/complejo`;
        const method = id ? "PUT" : "POST";

        const formData = new FormData();
        formData.append("name", complejo.name);
        formData.append("email", complejo.email);
        formData.append("phone", complejo.phone);
        formData.append("address", complejo.address);
        formData.append("country", complejo.country);
        formData.append("city", complejo.city);
        formData.append("google_map", complejo.google_map);
        
        if (complejo.image && complejo.image[0]) {
            formData.append("image", complejo.image[0]);
        }

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Nota: NO poner Content-Type cuando se usa FormData
                }
            });

            if (response.ok) {
                Swal.fire("¡Éxito!", id ? "Complejo actualizado" : "Complejo registrado correctamente", "success");
                setVerFormulario(false);
                setComplejo({ name: "", email: "", phone: "", address: "", country: "", city: "", google_map: "", image: null });
                cargarDatos();
                navigate("/add-complejo");
            } else {
                const errorData = await response.json();
                Swal.fire("Error", errorData.msg || "No se pudo guardar", "error");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    };

    const borrarComplejo = async (idBorrar) => {
        const result = await Swal.fire({
            title: '¿Eliminar complejo?',
            text: "Se borrarán también todas sus canchas y horarios.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                const resp = await fetch(`${backendUrl}/api/complejo/${idBorrar}`, { 
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    Swal.fire("Eliminado", "El complejo ha sido borrado.", "success");
                    cargarDatos();
                }
            } catch (error) {
                console.error("Error al borrar:", error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">
                    {verFormulario ? (id ? "Editar Mi Complejo" : "Nuevo Complejo") : "Mis Complejos Deportivos"}
                </h2>
                <button
                    className={`btn ${verFormulario ? "btn-outline-secondary" : "btn-primary shadow-sm"}`}
                    onClick={() => {
                        setVerFormulario(!verFormulario);
                        if (!verFormulario) setComplejo({ name: "", email: "", phone: "", address: "", country: "", city: "", google_map: "", image: null });
                        if (id) navigate("/add-complejo");
                    }}
                >
                    {verFormulario ? "Volver a la Lista" : " + Agregar Nuevo"}
                </button>
            </div>

            {verFormulario ? (
                <div className="card shadow-lg p-4 bg-white border-0" style={{ borderRadius: "15px" }}>
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">Nombre del Complejo</label>
                            <input className="form-control" value={complejo.name} onChange={e => setComplejo({ ...complejo, name: e.target.value })} required />
                        </div>
                                                <div className="col-md-12">
                            <label className="form-label fw-bold small text-primary">
                                <i className="fa fa-map-marker-alt me-1"></i> Link de Google Maps (URL)
                            </label>
                            <input 
                                className="form-control" 
                                placeholder="https://goo.gl..." 
                                value={complejo.google_map} 
                                onChange={e => setComplejo({ ...complejo, google_map: e.target.value })} 
                            />
                            <div className="form-text">Pega aquí el enlace de "Compartir" de Google Maps.</div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold small">Email de Contacto</label>
                            <input type="email" className="form-control" value={complejo.email} onChange={e => setComplejo({ ...complejo, email: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">País</label>
                            <input className="form-control" value={complejo.country} onChange={e => setComplejo({ ...complejo, country: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">Ciudad</label>
                            <input className="form-control" value={complejo.city} onChange={e => setComplejo({ ...complejo, city: e.target.value })} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small">Teléfono</label>
                            <input className="form-control" value={complejo.phone} onChange={e => setComplejo({ ...complejo, phone: e.target.value })} required />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label fw-bold small">Dirección</label>
                            <input className="form-control" value={complejo.address} onChange={e => setComplejo({ ...complejo, address: e.target.value })} required />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label fw-bold small">Logo o Imagen</label>
                            <input type="file" className="form-control" onChange={e => setComplejo({ ...complejo, image: e.target.files })} />
                        </div>
                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-success w-100 fw-bold py-2">
                                {id ? "ACTUALIZAR DATOS" : "REGISTRAR COMPLEJO"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="list-group shadow-sm">
                    {complejos.length > 0 ? (
                        complejos.map(item => (
                            <ContactComplejoDeportivo 
                                key={item.id} 
                                complejo={item} 
                                onDelete={() => borrarComplejo(item.id)} 
                            />
                        ))
                    ) : (
                        <div className="text-center p-5 bg-light rounded">
                            <i className="fa fa-folder-open fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No tienes complejos registrados todavía.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
