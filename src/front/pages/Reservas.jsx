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
//                         Ver Horarios
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

//           {/* Reutilizamos el componente UserReservas (asegúrate de pasarlo a componente si lo prefieres) 
//               O simplemente insertamos la lógica de UserReservas aquí pasándole el ID.
//           */}
//           <UserReservas manualCanchaId={canchaSeleccionada.id} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reservas;
import { useNavigate } from "react-router-dom";

const Reservas = () => {
  const navigate = useNavigate();

  return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="text-center">
        <h1 style={{fontSize:"4rem"}}>🏟️</h1>
        <h2 style={{fontWeight:700,marginBottom:"12px"}}>Próximamente</h2>
        <p className="text-muted mb-4">El módulo de reservas está en desarrollo. ¡Vuelve pronto!</p>
        <button
          className="btn"
          style={{background:"#C8F135",color:"#111",fontWeight:600,padding:"10px 24px"}}
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Reservas;