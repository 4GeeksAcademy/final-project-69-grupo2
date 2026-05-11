import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const CanchasPorCategoria = () => {
    const [searchParams] = useSearchParams();
    const categoria = searchParams.get("categoria");
    const [canchas, setCanchas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (categoria) {
            fetch(import.meta.env.VITE_BACKEND_URL + `/api/canchas?categoria=${categoria}`)
                .then(r => r.json())
                .then(data => setCanchas(data))
                .catch(err => console.error(err));
        }
    }, [categoria]);

    return (
        <div className="container py-5">
            <h2 className="mb-2">{categoria}</h2>
            <p className="text-muted mb-4">Canchas disponibles para {categoria}</p>

            {canchas.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                    <p style={{ fontSize: "32px" }}>🏟</p>
                    <p className="text-muted">No hay canchas disponibles para esta categoría.</p>
                </div>
            ) : (
                <div className="row g-3">
                    {canchas.map(c => (
                        <div key={c.id} className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: 15 }}>
                                <img
                                    src={c.foto_url || "https://picsum.photos/seed/cancha1/600/400"}
                                    className="card-img-top"
                                    alt={c.nombre}
                                    style={{ height: "180px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <p className="text-muted small mb-1">
                                        <i className="fa fa-building me-1"></i>{c.complejo_nombre}
                                    </p>
                                    <h5 className="card-title fw-bold mb-2">{c.nombre}</h5>
                                    <p className="card-text text-success fw-bold fs-5">${Number(c.precio_hora).toLocaleString("es-CO")} / hr</p>
                                    <button
                                        className="btn w-100 shadow-sm"
                                        style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 10 }}
                                        onClick={() => {
                                            setTimeout(() => {
                                                navigate(`/reservar/${c.id}?cancha=${c.nombre}&categoria=${c.categoria_nombre}&precio=${c.precio_hora}`);
                                            }, 0);
                                        }}
                                    >
                                        Ver horarios y reservar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CanchasPorCategoria;