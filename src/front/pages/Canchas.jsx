import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";

const Canchas = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categoria = searchParams.get("categoria");
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
  }, [id, categoria]);

  return (
    <div className="container py-5">
      <h2 className="mb-2">{complejo ? complejo.name : "Cargando..."}</h2>
      <p className="text-muted mb-4">{categoria}</p>
      {canchas.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <p className="text-muted mb-0">No hay canchas disponibles en este complejo.</p>
        </div>
      ) : (
        <div className="row g-3">
          {canchas.map(cancha => (
            <div className="col-4" key={cancha.id}>
              <div className="card h-100 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="card-body text-center">
                  <p className="card-text fw-medium mb-3">{cancha.nombre}</p>
                  <button
                    className="btn w-100"
                    style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 8 }}
                    onClick={() => navigate(`/reservar/${cancha.id}?complejo=${complejo?.name}&cancha=${cancha.nombre}&categoria=${categoria}`)}
                  >
                    Reservar cancha
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




