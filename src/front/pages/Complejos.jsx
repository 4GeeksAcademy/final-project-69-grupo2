import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const COMPLEJO_IMGS = [
  "https://picsum.photos/seed/cancha1/600/400",
  "https://picsum.photos/seed/cancha2/600/400",
  "https://picsum.photos/seed/cancha3/600/400",
];

const Complejos = () => {
  const [complejos, setComplejos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/complejos").then(r => r.json()).then(setComplejos);
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/categorias").then(r => r.json()).then(setCategorias);
  }, []);

  const complejosFiltrados = categoriaActiva === "Todas"
    ? complejos
    : complejos.filter(c => c.categoria === categoriaActiva);

  return (
    <div className="container py-5">
      <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>Todos los complejos</h2>
      <p className="text-muted mb-4">Descubre los mejores espacios deportivos.</p>

      {/* Filtros */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        <button
          className="btn btn-sm"
          style={{
            background: categoriaActiva === "Todas" ? "#7cba00" : "transparent",
            color: categoriaActiva === "Todas" ? "#fff" : "#555",
            border: "1px solid #ccc", borderRadius: "20px"
          }}
          onClick={() => setCategoriaActiva("Todas")}
        >
          Todas
        </button>
        {categorias.map((cat, i) => (
          <button key={i} className="btn btn-sm"
            style={{
              background: categoriaActiva === cat.nombre ? "#7cba00" : "transparent",
              color: categoriaActiva === cat.nombre ? "#fff" : "#555",
              border: "1px solid #ccc", borderRadius: "20px"
            }}
            onClick={() => setCategoriaActiva(cat.nombre)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="row g-4">
        {complejosFiltrados.map((complejo, idx) => (
          <div className="col-4" key={complejo.id}>
            <div className="card border-0 shadow-sm h-100"
              style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden", transition: "transform 0.2s ease" }}
              onClick={() => navigate(`/complejos/${complejo.id}?categoria=${complejo.categoria}`)}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <img src={complejo.imagen_url || COMPLEJO_IMGS[idx % COMPLEJO_IMGS.length]}
                style={{ width: "100%", height: "200px", objectFit: "cover" }} alt={complejo.nombre} />
              <div className="p-3">
                <h5 style={{ fontWeight: 700, marginBottom: "4px" }}>{complejo.nombre}</h5>
                <p className="text-muted small mb-2">
                  📍 {complejo.city || complejo.address || "Ubicación no disponible"}
                </p>
                {complejo.phone && (
                  <p className="text-muted small mb-2">
                    📞 {complejo.phone}
                  </p>
                )}
                {complejo.email && (
                  <p className="text-muted small mb-2">
                    ✉️ {complejo.email}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                  {complejo.google_map && (
                    <a href={complejo.google_map} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#7cba00", fontWeight: 600, fontSize: "12px", textDecoration: "none" }}>
                      🗺️ Google Maps
                    </a>
                  )}
                </div>
                <span style={{ background: "#f0fad0", color: "#3a7a00", fontSize: "12px", padding: "2px 10px", borderRadius: "20px" }}>
                  {complejo.categoria}
                </span>
                <p style={{ color: "#7cba00", fontWeight: 600, fontSize: "13px", marginTop: "8px", marginBottom: 0 }}>Ver más detalles →</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Complejos;