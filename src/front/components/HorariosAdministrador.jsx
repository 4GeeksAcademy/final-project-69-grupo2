import React, { useState, useEffect } from "react";

export const HorariosAdministrador = ({ canchaId, nombreCancha, horaApertura, horaCierre }) => {
    const [reservas, setReservas] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
    const [cargando, setCargando] = useState(false);
    
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarReservas = async () => {
        if (!canchaId) return;
        setCargando(true);
        try {
            const resp = await fetch(`${backendUrl}/api/reservas/${canchaId}`);
            if (resp.ok) {
                const data = await resp.json();
                setReservas(data);
            }
        } catch (error) {
            console.error("Error al cargar reservas:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarReservas(); }, [canchaId, fechaSeleccionada]);

    const generarHoras = () => {
        const inicio = parseInt(horaApertura?.split(":")[0] || 8);
        const fin = parseInt(horaCierre?.split(":")[0] || 24);
        let horas = [];
        for (let i = inicio; i < fin; i++) horas.push(`${i < 10 ? "0" + i : i}:00`);
        return horas;
    };

    const toggleBloqueo = async (hora) => {
        const existente = reservas.find(r => r.fecha === fechaSeleccionada && r.hora === hora);
        if (existente) {
            if (existente.es_bloqueo) {
                if (window.confirm("¿Habilitar horario?")) {
                    const resp = await fetch(`${backendUrl}/api/reserva/${existente.id}`, { method: "DELETE" });
                    if (resp.ok) cargarReservas();
                }
            } else {
                setReservaSeleccionada(existente);
                setMostrarModal(true);
            }
        } else {
            const resp = await fetch(`${backendUrl}/api/reserva`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fecha: fechaSeleccionada, hora, cancha_id: canchaId, es_bloqueo: true })
            });
            if (resp.ok) cargarReservas();
        }
    };

    return (
        <div className="card p-4 shadow-sm border-0 mt-3" style={{ borderRadius: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '14px' }}>Gestión: {nombreCancha}</h5>
                <input type="date" className="form-control w-auto shadow-sm" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} style={{ borderRadius: '10px' }} />
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-center">
                {generarHoras().map(hora => {
                    const res = reservas.find(r => r.fecha === fechaSeleccionada && r.hora === hora);
                    let btnClass = "btn-outline-secondary"; let texto = "LIBRE";
                    if (res) {
                        btnClass = res.es_bloqueo ? "btn-danger" : "btn-success shadow-sm";
                        texto = res.es_bloqueo ? "CERRADO" : "CLIENTE";
                    }
                    return (
                        <button key={hora} className={`btn ${btnClass} d-flex flex-column align-items-center justify-content-center`} onClick={() => toggleBloqueo(hora)} style={{ width: "95px", height: "65px", borderRadius: "10px" }}>
                            <span className="fw-bold">{hora}</span>
                            <span style={{ fontSize: '9px', fontWeight: '800' }}>{texto}</span>
                        </button>
                    );
                })}
            </div>

            {/* MODAL DETALLE EXACTO AL RESUMEN */}
            {mostrarModal && reservaSeleccionada && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 15 }}>
                            <div className="modal-header bg-dark text-white border-0" style={{ borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                                <h6 className="modal-title fw-bold text-uppercase" style={{ fontSize: "12px" }}>Detalle del Turno</h6>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 bg-light text-start">
                                <div className="alert alert-danger border-0 mb-4 py-2 small" style={{ borderRadius: "10px" }}>
                                    <i className="fa fa-times-circle me-2"></i><strong>Cancha ya reservada</strong>
                                </div>
                                <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "11px", color: "#666" }}>Detalles</h6>
                                
                                <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                                    <span className="text-muted">Usuario:</span>
                                    <span className="fw-bold text-dark text-capitalize">
                                        {/* Buscamos en todas las propiedades posibles */}
                                        {reservaSeleccionada.user?.name || 
                                         reservaSeleccionada.user?.username || 
                                         reservaSeleccionada.user?.first_name || 
                                         `ID Usuario: ${reservaSeleccionada.user_id}`}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                                    <span className="text-muted">Fecha:</span>
                                    <span className="fw-bold text-dark">{reservaSeleccionada.fecha}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 small">
                                    <span className="text-muted">Horario:</span>
                                    <span className="fw-bold text-danger">{reservaSeleccionada.hora} hs</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Total:</span>
                                    <span className="fs-4 fw-bold text-success">$ {reservaSeleccionada.precio || "Pagado"}</span>
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light" style={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
                                <button type="button" className="btn btn-secondary w-100 fw-bold" onClick={() => setMostrarModal(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
