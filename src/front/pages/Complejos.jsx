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
  const [ciudadActiva, setCiudadActiva] = useState("Todas");
  const [paisActivo, setPaisActivo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/complejos").then(r => r.json()).then(setComplejos);
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/categorias").then(r => r.json()).then(setCategorias);
  }, []);

  const ciudades = ["Todas", ...new Set(complejos.map(c => c.city).filter(Boolean))];
  const paises = ["Todos", ...new Set(complejos.map(c => c.country).filter(Boolean))];

  const complejosFiltrados = complejos.filter(c => {
    const porCategoria = categoriaActiva === "Todas" || c.categoria === categoriaActiva;
    const porCiudad = ciudadActiva === "Todas" || c.city === ciudadActiva;
    const porPais = paisActivo === "Todos" || c.country === paisActivo;
    const porBusqueda = !busqueda ||
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.city?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.country?.toLowerCase().includes(busqueda.toLowerCase());
    return porCategoria && porCiudad && porPais && porBusqueda;
  });

  const filtrosActivos = [
    categoriaActiva !== "Todas" && { label: categoriaActiva, clear: () => setCategoriaActiva("Todas") },
    ciudadActiva !== "Todas" && { label: ciudadActiva, clear: () => setCiudadActiva("Todas") },
    paisActivo !== "Todos" && { label: paisActivo, clear: () => setPaisActivo("Todos") },
  ].filter(Boolean);

  const limpiarTodo = () => {
    setCategoriaActiva("Todas");
    setCiudadActiva("Todas");
    setPaisActivo("Todos");
    setBusqueda("");
  };

  const btnStyle = (activo) => ({
    background: activo ? "#3B6D11" : "transparent",
    color: activo ? "#EAF3DE" : "var(--color-text-secondary)",
    border: "0.5px solid #ccc",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    cursor: "pointer",
    margin: "3px 2px"
  });

  return (
    <div className="container py-5">
      <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>Todos los complejos</h2>
      <p className="text-muted mb-4">Descubre los mejores espacios deportivos.</p>

      {/* Barra de búsqueda + botón filtros */}
      <div className="d-flex gap-3 mb-3 align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, ciudad o país..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ borderRadius: "20px", maxWidth: "400px" }}
        />
        <button
          onClick={() => setMostrarFiltros(true)}
          style={{
            padding: "8px 20px", borderRadius: "20px", border: "0.5px solid #ccc",
            background: filtrosActivos.length > 0 ? "#3B6D11" : "transparent",
            color: filtrosActivos.length > 0 ? "#EAF3DE" : "var(--color-text-primary)",
            cursor: "pointer", fontSize: "13px", fontWeight: 500,
            display: "flex", alignItems: "center", gap: "6px"
          }}
        >
          ⚙ Filtros {filtrosActivos.length > 0 && `(${filtrosActivos.length})`}
        </button>
        {filtrosActivos.length > 0 && (
          <button onClick={limpiarTodo} style={{ fontSize: "12px", color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tags de filtros activos */}
      {filtrosActivos.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {filtrosActivos.map((f, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: "#EAF3DE", color: "#27500A", border: "0.5px solid #C0DD97" }}>
              {f.label}
              <span onClick={f.clear} style={{ cursor: "pointer", fontWeight: 500 }}>✕</span>
            </span>
          ))}
        </div>
      )}

      {/* Contador */}
      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
        {complejosFiltrados.length} complejo(s) encontrado(s)
      </p>

      {/* Grid */}
      <div className="row g-4">
        {complejosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ fontSize: "32px" }}>🏟</p>
            <p style={{ fontWeight: 500, marginBottom: "4px" }}>No hay complejos disponibles</p>
            <p className="text-muted small mb-3">Intenta ajustar o eliminar algunos filtros.</p>
            <button onClick={limpiarTodo} style={{ padding: "6px 16px", borderRadius: "8px", border: "0.5px solid #ccc", background: "transparent", cursor: "pointer" }}>Limpiar filtros</button>
          </div>
        ) : (
          complejosFiltrados.map((complejo, idx) => (
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
                  <p className="text-muted small mb-1">📍 {complejo.city || "Ciudad no disponible"}{complejo.country ? `, ${complejo.country}` : ""}</p>
                  {complejo.phone && <p className="text-muted small mb-1">📞 {complejo.phone}</p>}
                  {complejo.google_map && (
                    <a href={complejo.google_map} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#7cba00", fontWeight: 600, fontSize: "12px", textDecoration: "none" }}>
                      🗺️ Google Maps
                    </a>
                  )}
                  <div className="mt-2">
                    <span style={{ background: "#f0fad0", color: "#3a7a00", fontSize: "12px", padding: "2px 10px", borderRadius: "20px" }}>
                      {complejo.categoria}
                    </span>
                  </div>
                  <p style={{ color: "#7cba00", fontWeight: 600, fontSize: "13px", marginTop: "8px", marginBottom: 0 }}>Ver más detalles →</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel de filtros lateral */}
      {mostrarFiltros && (
        <>
          <div onClick={() => setMostrarFiltros(false)}
           style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 998 }} />
          <div style={{
            position: "fixed", top: 0, right: 0, height: "100vh", width: "320px",
            background: "#ffffff", zIndex: 999,
            padding: "1.5rem", overflowY: "auto",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h5 style={{ fontWeight: 500, margin: 0 }}>Filtros</h5>
              <button onClick={() => setMostrarFiltros(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--color-text-secondary)" }}>✕</button>
            </div>

            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-tertiary)", marginBottom: "8px" }}>CATEGORÍA</p>
            <div style={{ marginBottom: "1.25rem" }}>
              <button style={btnStyle(categoriaActiva === "Todas")} onClick={() => setCategoriaActiva("Todas")}>Todas</button>
              {categorias.map((cat, i) => (
                <button key={i} style={btnStyle(categoriaActiva === cat.nombre)} onClick={() => setCategoriaActiva(cat.nombre)}>
                  {cat.nombre}
                </button>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "0.5px solid var(--color-border-tertiary)", margin: "1rem 0" }} />

            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-tertiary)", marginBottom: "8px" }}>CIUDAD</p>
            <div style={{ marginBottom: "1.25rem" }}>
              {ciudades.map((ciudad, i) => (
                <button key={i} style={btnStyle(ciudadActiva === ciudad)} onClick={() => setCiudadActiva(ciudad)}>
                  {ciudad}
                </button>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "0.5px solid var(--color-border-tertiary)", margin: "1rem 0" }} />

            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-tertiary)", marginBottom: "8px" }}>PAÍS</p>
            <div style={{ marginBottom: "1.25rem" }}>
              {paises.map((pais, i) => (
                <button key={i} style={btnStyle(paisActivo === pais)} onClick={() => setPaisActivo(pais)}>
                  {pais}
                </button>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "0.5px solid var(--color-border-tertiary)", margin: "1rem 0" }} />

            <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
              <button onClick={limpiarTodo}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "0.5px solid #ccc", background: "transparent", cursor: "pointer", fontSize: "13px" }}>
                Limpiar todo
              </button>
              <button onClick={() => setMostrarFiltros(false)}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#3B6D11", color: "#EAF3DE", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                Ver resultados
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Complejos;