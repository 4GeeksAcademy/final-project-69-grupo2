// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { UserReservas } from "./UserReservas.jsx"; // Importamos el componente de los cuadritos

// const Reservas = () => {
//   const navigate = useNavigate();
//   const [canchas, setCanchas] = useState([]);
//   const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
//   const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

//   // 1. Cargar todas las canchas del sistema
//   useEffect(() => {
//     const cargarCanchas = async () => {
//       try {
//         const resp = await fetch(`${backendUrl}/api/canchas`);
//         if (resp.ok) setCanchas(await resp.json());
//       } catch (error) {
//         console.error("Error al cargar canchas:", error);
//       }
//     };
//     cargarCanchas();
//   }, []);

//   return (
//     <div className="container py-5" style={{ minHeight: "80vh" }}>
//       {/* Si NO hay una cancha seleccionada, mostramos la lista de canchas */}
//       {!canchaSeleccionada ? (
//         <>
//           <div className="text-center mb-5">
//             <h2 className="display-5 fw-bold">Elige tu Cancha 🏟️</h2>
//             <p className="text-muted">Selecciona el lugar donde quieres jugar hoy</p>
//           </div>

//           <div className="row">
//             {canchas.length > 0 ? (
//               canchas.map((c) => (
//                 <div key={c.id} className="col-md-4 mb-4">
//                   <div className="card h-100 shadow-sm border-0 overflow-hidden">
//                     <img
//                       src={c.foto_url || "https://placeholder.com"}
//                       className="card-img-top"
//                       alt={c.nombre}
//                       style={{ height: "180px", objectFit: "cover" }}
//                     />
//                     <div className="card-body">
//                       <p className="text-muted small mb-1">
//                         <i className="fa fa-building me-1"></i>
//                         {c.complejo_nombre}
//                       </p>
//                       <div className="d-flex justify-content-between align-items-center mb-2">
//                         <h5 className="card-title fw-bold mb-0">{c.nombre}</h5>
//                         <span className="badge bg-light text-primary border">{c.categoria_nombre}</span>
//                       </div>
//                       <p className="card-text text-success fw-bold fs-5">${c.precio_hora} / hr</p>
//                       <button
//                         className="btn w-100 shadow-sm"
//                         style={{ background: "#C8F135", color: "#111", fontWeight: 600 }}
//                         onClick={() => setCanchaSeleccionada(c)}
//                       >
//                         Reservar cancha
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center p-5">
//                 <p>No hay canchas disponibles en este momento.</p>
//               </div>
//             )}
//           </div>
//         </>
//       ) : (
//         /* Si HAY una cancha seleccionada, mostramos la cuadrícula de horarios */
//         <div>
//           <button
//             className="btn btn-outline-secondary mb-4"
//             onClick={() => setCanchaSeleccionada(null)}
//           >
//             <i className="fa fa-arrow-left me-2"></i>Volver a la lista
//           </button>

//           <UserReservas manualCanchaId={canchaSeleccionada.id} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reservas;
import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import ReservaCancha from "./ReservaCancha.jsx"; 

const Reservas = () => {
  const navigate = useNavigate();
  const [canchas, setCanchas] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  // 1. Cargar todas las canchas del sistema
  useEffect(() => {
    const cargarCanchas = async () => {
      try {
        const resp = await fetch(`${backendUrl}/api/canchas`);
        if (resp.ok) {
          const data = await resp.json();
          setCanchas(data);
        }
      } catch (error) {
        console.error("Error al cargar canchas:", error);
      }
    };
    cargarCanchas();
  }, [backendUrl]);

  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      {!canchaSeleccionada ? (
        <>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Elige tu Cancha 🏟️</h2>
            <p className="text-muted">Selecciona el lugar donde quieres jugar hoy</p>
          </div>

          <div className="row">
            {canchas.length > 0 ? (
              canchas.map((c) => (
                <div key={c.id} className="col-md-4 mb-4">
                  <div className="card h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: "15px" }}>
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
                      <p className="card-text text-success fw-bold fs-5">${c.precio_hora} / hr</p>
                      <button
                        className="btn w-100 shadow-sm"
                        style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: "10px" }}
                        onClick={() => setCanchaSeleccionada(c)}
                      >
                        Reservar ahora
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-5 w-100">
                <div className="spinner-border text-success mb-3"></div>
                <p>Buscando canchas disponibles...</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="animate__animated animate__fadeIn">
          <button
            className="btn btn-link text-decoration-none text-dark fw-bold mb-4"
            onClick={() => setCanchaSeleccionada(null)}
          >
            <i className="fa fa-arrow-left me-2"></i>Volver a la lista de canchas
          </button>

          <ReservaCancha canchaDesdePadre={canchaSeleccionada} />
        </div>
      )}
    </div>
  );
};

export default Reservas;
