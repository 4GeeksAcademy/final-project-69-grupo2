import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Landing = () => {
  const [complejos, setComplejos] = useState([]);
  const [indice, setIndice] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoria = searchParams.get("categoria");

  useEffect(() => {
    const url = categoria
      ? import.meta.env.VITE_BACKEND_URL + `/api/complejos?categoria=${categoria}`
      : import.meta.env.VITE_BACKEND_URL + "/api/complejos";

    fetch(url)
      .then(r => r.json())
      .then(data => { setComplejos(data); setIndice(0); })
      .catch(err => console.error("Error complejos:", err));
  }, [categoria]);

  const anterior = () => setIndice(i => (i === 0 ? complejos.length - 1 : i - 1));
  const siguiente = () => setIndice(i => (i === complejos.length - 1 ? 0 : i + 1));
  const handleComplejo = (complejo) => navigate(`/complejos/${complejo.id}?categoria=${complejo.categoria}`);

  const visibles = complejos.slice(indice, indice + 3);

  return (
    <div className="container py-5">
      <h2 className="mb-4">{categoria ? categoria : "Todos los complejos"}</h2>
      {complejos.length === 0 ? (
        <p className="text-muted">No hay complejos disponibles.</p>
      ) : (
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary" onClick={anterior}>‹</button>
          <div className="row flex-grow-1 g-3">
            {visibles.map(complejo => (
              <div className="col-4" key={complejo.id}>
                <div className="card h-100" style={{cursor: "pointer"}} onClick={() => handleComplejo(complejo)}>
                  <img
                    src={complejo.imagen_url || "https://placehold.co/400x200"}
                    className="card-img-top"
                    alt={complejo.nombre}
                    style={{height: "160px", objectFit: "cover"}}
                  />
                  <div className="card-body text-center">
                    <p className="card-text fw-medium">{complejo.nombre}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-outline-secondary" onClick={siguiente}>›</button>
        </div>
      )}
    </div>
  );
};

export default Landing;
