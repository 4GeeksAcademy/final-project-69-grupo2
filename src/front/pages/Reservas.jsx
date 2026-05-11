
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserReservas } from "./UserReservas.jsx";

const Reservas = () => {
    const navigate = useNavigate();
    const [canchas, setCanchas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
    const [busquedaUbicacion, setBusquedaUbicacion] = useState("");
    const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const respC = await fetch(`${backendUrl}/api/canchas`);
                if (respC.ok) setCanchas(await respC.json());
                
                const respCat = await fetch(`${backendUrl}/api/categorias`);
                if (respCat.ok) setCategorias(await respCat.json());
            } catch (error) { 
                console.error("Error al cargar datos:", error); 
            }
        };
        cargarDatos();
    }, [backendUrl]);

    // ✅ LÓGICA DE FILTRADO COMBINADA
    const canchasFiltradas = canchas.filter(c => {
        const cumpleCategoria = categoriaSeleccionada === "Todas" || c.categoria_nombre === categoriaSeleccionada;

        const term = busquedaUbicacion.toLowerCase().trim();
        const cumpleBusqueda = !term ||
            c.complejo_pais?.toLowerCase().includes(term) ||    
            c.complejo_ciudad?.toLowerCase().includes(term) ||  
            c.complejo_nombre?.toLowerCase().includes(term) ||  
            c.nombre?.toLowerCase().includes(term);             

        return cumpleCategoria && cumpleBusqueda;
    });

    return (
        <div className="container py-5" style={{ minHeight: "80vh" }}>
            {!canchaSeleccionada ? (
                <>
                    {/* CABECERA CON BUSCADOR */}
                    <div className="text-center mb-5 animate__animated animate__fadeIn">
                        <h2 className="display-5 fw-bold" style={{ color: "#0d1b2a" }}>Reserva tu Cancha 🏟️</h2>
                        <div className="mx-auto mt-4" style={{ maxWidth: "550px" }}>
                            <div className="position-relative shadow-sm" style={{ borderRadius: "15px", overflow: "hidden", border: "1px solid #eee" }}>
                                <i className="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                <input
                                    type="text"
                                    className="form-control ps-5 py-3 border-0"
                                    placeholder="Buscar por nombre del Complejo Deportivo..."
                                    style={{ fontSize: "1rem" }}
                                    value={busquedaUbicacion}
                                    onChange={(e) => setBusquedaUbicacion(e.target.value)}
                                />
                                {busquedaUbicacion && (
                                    <button
                                        className="btn position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                                        onClick={() => setBusquedaUbicacion("")}
                                    >
                                        <i className="fa fa-times-circle"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FILTROS DE CATEGORÍA */}
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                        <button
                            className={`btn rounded-pill px-4 fw-bold shadow-sm ${categoriaSeleccionada === "Todas" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setCategoriaSeleccionada("Todas")}
                        >
                            Todas
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                className={`btn rounded-pill px-4 fw-bold shadow-sm ${categoriaSeleccionada === cat.nombre ? "btn-dark" : "btn-outline-dark"}`}
                                onClick={() => setCategoriaSeleccionada(cat.nombre)}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>

                    {/* GRILLA DE RESULTADOS */}
                    <div className="row g-4">
                        {canchasFiltradas.length > 0 ? (
                            canchasFiltradas.map((c) => (
                                <div key={c.id} className="col-md-6 col-lg-4 animate__animated animate__fadeInUp">
                                    <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: 20 }}>
                                        <div className="position-relative">
                                            <img
                                                src={c.foto_url || "https://placehold.co"}
                                                className="card-img-top"
                                                alt={c.nombre}
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <span className="badge bg-white text-dark position-absolute top-0 end-0 m-3 shadow-sm py-2 px-3" style={{ borderRadius: "10px" }}>
                                                {c.categoria_nombre}
                                            </span>
                                            <span className="badge bg-dark text-white position-absolute bottom-0 start-0 m-3 py-1 px-2 small" style={{ opacity: 0.8, borderRadius: "5px" }}>
                                                <i className="fa fa-map-marker-alt me-1 text-danger"></i> {c.complejo_ciudad || "Ubicación"}
                                            </span>
                                        </div>

                                        <div className="card-body p-4 text-center">
                                            <div className="mb-3 border-bottom pb-2">
                                                <p className="fw-bold text-primary mb-1 text-uppercase small" style={{ letterSpacing: "1px" }}>
                                                    <i className="fa fa-building me-1"></i> {c.complejo_nombre}
                                                </p>
                                                <p className="text-muted small mb-0">
                                                    {c.complejo_ciudad}, {c.complejo_pais}
                                                </p>
                                            </div>

                                            <h4 className="card-title fw-bold mb-3" style={{ color: "#0d1b2a" }}>{c.nombre}</h4>

                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <span className="text-muted small">Precio hora</span>
                                                <span className="text-success fw-bold fs-4">
                                                    ${Number(c.precio_hora || 0).toLocaleString("es-CO")}
                                                </span>
                                            </div>

                                            <button
                                                className="btn w-100 py-3 shadow-sm"
                                                style={{ background: "#C8F135", color: "#111", fontWeight: 700, borderRadius: "12px", border: "none" }}
                                                onClick={() => setCanchaSeleccionada(c)}
                                            >
                                                RESERVAR AHORA
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-5 w-100">
                                <i className="fa fa-search fa-3x text-muted mb-3"></i>
                                <p className="text-muted fs-5">No encontramos resultados para tu búsqueda.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* VISTA DE DETALLE DE RESERVA */
                <div className="animate__animated animate__fadeIn">
                    <button
                        className="btn btn-link text-dark fw-bold mb-4 text-decoration-none"
                        onClick={() => setCanchaSeleccionada(null)}
                    >
                        <i className="fa fa-arrow-left me-2"></i>Volver al listado
                    </button>
                    <UserReservas manualCanchaId={canchaSeleccionada.id} />
                </div>
            )}
        </div>
    );
};

export default Reservas;
