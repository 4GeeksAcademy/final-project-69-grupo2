import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

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
        } finally { setCargando(false); }
    };

    useEffect(() => { cargarReservas(); }, [canchaId, fechaSeleccionada]);

    const generarHoras = () => {
        const inicio = parseInt(horaApertura?.split(":")[0] || 8);
        const fin = parseInt(horaCierre?.split(":")[0] || 24);
        let horas = [];
        for (let i = inicio; i < fin; i++) horas.push(`${i < 10 ? "0" + i : i}:00`);
        return horas;
    };

    const gestionarDiaCompleto = async (cerrarTodo) => {
        const horas = generarHoras();
        const texto = cerrarTodo ? "cerrar todos los horarios" : "habilitar todo el día (borrará bloqueos y reservas)";

        const result = await Swal.fire({
            title: '¿Confirmar acción masiva?',
            text: `¿Estás seguro de que deseas ${texto} para el ${fechaSeleccionada}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: cerrarTodo ? '#d33' : '#28a745',
            confirmButtonText: cerrarTodo ? 'Sí, cerrar todo' : 'Sí, habilitar todo',
        });

        if (result.isConfirmed) {
            setCargando(true);
            try {
                if (cerrarTodo) {
                    for (const hora of horas) {
                        const existe = reservas.find(r => r.fecha === fechaSeleccionada && r.hora === hora);
                        if (!existe) {
                            await fetch(`${backendUrl}/api/reserva`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ fecha: fechaSeleccionada, hora, cancha_id: canchaId, es_bloqueo: true })
                            });
                        }
                    }
                } else {
                    const reservasDelDia = reservas.filter(r => r.fecha === fechaSeleccionada);
                    for (const res of reservasDelDia) {
                        await fetch(`${backendUrl}/api/reserva/${res.id}`, { method: "DELETE" });
                    }
                }
                Swal.fire('Completado', 'El calendario ha sido actualizado.', 'success');
                cargarReservas();
            } catch (error) {
                Swal.fire('Error', 'Hubo un fallo en la operación.', 'error');
            } finally { setCargando(false); }
        }
    };

    const handleEliminarReserva = async (id) => {
        const result = await Swal.fire({
            title: '¿Liberar este horario?',
            text: "Se eliminará la reserva o el bloqueo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, liberar'
        });

        if (result.isConfirmed) {
            const resp = await fetch(`${backendUrl}/api/reserva/${id}`, { method: "DELETE" });
            if (resp.ok) {
                setMostrarModal(false);
                cargarReservas();
            }
        }
    };

    const toggleBloqueo = async (hora) => {
        const existente = reservas.find(r => r.fecha === fechaSeleccionada && r.hora === hora);
        if (existente) {
            if (existente.es_bloqueo) {
                await handleEliminarReserva(existente.id);
            } else {
                setReservaSeleccionada(existente);
                setMostrarModal(true);
            }
        } else {
            await fetch(`${backendUrl}/api/reserva`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fecha: fechaSeleccionada, hora, cancha_id: canchaId, es_bloqueo: true })
            });
            cargarReservas();
        }
    };

    return (
        <div className="card p-4 shadow-sm border-0 mt-3" style={{ borderRadius: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '14px' }}>Gestión: {nombreCancha}</h5>
                <input type="date" className="form-control w-auto shadow-sm" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} style={{ borderRadius: '10px' }} />
            </div>

            <div className="d-flex gap-2 mb-4 justify-content-end">
                <button className="btn btn-sm btn-outline-danger fw-bold shadow-sm" onClick={() => gestionarDiaCompleto(true)} disabled={cargando}>
                    <i className="fa fa-lock me-1"></i> Cerrar todo el día
                </button>
                <button className="btn btn-sm btn-outline-success fw-bold shadow-sm" onClick={() => gestionarDiaCompleto(false)} disabled={cargando}>
                    <i className="fa fa-unlock me-1"></i> Habilitar todo el día
                </button>
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-center">
                {cargando ? <div className="spinner-border text-primary"></div> :
                    generarHoras().map(hora => {
                        const res = reservas.find(r => r.fecha === fechaSeleccionada && r.hora === hora);
                        let btnClass = "btn-outline-secondary"; 
                        let texto = "LIBRE";
                        let subTexto = "";

                        if (res) {
                            if (res.es_bloqueo) {
                                btnClass = "btn-danger"; 
                                texto = "CERRADO";
                            } else {
                                const pagado = Number(res.monto_pagado || 0);
                                const total = Number(res.precio_total || 0);

                                if (pagado >= total && total > 0) {
                                    btnClass = "btn-success shadow-sm"; 
                                    subTexto = "PAGO TOTAL";
                                } else if (pagado > 0) {
                                    btnClass = "btn-primary shadow-sm"; 
                                    subTexto = "SEÑA 10%";
                                } else {
                                    btnClass = "btn-warning shadow-sm"; 
                                    subTexto = "PENDIENTE";
                                }
                                texto = "RESERVADO";
                            }
                        }

                        return (
                            <button key={hora} className={`btn ${btnClass} d-flex flex-column align-items-center justify-content-center`} 
                                onClick={() => toggleBloqueo(hora)} 
                                style={{ width: "105px", height: "75px", borderRadius: "12px", transition: "all 0.3s" }}>
                                <span className="fw-bold">{hora}</span>
                                <span style={{ fontSize: '8px', fontWeight: '900' }}>{texto}</span>
                                {subTexto && <span className="badge bg-white text-dark mt-1" style={{ fontSize: '7px' }}>{subTexto}</span>}
                            </button>
                        );
                    })
                }
            </div>

            {/* ✅ MODAL DETALLE SIMPLIFICADO */}
            {mostrarModal && reservaSeleccionada && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 20 }}>
                            <div className="modal-header bg-dark text-white border-0 py-3" style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                <h6 className="modal-title fw-bold text-uppercase mb-0">Detalle de la Reserva</h6>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>

                            <div className="modal-body p-4 bg-white text-start">
                                <h5 className="fw-bold text-dark mb-1 text-capitalize">
                                    {reservaSeleccionada.user?.full_name || reservaSeleccionada.user?.username || "Usuario Registrado"}
                                </h5>
                                <p className="text-muted mb-4 small">
                                    <i className="fa fa-envelope me-2"></i>{reservaSeleccionada.user?.email || "Sin email registrado"}
                                </p>

                                <div className="p-3 rounded-4 bg-light border mb-4">
                                  
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-dark">Monto abonado:</span>
                                        <span className="fw-bold text-success fs-5">
                                            ${Number(reservaSeleccionada.monto_pagado || 0).toLocaleString("es-CO")}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4 px-1 py-2 border-top border-bottom">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Turno programado</span>
                                        <span className="fw-bold text-dark small">
                                            <i className="fa fa-calendar-alt me-1"></i> {reservaSeleccionada.fecha}
                                        </span>
                                    </div>
                                    <div className="text-end">
                                        <span className="fw-bold text-primary fs-6">
                                            <i className="fa fa-clock me-1"></i> {reservaSeleccionada.hora} hs
                                        </span>
                                    </div>
                                </div>

                                <button className="btn btn-danger w-100 fw-bold py-3 shadow-sm border-0"
                                    style={{ borderRadius: '14px' }}
                                    onClick={() => handleEliminarReserva(reservaSeleccionada.id)}>
                                    <i className="fa fa-trash-alt me-2"></i>CANCELAR Y LIBERAR TURNO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

