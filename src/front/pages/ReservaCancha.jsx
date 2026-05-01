// import React, { useState, useEffect } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// const ReservaCancha = ({ canchaDesdePadre = null }) => {
//     // Coincide con path="/reservar/:canchaId" de tu router
//     const { canchaId } = useParams();
//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();
//     const { store } = useGlobalReducer();

//     // Prioridad: 1. Prop del padre, 2. Parámetro de URL
//     const idFinal = canchaDesdePadre?.id || canchaId;
//     const complejo_nombre = canchaDesdePadre?.complejo_nombre || searchParams.get("complejo") || "Complejo";
//     const cancha_nombre = canchaDesdePadre?.nombre || searchParams.get("cancha") || "Cancha";
//     const categoria = canchaDesdePadre?.categoria_nombre || searchParams.get("categoria") || "";

//     const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
//     const [horaSeleccionada, setHoraSeleccionada] = useState("");
//     const [reservas, setReservas] = useState([]);
//     const [cargando, setCargando] = useState(false);
//     const [paso, setPaso] = useState(1);

//     const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

//     // Generar horas en formato 24h (como espera tu API)
//     const generarHoras = () => {
//         let horas = [];
//         let inicio = 8; // Podrías usar canchaDesdePadre?.hora_apertura si existe
//         let fin = 23;
//         for (let i = inicio; i < fin; i++) {
//             horas.push(`${i < 10 ? "0" + i : i}:00`);
//         }
//         return horas;
//     };

//     // Cargar reservas para marcar las horas ocupadas
//     useEffect(() => {
//         if (!idFinal) return;
//         const cargarReservas = async () => {
//             setCargando(true);
//             try {
//                 // Usamos tu endpoint: /api/reservas/[id]
//                 const res = await fetch(`${backendUrl}/api/reservas/${idFinal}`);
//                 if (res.ok) {
//                     const data = await res.json();
//                     setReservas(data);
//                 }
//             } catch (error) {
//                 console.error("Error al cargar reservas:", error);
//             } finally {
//                 setCargando(false);
//             }
//         };
//         cargarReservas();
//     }, [idFinal, fecha]);

//     const handleConfirmar = async () => {
//         if (!idFinal) return;
//         if (!store.auth.isAuthenticated) {
//             alert("Debes iniciar sesión para realizar una reserva.");
//             return;
//         }

//         if (!window.confirm(`¿Confirmas la reserva para el ${fecha} a las ${horaSeleccionada}hs?`)) return;

//         try {
//             const resp = await fetch(`${backendUrl}/api/reserva`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     fecha: fecha,
//                     hora: horaSeleccionada,
//                     cancha_id: parseInt(idFinal),
//                     user_id: store.auth.user.id,
//                     es_bloqueo: false
//                 })
//             });

//             if (resp.ok) {
//                 alert("¡Reserva creada exitosamente!");
//                 navigate("/reservas"); // Redirige a la lista de reservas del usuario
//             } else {
//                 const errorData = await resp.json();
//                 alert(`Error: ${errorData.error || "No se pudo completar la reserva"}`);
//             }
//         } catch (error) {
//             console.error("Error en la solicitud:", error);
//             alert("Error de conexión con el servidor.");
//         }
//     };

//     return (
//         <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: 16 }}>
//             <div className="mb-4">
//                 <p className="text-muted small mb-1">Reserva de espacio deportivo</p>
//                 <h3 className="fw-bold" style={{ color: "#0d1b2a" }}>{complejo_nombre} — {cancha_nombre}</h3>
//                 <span className="badge bg-light text-dark border">{categoria}</span>
//             </div>

//             {/* Pasos Visuales */}
//             <div className="d-flex align-items-center gap-3 mb-4">
//                 {["Fecha", "Horario", "Confirmar"].map((label, i) => (
//                     <div key={i} className="d-flex align-items-center gap-2">
//                         <div style={{
//                             width: 28, height: 28, borderRadius: "50%", display: "flex",
//                             alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold",
//                             background: paso === i + 1 ? "#0d1b2a" : paso > i + 1 ? "#7cba00" : "#eee",
//                             color: paso === i + 1 ? "#C8F135" : "#fff"
//                         }}>{i + 1}</div>
//                         <span className="small fw-medium" style={{ color: paso === i + 1 ? "#111" : "#999" }}>{label}</span>
//                         {i < 2 && <div style={{ width: 20, height: 1, background: "#ddd" }} />}
//                     </div>
//                 ))}
//             </div>

//             <div className="row g-4">
//                 <div className="col-md-7">
//                     <label className="form-label small fw-bold text-uppercase text-muted">1. Elige el día</label>
//                     <input
//                         type="date"
//                         className="form-control mb-4"
//                         min={new Date().toISOString().split("T")[0]}
//                         value={fecha}
//                         onChange={(e) => { setFecha(e.target.value); setHoraSeleccionada(""); setPaso(1); }}
//                         style={{ maxWidth: "220px", borderRadius: "10px" }}
//                     />

//                     <label className="form-label small fw-bold text-uppercase text-muted">2. Selecciona la hora</label>
//                     {cargando ? (
//                         <div className="py-3"><div className="spinner-border spinner-border-sm text-success"></div></div>
//                     ) : (
//                         <div className="d-flex flex-wrap gap-2">
//                             {generarHoras().map((h) => {
//                                 const isOcupado = reservas.some(r => r.fecha === fecha && r.hora === h);
//                                 const isSelected = horaSeleccionada === h;
//                                 return (
//                                     <button
//                                         key={h}
//                                         disabled={isOcupado}
//                                         onClick={() => { setHoraSeleccionada(h); setPaso(2); }}
//                                         className="btn btn-sm"
//                                         style={{
//                                             minWidth: "75px",
//                                             borderRadius: "8px",
//                                             fontSize: "13px",
//                                             fontWeight: "500",
//                                             transition: "0.2s",
//                                             background: isSelected ? "#0d1b2a" : isOcupado ? "#f8f9fa" : "#EAF3DE",
//                                             color: isSelected ? "#C8F135" : isOcupado ? "#adb5bd" : "#27500A",
//                                             border: isSelected ? "1px solid #0d1b2a" : "1px solid #C0DD97",
//                                             textDecoration: isOcupado ? "line-through" : "none"
//                                         }}
//                                     >
//                                         {h}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>

//                 <div className="col-md-5">
//                     <div className="p-4 border-0 shadow-sm bg-light" style={{ borderRadius: 15, position: "sticky", top: "20px" }}>
//                         <h6 className="fw-bold mb-3">Detalle de reserva</h6>
//                         <div className="d-flex justify-content-between mb-2">
//                             <span className="text-muted">Fecha:</span>
//                             <span className="fw-bold">{fecha}</span>
//                         </div>
//                         <div className="d-flex justify-content-between mb-2">
//                             <span className="text-muted">Horario:</span>
//                             <span className="fw-bold">{horaSeleccionada || "No seleccionado"}</span>
//                         </div>
//                         <hr />
//                         <div className="d-flex justify-content-between mb-4">
//                             <span className="fw-bold">Total:</span>
//                             <span className="fw-bold text-success">$50.000</span>
//                         </div>
                        
//                         <button
//                             className="btn w-100 py-2 shadow-sm"
//                             disabled={!horaSeleccionada}
//                             onClick={() => { setPaso(3); handleConfirmar(); }}
//                             style={{ background: "#C8F135", color: "#111", fontWeight: "bold", borderRadius: "10px" }}
//                         >
//                             CONFIRMAR RESERVA
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ReservaCancha;
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const ReservaCancha = ({ canchaDesdePadre = null }) => {
    const { canchaId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    const idFinal = canchaDesdePadre?.id || canchaId;
    const [cancha, setCancha] = useState(canchaDesdePadre);
    const [complejo, setComplejo] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [horaSeleccionada, setHoraSeleccionada] = useState("");
    const [cargando, setCargando] = useState(false);
    const [paso, setPaso] = useState(1);

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    // Lógica para detectar el estado de la hora seleccionada
    const reservaEnHora = reservas.find(r => r.fecha === fecha && r.hora === horaSeleccionada);
    const estaOcupada = !!reservaEnHora;
    const estaCerrada = reservaEnHora?.es_bloqueo;

    useEffect(() => {
        if (!idFinal) return;
        const cargarInfo = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/cancha/${idFinal}`);
                if (res.ok) {
                    const data = await res.json();
                    setCancha(data);
                    if (data.complejo_id) {
                        const resC = await fetch(`${backendUrl}/api/complejo/${data.complejo_id}`);
                        if (resC.ok) setComplejo(await resC.json());
                    }
                }
            } catch (e) { console.error(e); }
        };
        cargarInfo();
    }, [idFinal, backendUrl]);

    const cargarReservas = async () => {
        if (!idFinal) return;
        setCargando(true);
        try {
            const res = await fetch(`${backendUrl}/api/reservas/${idFinal}`);
            if (res.ok) setReservas(await res.json());
        } catch (e) { console.error(e); }
        finally { setCargando(false); }
    };

    useEffect(() => { cargarReservas(); }, [idFinal, fecha]);

    const generarHoras = () => {
        if (!cancha) return [];
        let horas = [];
        let inicio = parseInt(cancha.hora_apertura?.split(":")[0] || 8);
        let fin = parseInt(cancha.hora_cierre?.split(":")[0] || 24);
        for (let i = inicio; i < fin; i++) horas.push(`${i < 10 ? "0" + i : i}:00`);
        return horas;
    };

    const handleConfirmar = async () => {
        if (!store.auth.isAuthenticated) return alert("Inicia sesión para reservar.");
        if (!horaSeleccionada || estaOcupada) return alert("Horario no disponible.");
        if (!window.confirm(`¿Confirmas la reserva para las ${horaSeleccionada}hs?`)) return;

        try {
            const resp = await fetch(`${backendUrl}/api/reserva`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fecha, hora: horaSeleccionada, cancha_id: idFinal,
                    user_id: store.auth.user.id, es_bloqueo: false
                })
            });
            if (resp.ok) {
                alert("¡Reserva exitosa!");
                cargarReservas();
                setHoraSeleccionada("");
                setPaso(1);
            }
        } catch (e) { console.error(e); }
    };

    const cancelarReserva = async (reservaId) => {
        if (!window.confirm("¿Deseas cancelar tu reserva?")) return;
        try {
            const res = await fetch(`${backendUrl}/api/reserva/${reservaId}`, { method: "DELETE" });
            if (res.ok) {
                alert("Reserva cancelada");
                cargarReservas();
                setHoraSeleccionada("");
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: 16 }}>
            {/* Cabecera */}
            <div className="mb-4">
                <h5 className="text-muted small mb-1">
                    <i className="fa fa-building me-2"></i>{complejo?.name || cancha?.complejo_nombre || "Complejo"}
                </h5>
                <h3 className="fw-bold mb-0">{cancha?.nombre || "Cancha"}</h3>
                <span className="badge bg-light text-dark border mt-2">{cancha?.categoria_nombre || "Categoría"}</span>
            </div>

            {/* Pasos Visuales */}
            <div className="d-flex align-items-center gap-3 mb-4">
                {["Fecha", "Horario", "Confirmar"].map((label, i) => (
                    <div key={i} className="d-flex align-items-center gap-2">
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold",
                            background: paso === i + 1 ? "#0d1b2a" : paso > i + 1 ? "#C8F135" : "#eee",
                            color: paso === i + 1 ? "#C8F135" : "#111"
                        }}>{i + 1}</div>
                        <span className="small fw-medium" style={{ color: paso === i + 1 ? "#111" : "#999" }}>{label}</span>
                        {i < 2 && <div style={{ width: 20, height: 1, background: "#ddd" }} />}
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* PARTE IZQUIERDA: CALENDARIO Y BOTONES */}
                <div className="col-md-7">
                    <label className="form-label small fw-bold text-muted text-uppercase">1. Elige el día</label>
                    <input type="date" className="form-control mb-4 shadow-sm" value={fecha} min={new Date().toISOString().split("T")[0]} 
                           onChange={(e) => { setFecha(e.target.value); setHoraSeleccionada(""); setPaso(1); }} style={{ maxWidth: "200px", borderRadius: "10px" }} />

                    <label className="form-label small fw-bold text-muted text-uppercase">2. Selecciona la hora</label>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {generarHoras().map((h) => {
                            const res = reservas.find(r => r.fecha === fecha && r.hora === h);
                            const esMia = res?.user_id === store.auth.user?.id;
                            const bloqueo = res?.es_bloqueo;
                            const isSelected = horaSeleccionada === h;

                            let color = "#EAF3DE"; let text = "#27500A"; let label = h;
                            if (bloqueo) { color = "#ffcfcf"; text = "#a80000"; label = "CERRADO"; }
                            else if (esMia) { color = "#fff3cd"; text = "#856404"; label = "MI RESERVA"; }
                            else if (res) { color = "#f8f9fa"; text = "#adb5bd"; label = "YA RESERVADO"; }
                            else if (isSelected) { color = "#0d1b2a"; text = "#C8F135"; }

                            return (
                                <div key={h} className="text-center" style={{ width: "105px" }}>
                                    <button onClick={() => { setHoraSeleccionada(h); setPaso(2); }} 
                                            className="btn btn-sm w-100 mb-1 shadow-sm"
                                            style={{ fontSize: "10px", fontWeight: "700", padding: "12px 2px", background: color, color: text, border: isSelected ? "2px solid #0d1b2a" : "1px solid #ddd", borderRadius: "8px" }}>
                                        {label}
                                    </button>
                                    {esMia && <div className="text-danger small fw-bold" style={{cursor:"pointer", textDecoration:"underline"}} onClick={()=>cancelarReserva(res.id)}>CANCELAR</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PARTE DERECHA: RESUMEN */}
                <div className="col-md-5">
                    <div className="p-4 bg-light shadow-sm" style={{ borderRadius: 15, border: "1px solid #eee" }}>
                        
                        {/* ALERTAS */}
                        {horaSeleccionada && estaCerrada ? (
                            <div className="alert alert-secondary border-0 mb-4 py-2 small" style={{ borderRadius: "10px", background: "#ffe5e5", color: "#a80000" }}>
                                <i className="fa fa-ban me-2"></i><strong>Cancha no disponible</strong>
                            </div>
                        ) : horaSeleccionada && estaOcupada ? (
                            <div className="alert alert-danger border-0 mb-4 py-2 small" style={{ borderRadius: "10px" }}>
                                <i className="fa fa-times-circle me-2"></i><strong>Cancha ya reservada</strong>
                            </div>
                        ) : horaSeleccionada ? (
                            <div className="alert alert-success border-0 mb-4 py-2 small" style={{ borderRadius: "10px" }}>
                                <i className="fa fa-check-circle me-2"></i><strong>Cancha libre</strong>
                            </div>
                        ) : (
                            <div className="alert alert-info border-0 mb-4 py-2 small" style={{ borderRadius: "10px" }}>
                                <i className="fa fa-info-circle me-2"></i>Selecciona un horario
                            </div>
                        )}

                        <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "12px", letterSpacing: "1px" }}>Detalles del Turno</h6>
                        
                        <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                            <span className="text-muted">Complejo:</span>
                            <span className="fw-bold text-dark">{complejo?.name || cancha?.complejo_nombre || "-"}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                            <span className="text-muted">Cancha:</span>
                            <span className="fw-bold text-dark">{cancha?.nombre || "-"}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                            <span className="text-muted">Categoría:</span>
                            <span className="fw-bold text-dark">{cancha?.categoria_nombre || "-"}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                            <span className="text-muted">Fecha:</span>
                            <span className="fw-bold text-dark">{fecha}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                            <span className="text-muted">Usuario:</span>
                            <span className="fw-bold text-dark text-capitalize">{store.auth.user?.first_name || store.auth.user?.username || "Invitado"}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 small">
                            <span className="text-muted">Horario:</span>
                            <span className={`fw-bold ${estaCerrada ? "text-danger" : estaOcupada ? "text-warning" : "text-success"}`}>
                                {horaSeleccionada ? `${horaSeleccionada} hs` : "--:--"}
                            </span>
                        </div>

                        <hr />
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fw-bold">Total:</span>
                            <span className="fs-4 fw-bold text-success">${cancha?.precio_hora || "0"}</span>
                        </div>

                        <button 
                            className="btn w-100 py-2 fw-bold shadow-sm"
                            disabled={!horaSeleccionada || estaOcupada}
                            onClick={handleConfirmar}
                            style={{ background: "#C8F135", color: "#111", borderRadius: "10px" }}>
                            CONFIRMAR RESERVA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservaCancha;
