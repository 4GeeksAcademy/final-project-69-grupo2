import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ContactComplejoDeportivo from "../components/ContactComplejoDeportivo.jsx";

export const AddComplejoDeportivo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complejos, setComplejos] = useState([]);
    const [verFormulario, setVerFormulario] = useState(id ? true : false);

    const [complejo, setComplejo] = useState({
        name: "", email: "", phone: "", address: "", country: "", city: "", google_map: ""
    });

  
    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarDatos = async () => {
        try {
            const resp = await fetch(`${backendUrl}/api/complejos`);
            if (resp.ok) setComplejos(await resp.json());
        } catch (error) { console.error("Error lista:", error); }

        if (id) {
            try {
                const resp = await fetch(`${backendUrl}/api/complejo/${id}`);
                if (resp.ok) {
                    setComplejo(await resp.json());
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

        try {
            const response = await fetch(url, {
                method: method,
                body: JSON.stringify(complejo),
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                setComplejo({ name: "", email: "", phone: "", address: "", country: "", city: "", google_map: "" });
                await cargarDatos();
                setVerFormulario(false);
                navigate("/add-complejo");
            } else {
                alert("Error al guardar. Revisa la consola.");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    };

    const borrarComplejo = async (idBorrar) => {
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
                <h2>{verFormulario ? (id ? "Editar Complejo" : "Registrar Complejo") : "Lista de Complejos"}</h2>
                <button
                    className={`btn ${verFormulario ? "btn-outline-secondary" : "btn-primary"}`}
                    onClick={() => {
                        setVerFormulario(!verFormulario);
                        if (!verFormulario) setComplejo({ name: "", email: "", phone: "", address: "", country: "", city: "", google_map: "" });
                        if (id) navigate("/add-complejo");
                    }}
                >
                    {verFormulario ? "Volver a la Lista" : "Agregar Nuevo Complejo"}
                </button>
            </div>

            {verFormulario ? (
                <div className="card shadow-sm p-4 bg-light">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Nombre</label>
                            <input className="form-control" value={complejo.name} onChange={e => setComplejo({ ...complejo, name: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Email</label>
                            <input type="email" className="form-control" value={complejo.email} onChange={e => setComplejo({ ...complejo, email: e.target.value })} required />
                        </div>
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
                            <label className="form-label fw-bold">Dirección</label>
                            <input className="form-control" value={complejo.address} onChange={e => setComplejo({ ...complejo, address: e.target.value })} required />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label fw-bold">URL de Google Maps (Link)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="https://goo.gl..."
                                value={complejo.google_map}
                                onChange={e => setComplejo({ ...complejo, google_map: e.target.value })}
                            />
                        </div>
                        

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-success w-100">
                                {id ? "Actualizar Complejo" : "Guardar Complejo"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <ul className="list-group shadow-sm">
                    {complejos.length > 0 ? (
                        complejos.map(item => (
                            <ContactComplejoDeportivo key={item.id} complejo={item} onDelete={borrarComplejo} />
                        ))
                    ) : (
                        <li className="list-group-item text-center p-5 text-muted">No hay datos. Pulsa "Agregar Nuevo".</li>
                    )}
                </ul>
            )}
        </div>
    );
};