import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const Canchas = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categoria = searchParams.get("categoria");
  const [canchas, setCanchas] = useState([]);
  const [complejo, setComplejo] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + `/api/complejos/${id}`)
      .then(r => r.json())
      .then(data => setComplejo(data))
      .catch(err => console.error(err));

    fetch(import.meta.env.VITE_BACKEND_URL + `/api/canchas?complejo_id=${id}&categoria=${categoria}`)
      .then(r => r.json())
      .then(data => setCanchas(data))
      .catch(err => console.error(err));
  }, [id, categoria]);

  return (
    <div className="container py-5">
      <h2 className="mb-2">{complejo ? complejo.nombre : "Cargando..."}</h2>
      <p className="text-muted mb-4">{categoria}</p>
      {canchas.length === 0 ? (
        <p className="text-muted">No hay canchas disponibles.</p>
      ) : (
        <div className="row g-3">
          {canchas.map(cancha => (
            <div className="col-4" key={cancha.id}>
              <div className="card h-100">
                <div className="card-body text-center">
                  <p className="card-text fw-medium">{cancha.nombre}</p>
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





