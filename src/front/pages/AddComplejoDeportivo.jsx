

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContactComplejoDeportivo from "../components/ContactComplejoDeportivo.jsx";

export const AddComplejoDeportivo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const resp = await fetch(`${backendUrl}/api/mis-complejos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.ok) setComplejos(await resp.json());
        } catch (error) { console.error("Error lista:", error); }

        if (id) {
            try {
                const resp = await fetch(`${backendUrl}/api/complejo/${id}`);
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
            } catch (error) { console.error("Error detalle:", error); }
        }
    };

    useEffect(() => { cargarDatos(); }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = id ? `${backendUrl}/api/complejo/${id}` : `${backendUrl}/api/complejo`;
        const method = id ? "PUT" : "POST";

        // Usamos FormData porque incluimos un archivo (imagen)
        const formData = new FormData();
        formData.append("name", complejo.name);
        formData.append("email", complejo.email);
        formData.append("phone", complejo.phone);
        formData.append("address", complejo.address);
        formData.append("country", complejo.country);
        formData.append("city", complejo.city);
        formData.append("google_map", complejo.google_map);

        // Solo añadimos la imagen si el usuario seleccionó una nueva
        if (complejo.image && complejo.image[0]) {
            formData.append("image", complejo.image[0]);
        }

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                alert("¡Complejo guardado exitosamente!");
                setComplejo({ name: "", email: "", phone: "", address: "", country: "", city: "", google_map: "", image: null });
                await cargarDatos();
                setVerFormulario(false);
                navigate("/add-complejo");
            } else {
                const errorData = await response.json();
                alert("Error: " + (errorData.error || "No se pudo guardar"));
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    };

    const borrarComplejo = async (idBorrar) => {
        if (!window.confirm("¿Estás seguro de eliminar este complejo?")) return;
        try {
            const resp = await fetch(`${backendUrl}/api/complejo/${idBorrar}`, { method: "DELETE" });
            if (resp.ok) cargarDatos();
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">
                    {verFormulario ? (id ? "Editar Complejo" : "Registrar Complejo") : "Gestión de Complejos"}
                </h2>
                <button
                    className={`btn ${verFormulario ? "btn-outline-secondary" : "btn-primary shadow-sm"}`}
                    onClick={() => {
                        setVerFormulario(!verFormulario);
                        if (!verFormulario) setComplejo({ name: "", email: "", phone: "", address: "", country: "", city: "", google_map: "", image: null });
                        if (id) navigate("/add-complejo");
                    }}
                >
                    {verFormulario ? "Volver a la Lista" : " + Agregar Nuevo Complejo"}
                </button>
            </div>

            {verFormulario ? (
                <div className="card shadow-lg p-4 bg-white border-0">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Nombre del Complejo</label>
                            <input className="form-control" value={complejo.name} onChange={e => setComplejo({ ...complejo, name: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Email de Contacto</label>
                            <input type="email" className="form-control" value={complejo.email} onChange={e => setComplejo({ ...complejo, email: e.target.value })} required />
                        </div>

                        {/* CAMPOS DE CIUDAD Y PAÍS */}
                        <div className="col-md-6">
                            <label className="form-label fw-bold">País</label>
                            <input className="form-control" value={complejo.country} onChange={e => setComplejo({ ...complejo, country: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Ciudad</label>
                            <input className="form-control" value={complejo.city} onChange={e => setComplejo({ ...complejo, city: e.target.value })} required />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-bold">Teléfono</label>
                            <input className="form-control" value={complejo.phone} onChange={e => setComplejo({ ...complejo, phone: e.target.value })} required />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label fw-bold">Dirección Física</label>
                            <input className="form-control" value={complejo.address} onChange={e => setComplejo({ ...complejo, address: e.target.value })} required />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label fw-bold">Link de Google Maps</label>
                            <input className="form-control" placeholder="https://goo.gl..." value={complejo.google_map} onChange={e => setComplejo({ ...complejo, google_map: e.target.value })} />
                        </div>

                        {/* CAMPO PARA SUBIR FOTO */}
                        <div className="col-md-12 mt-3">
                            <label className="form-label fw-bold text-success">Foto o Logo del Complejo</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={e => setComplejo({ ...complejo, image: e.target.files })}
                            />
                            <div className="form-text">Formatos aceptados: JPG, PNG, WEBP.</div>
                        </div>

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm">
                                {id ? "Actualizar Cambios" : "Guardar Complejo"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <ul className="list-group shadow-sm border-0">
                    {complejos.length > 0 ? (
                        complejos.map(item => (
                            <ContactComplejoDeportivo key={item.id} complejo={item} onDelete={borrarComplejo} />
                        ))
                    ) : (
                        <li className="list-group-item text-center p-5 text-muted bg-light border-0">
                            No hay complejos registrados. ¡Comienza agregando uno!
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};
