
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const UserReservas = ({ manualCanchaId }) => {
    // Detecta el ID si viene por la URL o por propiedad (Props)
    const { canchaId } = useParams();
    const idFinal = manualCanchaId || canchaId;
    const { store } = useGlobalReducer(); // Obtener el estado global para el usuario logueado

    const [cancha, setCancha] = useState(null);
    const [complejo, setComplejo] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [cargando, setCargando] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    // Cargar datos de la cancha (solo cuando cambia idFinal)
    useEffect(() => {
        if (!idFinal) return;

        const cargarCancha = async () => {
            try {
                const resCancha = await fetch(`${backendUrl}/api/cancha/${idFinal}`);
                if (resCancha.ok) {
                    const canchaData = await resCancha.json();
                    setCancha(canchaData);

                    // Cargar info del complejo
                    if (canchaData.complejo_id) {
                        const resComplejo = await fetch(`${backendUrl}/api/complejo/${canchaData.complejo_id}`);
                        if (resComplejo.ok) setComplejo(await resComplejo.json());
                    }
                }
            } catch (error) {
                console.error("Error al cargar cancha:", error);
            }
        };

        cargarCancha();
    }, [idFinal]);

    // Cargar reservas (cuando cambia idFinal o fecha)
    useEffect(() => {
        if (!idFinal) return;
        setCargando(true);

        const cargarReservas = async () => {
            try {
                const resRes = await fetch(`${backendUrl}/api/reservas/${idFinal}`);
                if (resRes.ok) setReservas(await resRes.json());
            } catch (error) {
                console.error("Error al cargar reservas:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarReservas();
    }, [idFinal, fecha]);

    const cargarDatos = async () => {
        if (!idFinal) return;
        setCargando(true);
        try {
            const resRes = await fetch(`${backendUrl}/api/reservas/${idFinal}`);
            if (resRes.ok) setReservas(await resRes.json());
        } catch (error) {
            console.error("Error al cargar datos de reserva:", error);
        } finally {
            setCargando(false);
        }
    };

    const generarHoras = () => {
        if (!cancha) return [];
        let horas = [];
        // Usamos los horarios de la base de datos o por defecto 8 a 24
        let inicio = parseInt(cancha.hora_apertura?.split(":")[0] || 8);
        let fin = parseInt(cancha.hora_cierre?.split(":")[0] || 24);
        for (let i = inicio; i < fin; i++) {
            horas.push(`${i < 10 ? "0" + i : i}:00`);
        }
        return horas;
    };

    const solicitarReserva = async (hora) => {
        if (!idFinal) {
            alert("Error: No se ha seleccionado una cancha válida.");
            return;
        }
        if (!store.auth.isAuthenticated || !store.auth.user) {
            alert("Debes estar logueado para hacer una reserva.");
            return;
        }

        if (!window.confirm(`¿Confirmas la reserva para las ${hora}hs?`)) return;

        try {
            const resp = await fetch(`${backendUrl}/api/reserva`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fecha: fecha,
                    hora: hora,
                    cancha_id: idFinal,
                    user_id: store.auth.user.id, // Usar el ID del usuario logueado
                    es_bloqueo: false
                })
            });

            if (resp.ok) {
                alert("¡Reserva realizada con éxito!");
                cargarDatos();
            } else {
                const errorData = await resp.json();
                alert(`No se pudo completar la reserva: ${errorData.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert("Error de conexión. Inténtalo de nuevo.");
        }
    };

    const cancelarReserva = async (reservaId, hora) => {
        if (!window.confirm(`¿Estás seguro de que deseas cancelar la reserva para las ${hora}hs?`)) return;

        try {
            const resp = await fetch(`${backendUrl}/api/reserva/${reservaId}`, {
                method: "DELETE"
            });

            if (resp.ok) {
                alert("¡Reserva cancelada correctamente!");
                cargarDatos();
            } else {
                const errorData = await resp.json();
                alert(`No se pudo cancelar la reserva: ${errorData.error || errorData.msg || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al cancelar reserva:", error);
            alert("Error de conexión. Inténtalo de nuevo.");
        }
    };

    if (!cancha && !cargando) return <div className="text-center p-5">Selecciona una cancha para ver disponibilidad.</div>;

    return (
        <div className="card shadow-sm border-0 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="text-muted mb-1">
                        <i className="fa fa-building text-info me-2"></i>
                        {complejo?.nombre || "Complejo"}
                    </h5>
                    <h4 className="fw-bold mb-0">
                        <i className="fa fa-calendar-alt text-success me-2"></i>
                        {cancha?.nombre}
                    </h4>
                </div>
                <div className="d-flex align-items-center">
                    <label className="me-2 small fw-bold">Fecha:</label>
                    <input
                        type="date"
                        className="form-control form-control-sm"
                        value={fecha}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => setFecha(e.target.value)}
                    />
                </div>
            </div>

            {cargando ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {generarHoras().map(h => {
                        const res = reservas.find(r => r.fecha === fecha && r.hora === h);
                        const ocupado = !!res;
                        const esBloqueo = res?.es_bloqueo;
                        const esMinaReserva = res && res.user_id === store.auth.user?.id;

                        let btnClass = "btn-outline-success bg-light";
                        let texto = "LIBRE";
                        let deshabilitado = false;

                        if (ocupado) {
                            if (esBloqueo) {
                                btnClass = "btn-danger";
                                texto = "CERRADO";
                                deshabilitado = true;
                            } else if (esMinaReserva) {
                                btnClass = "btn-warning";
                                texto = "MIS RESERVAS";
                                deshabilitado = false;
                            } else {
                                btnClass = "btn-success";
                                texto = "OCUPADO";
                                deshabilitado = true;
                            }
                        }

                        return (
                            <button
                                key={h}
                                disabled={deshabilitado}
                                className={`btn d-flex flex-column align-items-center justify-content-center shadow-sm ${btnClass}`}
                                onClick={() => {
                                    if (esMinaReserva) {
                                        cancelarReserva(res.id, h);
                                    } else {
                                        solicitarReserva(h);
                                    }
                                }}
                                style={{ width: "100px", height: "65px", transition: "0.2s" }}
                                title={esMinaReserva ? "Haz clic para cancelar" : ""}
                            >
                                <span className="fw-bold">{h}</span>
                                <span style={{ fontSize: '9px' }}>
                                    {texto}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="mt-4 pt-3 border-top d-flex justify-content-center gap-3 small text-muted">
                <span><i className="fa fa-square text-danger me-1"></i> No disponible</span>
                <span><i className="fa fa-square text-success me-1"></i> Ocupado</span>
                <span><i className="fa fa-square text-warning me-1"></i> Mis reservas (clic para cancelar)</span>
                <span><i className="fa fa-square text-outline-success me-1" style={{ border: "1px solid" }}></i> Libre</span>
            </div>
        </div>
    );
};
