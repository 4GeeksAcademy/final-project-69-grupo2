// 

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
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/complejos")
      .then(r => r.json())
      .then(setComplejos)
      .catch(err => console.error("Error complejos:", err));
      
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/categorias")
      .then(r => r.json())
      .then(setCategorias)
      .catch(err => console.error("Error categorías:", err));
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
    color: activo ? "#EAF3DE" : "#666",
    border: "0.5px solid #ccc",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    cursor: "pointer",
    margin: "3px 2px",
    transition: "all 0.2s"
  });

  return (
    <div className="container py-5">
      <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>Todos los complejos</h2>
      <p className="text-muted mb-4">Descubre los mejores espacios deportivos.</p>

      {/* Barra de búsqueda */}
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
            color: filtrosActivos.length > 0 ? "#EAF3DE" : "#333",
            cursor: "pointer", fontSize: "13px", fontWeight: 500,
            display: "flex", alignItems: "center", gap: "6px"
          }}
        >
          ⚙ Filtros {filtrosActivos.length > 0 && `(${filtrosActivos.length})`}
        </button>
        {filtrosActivos.length > 0 && (
          <button onClick={limpiarTodo} className="btn btn-link btn-sm text-decoration-none text-muted">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tags de filtros activos */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filtrosActivos.map((f, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: "#EAF3DE", color: "#27500A", border: "0.5px solid #C0DD97" }}>
            {f.label}
            <span onClick={f.clear} style={{ cursor: "pointer", fontWeight: 700 }}>✕</span>
          </span>
        ))}
      </div>

      <p className="small text-muted mb-4">{complejosFiltrados.length} complejo(s) encontrado(s)</p>

      {/* Grid de Complejos */}
      <div className="row g-4">
        {complejosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ fontSize: "32px" }}>🏟</p>
            <p className="fw-bold mb-1">No hay complejos disponibles</p>
            <p className="text-muted small mb-3">Intenta ajustar o eliminar algunos filtros.</p>
            <button className="btn btn-outline-secondary btn-sm" onClick={limpiarTodo}>Limpiar filtros</button>
          </div>
        ) : (
          complejosFiltrados.map((complejo, idx) => (
            <div className="col-12 col-md-6 col-lg-4" key={complejo.id}>
              <div className="card border-0 shadow-sm h-100"
                style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden", transition: "transform 0.2s" }}
                onClick={() => navigate(`/complejos/${complejo.id}`)}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <img 
                  src={complejo.imagen_url || COMPLEJO_IMGS[idx % COMPLEJO_IMGS.length]}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }} 
                  alt={complejo.nombre} 
                />
                <div className="p-3">
                  <h5 className="fw-bold mb-1">{complejo.nombre}</h5>
                  <p className="text-muted small mb-2">📍 {complejo.city}, {complejo.country}</p>
                  <div className="mb-3">
                    <span className="badge rounded-pill" style={{ background: "#f0fad0", color: "#3a7a00", fontWeight: 500 }}>
                      {complejo.categoria}
                    </span>
                  </div>
                  <p className="mb-0" style={{ color: "#7cba00", fontWeight: 600, fontSize: "14px" }}>Ver detalles →</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar de Filtros */}
      {mostrarFiltros && (
        <>
          <div onClick={() => setMostrarFiltros(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1040 }} />
          <div style={{
            position: "fixed", top: 0, right: 0, height: "100vh", width: "320px",
            background: "#fff", zIndex: 1050, padding: "2rem", overflowY: "auto",
            boxShadow: "-5px 0 15px rgba(0,0,0,0.1)"
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold">Filtros</h5>
              <button className="btn-close" onClick={() => setMostrarFiltros(false)}></button>
            </div>

            <div className="mb-4">
              <label className="fw-bold small mb-2 d-block">CATEGORÍA</label>
              <div className="d-flex flex-wrap">
                {["Todas", ...categorias.map(cat => cat.nombre)].map(cat => (
                  <button key={cat} onClick={() => setCategoriaActiva(cat)} style={btnStyle(categoriaActiva === cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="fw-bold small mb-2 d-block">CIUDAD</label>
              <div className="d-flex flex-wrap">
                {ciudades.map(c => (
                  <button key={c} onClick={() => setCiudadActiva(c)} style={btnStyle(ciudadActiva === c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="fw-bold small mb-2 d-block">PAÍS</label>
              <div className="d-flex flex-wrap">
                {paises.map(p => (
                  <button key={p} onClick={() => setPaisActivo(p)} style={btnStyle(paisActivo === p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-dark w-100 mt-3" 
              onClick={() => setMostrarFiltros(false)}
              style={{ borderRadius: "10px" }}
            >
              Aplicar Filtros
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Complejos;
