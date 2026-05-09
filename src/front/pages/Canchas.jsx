import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const Canchas = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categoriaURL = searchParams.get("categoria");
  const [canchas, setCanchas] = useState([]);
  const [complejo, setComplejo] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(500000);
  const [ordenPrecio, setOrdenPrecio] = useState("ninguno");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  useEffect(() => {
    fetch(`${backendUrl}/api/complejo/${id}`)
      .then(r => r.json())
      .then(data => setComplejo(data))
      .catch(err => console.error(err));

    fetch(import.meta.env.VITE_BACKEND_URL + `/api/canchas?complejo_id=${id}`)
      .then(r => r.json())
      .then(data => setCanchas(data))
      .catch(err => console.error(err));
  }, [id]);

  const categorias = ["Todas", ...new Set(canchas.map(c => c.categoria_nombre).filter(Boolean))];

  const canchasFiltradas = canchas
    .filter(c => {
      const porBusqueda = !busqueda || c.nombre?.toLowerCase().includes(busqueda.toLowerCase());
      const porCategoria = categoriaActiva === "Todas" || c.categoria_nombre === categoriaActiva;
      const precio = c.precio_hora || 0;
      const porPrecio = precio >= precioMin && precio <= precioMax;
      return porBusqueda && porCategoria && porPrecio;
    })
    .sort((a, b) => {
      if (ordenPrecio === "menor") return a.precio_hora - b.precio_hora;
      if (ordenPrecio === "mayor") return b.precio_hora - a.precio_hora;
      return 0;
    });

  const filtrosActivos = [
    categoriaActiva !== "Todas" && { label: categoriaActiva, clear: () => setCategoriaActiva("Todas") },
    ordenPrecio !== "ninguno" && { label: ordenPrecio === "menor" ? "Menor precio" : "Mayor precio", clear: () => setOrdenPrecio("ninguno") },
    (precioMin > 0 || precioMax < 500000) && { label: `$${precioMin.toLocaleString()} - $${precioMax.toLocaleString()}`, clear: () => { setPrecioMin(0); setPrecioMax(500000); } },
  ].filter(Boolean);

  const limpiarTodo = () => {
    setCategoriaActiva("Todas");
    setOrdenPrecio("ninguno");
    setPrecioMin(0);
    setPrecioMax(500000);
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
    margin: "3px 2px"
  });

  return (
    <div className="container py-5">
      <h2 className="mb-2">{complejo ? complejo.name : "Cargando..."}</h2>
      <p className="text-muted mb-4">{categoriaURL}</p>

      {/* Barra búsqueda + filtros */}
      <div className="d-flex gap-3 mb-3 align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar cancha..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ borderRadius: "20px", maxWidth: "300px" }}
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

      {/* Tags filtros activos */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filtrosActivos.map((f, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: "#EAF3DE", color: "#27500A", border: "0.5px solid #C0DD97" }}>
            {f.label}
            <span onClick={f.clear} style={{ cursor: "pointer", fontWeight: 700 }}>✕</span>
          </span>
        ))}
      </div>

      <p className="small text-muted mb-4">{canchasFiltradas.length} cancha(s) encontrada(s)</p>

      {/* Grid canchas */}
      {canchasFiltradas.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <p style={{ fontSize: "32px" }}>🏟</p>
          <p className="text-muted mb-2">No hay canchas con esos filtros.</p>
          <button className="btn btn-outline-secondary btn-sm" onClick={limpiarTodo}>Limpiar filtros</button>
        </div>
      ) : (
        <div className="row g-3">
          {canchasFiltradas.map(c => (
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
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title fw-bold mb-0">{c.nombre}</h5>
                    <span className="badge bg-light text-primary border">{c.categoria_nombre}</span>
                  </div>
                  <p className="card-text text-success fw-bold fs-5">${Number(c.precio_hora).toLocaleString("es-CO")} / hr</p>
                  <button
                    className="btn w-100 shadow-sm"
                    style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 10 }}
                    onClick={() => navigate(`/reservar/${c.id}?complejo=${complejo?.name}&cancha=${c.nombre}&categoria=${c.categoria_nombre}&precio=${c.precio_hora}`)}
                  >
                    Ver horarios y reservar
                  </button>
                </div>
              </div>

              {/* LISTADO DE CANCHAS */}
              <div className="d-flex flex-column gap-4">
                {canchas.map(c => (
                  <div key={c.id} className="card shadow border-0 overflow-hidden animate__animated animate__fadeInUp"
                    style={{ borderRadius: 25, background: "#fff" }}>
                    <div className="row g-0 flex-column-reverse flex-md-row">

                      {/* LADO IZQUIERDO: INFORMACIÓN */}
                      <div className="col-md-5 p-4 d-flex flex-column justify-content-center">
                        <div className="mb-3">
                          {/* DATOS DEL COMPLEJO DENTRO DE LA TARJETA */}
                          <div className="mb-2">
                            <p className="fw-bold text-uppercase mb-0" style={{ fontSize: "0.7rem", color: "#6c757d", letterSpacing: "1px" }}>
                              <i className="fa fa-building me-1"></i> {complejo?.nombre || "Complejo Deportivo"}
                            </p>
                            <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                              <i className="fa fa-map-marker-alt me-1 text-danger"></i> {complejo?.city}, {complejo?.country}
                            </p>
                          </div>

                          <span className="badge bg-light text-primary border px-2 py-1 mb-2" style={{ borderRadius: 8, fontSize: "0.75rem" }}>
                            <i className="fa fa-tag me-1"></i>{c.categoria_nombre}
                          </span>
                          <h3 className="fw-bold h4 mb-2" style={{ color: "#0d1b2a" }}>{c.nombre}</h3>
                          <p className="text-muted small">
                            Instalaciones de primer nivel para {c.categoria_nombre.toLowerCase()}.
                          </p>
                        </div>

                        <div className="p-3 bg-light rounded-4 mb-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>Precio por hora</small>
                              <span className="fw-bold fs-4 text-success">${Number(c.precio_hora || 0).toLocaleString("es-CO")}</span>
                            </div>
                            <div className="text-muted small">
                              <i className="fa fa-clock me-1"></i> {complejo?.hora_apertura} - {complejo?.hora_cierre}
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-lg w-100 py-2 shadow-sm border-0"
                          style={{
                            background: "#C8F135",
                            color: "#111",
                            fontWeight: "800",
                            borderRadius: "15px",
                            fontSize: "1rem",
                            transition: "all 0.3s ease"
                          }}
                          onClick={() => navigate(`/reservar/${c.id}`)}
                        >
                          RESERVAR AHORA
                        </button>
                      </div>

                      {/* LADO DERECHO: IMAGEN */}
                      <div className="col-md-7 position-relative" style={{ minHeight: "350px" }}>
                        <img
                          src={c.foto_url || "https://placehold.co"}
                          alt={c.nombre}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
         
            ))}
          
          {/* Panel lateral filtros */}
          {mostrarFiltros && (
            <>
              <div onClick={() => setMostrarFiltros(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1040 }} />
              <div style={{
                position: "fixed", top: 0, right: 0, height: "100vh", width: "320px",
                background: "#fff", zIndex: 1050, padding: "2rem", overflowY: "auto",
                boxShadow: "-5px 0 15px rgba(0,0,0,0.1)"
              }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold">Filtros</h5>
                  <button className="btn-close" onClick={() => setMostrarFiltros(false)}></button>
                </div>

                {/* Categoría */}
                <div className="mb-4">
                  <label className="fw-bold small mb-2 d-block">CATEGORÍA</label>
                  <div className="d-flex flex-wrap">
                    {categorias.map(cat => (
                      <button key={cat} onClick={() => setCategoriaActiva(cat)} style={btnStyle(categoriaActiva === cat)}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <hr />

                {/* Ordenar por precio */}
                <div className="mb-4">
                  <label className="fw-bold small mb-2 d-block">ORDENAR POR PRECIO</label>
                  <div className="d-flex flex-wrap">
                    <button style={btnStyle(ordenPrecio === "ninguno")} onClick={() => setOrdenPrecio("ninguno")}>Sin orden</button>
                    <button style={btnStyle(ordenPrecio === "menor")} onClick={() => setOrdenPrecio("menor")}>Menor primero ↑</button>
                    <button style={btnStyle(ordenPrecio === "mayor")} onClick={() => setOrdenPrecio("mayor")}>Mayor primero ↓</button>
                  </div>
                </div>

                <hr />

                {/* Rango de precio */}
                <div className="mb-4">
                  <label className="fw-bold small mb-2 d-block">ESCALA DE PRECIOS</label>
                  <div className="d-flex gap-2 align-items-center mb-2">
                    <div>
                      <label className="small text-muted">Mínimo</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={precioMin}
                        onChange={e => setPrecioMin(Number(e.target.value))}
                        min="0"
                        style={{ borderRadius: "8px" }}
                      />
                    </div>
                    <span className="mt-3">—</span>
                    <div>
                      <label className="small text-muted">Máximo</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={precioMax}
                        onChange={e => setPrecioMax(Number(e.target.value))}
                        min="0"
                        style={{ borderRadius: "8px" }}
                      />
                    </div>
                  </div>
                  <p className="small text-muted">${precioMin.toLocaleString()} — ${precioMax.toLocaleString()}</p>
                </div>

                <hr />

                <button className="btn btn-dark w-100 mt-2" onClick={() => setMostrarFiltros(false)} style={{ borderRadius: "10px" }}>
                  Aplicar Filtros
                </button>
                <button className="btn btn-outline-secondary w-100 mt-2" onClick={() => { limpiarTodo(); setMostrarFiltros(false); }} style={{ borderRadius: "10px" }}>
                  Limpiar todo
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Canchas;
