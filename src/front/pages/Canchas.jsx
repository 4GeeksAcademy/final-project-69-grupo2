import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Canchas = () => {
    const { id } = useParams();
    const [canchas, setCanchas] = useState([]);
    const [complejo, setComplejo] = useState(null);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    useEffect(() => {
        fetch(`${backendUrl}/api/complejo/${id}`)
            .then(r => r.json())
            .then(data => setComplejo(data))
            .catch(err => console.error(err));

        fetch(`${backendUrl}/api/canchas?complejo_id=${id}`)
            .then(r => r.json())
            .then(data => setCanchas(data))
            .catch(err => console.error(err));
    }, [id, backendUrl]);

    return (
        <div className="container py-5">
            {/* CABECERA DEL COMPLEJO */}
            <div className="mb-5 animate__animated animate__fadeIn">
                <h1 className="fw-bold mb-1" style={{ fontSize: "2.5rem", color: "#0d1b2a", letterSpacing: "-1px" }}>
                   COMPLEJO DEPORTIVO:       {complejo?.nombre || complejo?.name || "Cargando..."}
                </h1>
                
                <div className="d-flex flex-wrap gap-3 mt-2">
                    {complejo?.google_map && (
                        <a href={complejo.google_map.startsWith('http') ? complejo.google_map : `https://${complejo.google_map}`}
                            target="_blank" rel="noopener noreferrer" className="text-decoration-none text-secondary small">
                            <i className="fa fa-map-marker-alt me-2 text-danger"></i>
                            {complejo?.address}
                            {(complejo?.city || complejo?.country) && `, ${complejo?.city}${complejo?.country ? ` - ${complejo?.country}` : ""}`}
                        </a>
                    )}
                    <span className="text-secondary small">
                        <i className="fa fa-phone me-2 text-success"></i>
                        {complejo?.phone}
                    </span>
                </div>
            </div>

            {/* LISTADO DE CANCHAS */}
            <div className="d-flex flex-column gap-4">
                {canchas.map(c => (
                    <div key={c.id} className="card shadow border-0 overflow-hidden animate__animated animate__fadeInUp"
                        style={{ borderRadius: 25, background: "#fff" }}>
                        <div className="row g-0 flex-column-reverse flex-md-row">

                            {/* LADO IZQUIERDO: INFORMACIÓN */}
                            <div className="col-md-5 p-4 d-flex flex-column justify-content-center">
                                <div className="mb-3">
                                    {/* DATOS DEL COMPLEJO DENTRO DE LA TARJETA */}
                                    <div className="mb-2">
                                        <p className="fw-bold text-uppercase mb-0" style={{ fontSize: "0.7rem", color: "#6c757d", letterSpacing: "1px" }}>
                                            <i className="fa fa-building me-1"></i> {complejo?.nombre || "Complejo Deportivo"}
                                        </p>
                                        <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                                            <i className="fa fa-map-marker-alt me-1 text-danger"></i> {complejo?.city}, {complejo?.country}
                                        </p>
                                    </div>

                                    <span className="badge bg-light text-primary border px-2 py-1 mb-2" style={{ borderRadius: 8, fontSize: "0.75rem" }}>
                                        <i className="fa fa-tag me-1"></i>{c.categoria_nombre}
                                    </span>
                                    <h3 className="fw-bold h4 mb-2" style={{ color: "#0d1b2a" }}>{c.nombre}</h3>
                                    <p className="text-muted small">
                                        Instalaciones de primer nivel para {c.categoria_nombre.toLowerCase()}.
                                    </p>
                                </div>

                                <div className="p-3 bg-light rounded-4 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>Precio por hora</small>
                                            <span className="fw-bold fs-4 text-success">${Number(c.precio_hora || 0).toLocaleString("es-CO")}</span>
                                        </div>
                                        <div className="text-muted small">
                                            <i className="fa fa-clock me-1"></i> {complejo?.hora_apertura} - {complejo?.hora_cierre}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-lg w-100 py-2 shadow-sm border-0"
                                    style={{
                                        background: "#C8F135",
                                        color: "#111",
                                        fontWeight: "800",
                                        borderRadius: "15px",
                                        fontSize: "1rem",
                                        transition: "all 0.3s ease"
                                    }}
                                    onClick={() => navigate(`/reservar/${c.id}`)}
                                >
                                    RESERVAR AHORA
                                </button>
                            </div>

                            {/* LADO DERECHO: IMAGEN */}
                            <div className="col-md-7 position-relative" style={{ minHeight: "350px" }}>
                                <img
                                    src={c.foto_url || "https://placehold.co"}
                                    alt={c.nombre}
                                    className="w-100 h-100"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Canchas;




