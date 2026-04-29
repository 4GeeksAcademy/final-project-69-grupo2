import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

const Canchas = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categoria = searchParams.get("categoria");
  const [canchas, setCanchas] = useState([]);
  const [complejo, setComplejo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    // Peticiones en paralelo
    const cargarComplejo = fetch(`${baseUrl}/api/complejo/${id}`).then(r => r.ok ? r.json() : null);
    const cargarCanchas = fetch(`${baseUrl}/api/canchas?complejo_id=${id}&categoria=${categoria || ''}`).then(r => r.ok ? r.json() : []);

    Promise.all([cargarComplejo, cargarCanchas])
      .then(([dataComplejo, dataCanchas]) => {
        setComplejo(dataComplejo);
        setCanchas(dataCanchas);
      })
      .catch(err => console.error("Error cargando datos:", err))
      .finally(() => setCargando(false));
  }, [id, categoria]);

  return (
    <div className="container py-5">
      {/* Información del Complejo (Cartel) */}
      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Cargando complejo...</p>
        </div>
      ) : complejo ? (
        <div className="card mb-5 shadow border-0">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="d-flex align-items-center mb-3">
                  <i className="fa fa-building text-primary me-3" style={{ fontSize: "1.5rem" }}></i>
                  <h1 className="h3 mb-0 fw-bold">{complejo.nombre}</h1>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="bg-light p-2 px-3 rounded">
                      <h6 className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>UBICACIÓN</h6>
                      <p className="mb-0 small fw-medium">{complejo.address}</p>
                      <p className="mb-0 small text-muted">{complejo.city}, {complejo.country}</p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light p-2 px-3 rounded">
                      <h6 className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>CONTACTO</h6>
                      {complejo.phone && <p className="mb-0 small"><i className="fa fa-phone text-success me-2"></i>{complejo.phone}</p>}
                      {complejo.email && <p className="mb-0 small text-truncate"><i className="fa fa-envelope text-primary me-2"></i>{complejo.email}</p>}
                    </div>
                  </div>
                </div>

                {complejo.google_map && (
                  <div className="mt-3">
                    <a href={complejo.google_map} target="_blank" rel="noopener noreferrer"
                      className="btn btn-success btn-sm px-3">
                      <i className="fa fa-map me-2"></i>Ver en Google Maps
                    </a>
                  </div>
                )}
              </div>

              {complejo.imagen_url && (
                <div className="col-lg-4 mt-3 mt-lg-0">
                  <img
                    src={complejo.imagen_url}
                    alt={complejo.nombre}
                    className="img-fluid rounded shadow-sm"
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-light text-center">No se pudo cargar la información.</div>
      )}

      {/* Listado de Canchas */}
      <h4 className="mb-4 fw-bold">Canchas Disponibles</h4>
      {canchas.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <p className="text-muted mb-0">No hay canchas disponibles en este complejo.</p>
        </div>
      ) : (
        <div className="row g-3">
          {canchas.map(cancha => (
            <div className="col-md-4 mb-3" key={cancha.id}>
              <div className="card h-100 shadow-sm border-0">
                {cancha.foto_url && (
                  <img
                    src={cancha.foto_url}
                    alt={cancha.nombre}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold h6">{cancha.nombre}</h5>
                  <p className="card-text text-success fw-bold fs-5 mb-2">${cancha.precio_hora} / hr</p>
                  
                  <div className="mt-auto">
                    <Link className="btn btn-primary btn-sm w-100 fw-bold mb-2" to={`/reservar/${cancha.id}`}>
                        Reservar
                    </Link>
                    <span className="badge bg-light text-primary border w-100">{cancha.categoria_nombre}</span>
                  </div>
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




