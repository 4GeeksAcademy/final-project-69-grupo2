


import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const Canchas = () => {
  const { id } = useParams(); // ID del complejo
  const [searchParams] = useSearchParams();
  const categoriaURL = searchParams.get("categoria");
  const [canchas, setCanchas] = useState([]);
  const [complejo, setComplejo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + `/api/complejo/${id}`)
      .then(r => r.json())
      .then(data => setComplejo(data))
      .catch(err => console.error(err));

    fetch(import.meta.env.VITE_BACKEND_URL + `/api/canchas?complejo_id=${id}`)
      .then(r => r.json())
      .then(data => setCanchas(data))
      .catch(err => console.error(err));
  }, [id, categoriaURL]);

  return (
    <div className="container py-5">
      <h2 className="mb-2">{complejo ? complejo.name : "Cargando..."}</h2>
      <p className="text-muted mb-4">{categoriaURL}</p>
      
      {canchas.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <p className="text-muted mb-0">No hay canchas disponibles en este complejo.</p>
        </div>
      ) : (
        <div className="row g-3">
          {canchas.map(c => (
            <div key={c.id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: 15 }}>
                <img
                  src={c.foto_url || "https://placeholder.com"}
                  className="card-img-top"
                  alt={c.nombre}
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <p className="text-muted small mb-1">
                    <i className="fa fa-building me-1"></i>
                    {c.complejo_nombre}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title fw-bold mb-0">{c.nombre}</h5>
                    <span className="badge bg-light text-primary border">{c.categoria_nombre}</span>
                  </div>
                  <p className="card-text text-success fw-bold fs-5">${Number(c.precio_hora).toLocaleString("es-CO")} / hr</p>
                  
                
                  <button
                    className="btn w-100 shadow-sm"
                    style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 10 }}
                    onClick={() => navigate(
                      `/reservar/${c.id}?complejo=${complejo?.name}&cancha=${c.nombre}&categoria=${c.categoria_nombre}&precio=${c.precio_hora}`
                    )}
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

export default Canchas;

