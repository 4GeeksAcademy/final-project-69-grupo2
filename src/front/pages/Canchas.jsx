// import { useState, useEffect } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";

// const Canchas = () => {
//   const { id } = useParams();
//   const [searchParams] = useSearchParams();
//   const categoriaURL = searchParams.get("categoria");
//   const [canchas, setCanchas] = useState([]);
//   const [complejo, setComplejo] = useState(null);
//   const [mostrarFiltros, setMostrarFiltros] = useState(false);
//   const [busqueda, setBusqueda] = useState("");
//   const [categoriaActiva, setCategoriaActiva] = useState("Todas");
//   const [precioMin, setPrecioMin] = useState(0);
//   const [precioMax, setPrecioMax] = useState(500000);
//   const [ordenPrecio, setOrdenPrecio] = useState("ninguno");
//   const navigate = useNavigate();
//   const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

//   useEffect(() => {
//     fetch(`${backendUrl}/api/complejo/${id}`)
//       .then(r => r.json())
//       .then(data => setComplejo(data))
//       .catch(err => console.error(err));

//     fetch(import.meta.env.VITE_BACKEND_URL + `/api/canchas?complejo_id=${id}`)
//       .then(r => r.json())
//       .then(data => setCanchas(data))
//       .catch(err => console.error(err));
//   }, [id]);

//   const categorias = ["Todas", ...new Set(canchas.map(c => c.categoria_nombre).filter(Boolean))];

//   const canchasFiltradas = canchas
//     .filter(c => {
//       const porBusqueda = !busqueda || c.nombre?.toLowerCase().includes(busqueda.toLowerCase());
//       const porCategoria = categoriaActiva === "Todas" || c.categoria_nombre === categoriaActiva;
//       const precio = c.precio_hora || 0;
//       const porPrecio = precio >= precioMin && precio <= precioMax;
//       return porBusqueda && porCategoria && porPrecio;
//     })
//     .sort((a, b) => {
//       if (ordenPrecio === "menor") return a.precio_hora - b.precio_hora;
//       if (ordenPrecio === "mayor") return b.precio_hora - a.precio_hora;
//       return 0;
//     });

//   const filtrosActivos = [
//     categoriaActiva !== "Todas" && { label: categoriaActiva, clear: () => setCategoriaActiva("Todas") },
//     ordenPrecio !== "ninguno" && { label: ordenPrecio === "menor" ? "Menor precio" : "Mayor precio", clear: () => setOrdenPrecio("ninguno") },
//     (precioMin > 0 || precioMax < 500000) && { label: `$${precioMin.toLocaleString()} - $${precioMax.toLocaleString()}`, clear: () => { setPrecioMin(0); setPrecioMax(500000); } },
//   ].filter(Boolean);

//   const limpiarTodo = () => {
//     setCategoriaActiva("Todas");
//     setOrdenPrecio("ninguno");
//     setPrecioMin(0);
//     setPrecioMax(500000);
//     setBusqueda("");
//   };

//   const btnStyle = (activo) => ({
//     background: activo ? "#3B6D11" : "transparent",
//     color: activo ? "#EAF3DE" : "#666",
//     border: "0.5px solid #ccc",
//     borderRadius: "20px",
//     padding: "4px 12px",
//     fontSize: "12px",
//     cursor: "pointer",
//     margin: "3px 2px"
//   });

// return (
//   <div className="container py-5">
//     <h2 className="mb-2">{complejo ? complejo.name : "Cargando..."}</h2>
//     <p className="text-muted mb-4">{categoriaURL}</p>

//     {/* Barra búsqueda + filtros */}
//     <div className="d-flex gap-3 mb-3 align-items-center">
//       <input
//         type="text"
//         className="form-control"
//         placeholder="Buscar cancha..."
//         value={busqueda}
//         onChange={e => setBusqueda(e.target.value)}
//         style={{ borderRadius: "20px", maxWidth: "300px" }}
//       />
//       <button
//         onClick={() => setMostrarFiltros(true)}
//         style={{
//           padding: "8px 20px", borderRadius: "20px", border: "0.5px solid #ccc",
//           background: filtrosActivos.length > 0 ? "#3B6D11" : "transparent",
//           color: filtrosActivos.length > 0 ? "#EAF3DE" : "#333",
//           cursor: "pointer", fontSize: "13px", fontWeight: 500,
//           display: "flex", alignItems: "center", gap: "6px"
//         }}
//       >
//         ⚙ Filtros {filtrosActivos.length > 0 && `(${filtrosActivos.length})`}
//       </button>
//       {filtrosActivos.length > 0 && (
//         <button onClick={limpiarTodo} className="btn btn-link btn-sm text-decoration-none text-muted">
//           Limpiar filtros
//         </button>
//       )}
//     </div>

//     {/* Tags filtros activos */}
//     <div className="d-flex flex-wrap gap-2 mb-3">
//       {filtrosActivos.map((f, i) => (
//         <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: "#EAF3DE", color: "#27500A", border: "0.5px solid #C0DD97" }}>
//           {f.label}
//           <span onClick={f.clear} style={{ cursor: "pointer", fontWeight: 700 }}>✕</span>
//         </span>
//       ))}
//     </div>

//     <p className="small text-muted mb-4">{canchasFiltradas.length} cancha(s) encontrada(s)</p>

//     {/* Grid de canchas filtradas */}
//     {canchasFiltradas.length === 0 ? (
//       <div className="text-center py-5 bg-light rounded">
//         <p style={{ fontSize: "32px" }}>🏟</p>
//         <p className="text-muted mb-2">No hay canchas con esos filtros.</p>
//         <button className="btn btn-outline-secondary btn-sm" onClick={limpiarTodo}>Limpiar filtros</button>
//       </div>
//     ) : (
//       <div className="row g-3">
//         {canchasFiltradas.map(c => (
//           <div key={c.id} className="col-md-4 mb-4">
//             <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: 15 }}>
//               <img
//                 src={c.foto_url || "https://placehold.co"} 
//                 className="card-img-top"
//                 alt={c.nombre}
//                 style={{ height: "180px", objectFit: "cover" }}
//               />
//               <div className="card-body">
//                 <p className="text-muted small mb-1">
//                   <i className="fa fa-building me-1"></i>{c.complejo_nombre}
//                 </p>
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <h5 className="card-title fw-bold mb-0">{c.nombre}</h5>
//                   <span className="badge bg-light text-primary border">{c.categoria_nombre}</span>
//                 </div>
//                 <p className="card-text text-success fw-bold fs-5">${Number(c.precio_hora).toLocaleString("es-CO")} / hr</p>
//                 <button
//                   className="btn w-100 shadow-sm"
//                   style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 10 }}
//                   onClick={() => navigate(`/reservar/${c.id}`)}
//                 >
//                   Ver horarios y reservar
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     )}

//     {/* Panel lateral filtros (ejemplo simplificado) */}
//     {mostrarFiltros && (
//       <>
//         <div onClick={() => setMostrarFiltros(false)}
//           style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1040 }} />
//         <div style={{ position: "fixed", top: 0, right: 0, height: "100%", width: "300px", background: "white", zIndex: 1050, padding: "20px" }}>
//           <h4>Filtros</h4>
//           {/* Aquí iría tu contenido de filtros */}
//           <button className="btn btn-primary w-100" onClick={() => setMostrarFiltros(false)}>Cerrar</button>
//         </div>
//       </>
//     )}
//   </div>
// );

// }

// export default Canchas;



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
      .catch(err => console.error("Error cargando complejo:", err));

    fetch(`${backendUrl}/api/canchas?complejo_id=${id}`)
      .then(r => r.json())
      .then(data => setCanchas(data))
      .catch(err => console.error("Error cargando canchas:", err));
  }, [id, backendUrl]);

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

  return (
    <div className="container py-5">
      <h2 className="mb-2">{complejo ? complejo.nombre || complejo.name : "Cargando..."}</h2>
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
          className="btn btn-outline-dark"
          style={{
            padding: "8px 20px", borderRadius: "20px",
            background: filtrosActivos.length > 0 ? "#3B6D11" : "transparent",
            color: filtrosActivos.length > 0 ? "#EAF3DE" : "#333",
            fontSize: "13px", fontWeight: 500
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

      {/* Grid de canchas */}
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
                  src={c.foto_url || "https://placehold.co"} 
                  className="card-img-top"
                  alt={c.nombre}
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <p className="text-muted small mb-1">
                    <i className="fa fa-building me-1"></i>{c.complejo_nombre || complejo?.nombre}
                  </p>

                  {/* SECCIÓN DINÁMICA: GOOGLE MAPS */}
                  {complejo?.google_map && (
                    <div className="mb-2">
                      <a 
                        href={complejo.google_map} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-decoration-none small d-flex align-items-center"
                        style={{ color: "#3B6D11", fontWeight: 500 }}
                      >
                        <i className="fa fa-map-marker-alt me-1 text-danger"></i>
                        Ver ubicación en Maps
                      </a>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title fw-bold mb-0">{c.nombre}</h5>
                    <span className="badge bg-light text-primary border">{c.categoria_nombre}</span>
                  </div>
                  <p className="card-text text-success fw-bold fs-5">${Number(c.precio_hora).toLocaleString("es-CO")} / hr</p>
                  <button
                    className="btn w-100 shadow-sm"
                    style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 10 }}
                    onClick={() => navigate(`/reservar/${c.id}`)}
                  >
                    Ver horarios y reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panel lateral filtros */}
      {mostrarFiltros && (
        <>
          <div onClick={() => setMostrarFiltros(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1040 }} />
          <div style={{ position: "fixed", top: 0, right: 0, height: "100%", width: "320px", background: "white", zIndex: 1050, padding: "25px", boxShadow: "-5px 0 15px rgba(0,0,0,0.1)" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Filtros</h4>
              <button className="btn-close" onClick={() => setMostrarFiltros(false)}></button>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-uppercase">Categoría</label>
              <select className="form-select" value={categoriaActiva} onChange={e => setCategoriaActiva(e.target.value)}>
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-uppercase">Ordenar por precio</label>
              <select className="form-select" value={ordenPrecio} onChange={e => setOrdenPrecio(e.target.value)}>
                <option value="ninguno">Por defecto</option>
                <option value="menor">Menor a mayor</option>
                <option value="mayor">Mayor a menor</option>
              </select>
            </div>

            <button className="btn btn-dark w-100 py-2" style={{ borderRadius: "10px" }} onClick={() => setMostrarFiltros(false)}>
              Aplicar Filtros
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Canchas;
