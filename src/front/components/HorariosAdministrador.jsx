import React, { useState, useEffect } from "react";

export const HorariosAdministrador = ({ canchaId, nombreCancha, horaApertura, horaCierre }) => {
    const [reservas, setReservas] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
    const [cargando, setCargando] = useState(false);
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

    useEffect(() => {
        cargarReservas();
    }, [canchaId, fechaSeleccionada]);

    const generarHoras = () => {
        // SEGURIDAD: Si no hay horas de la DB, usamos un estándar
        const inicioStr = horaApertura || "08:00";
        const finStr = horaCierre || "24:00";

        let horas = [];
        try {
            const inicio = parseInt(inicioStr.split(":")[0]);
            const fin = parseInt(finStr.split(":")[0]);

            // Generar los bloques
            for (let i = inicio; i < fin; i++) {
                horas.push(`${i < 10 ? "0" + i : i}:00`);
            }
        } catch (error) {
            console.error("Error en split de horas:", error);
            return ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "23:00"];
        }
        return horas;
    };

    const toggleBloqueo = async (hora) => {
        const existente = reservas.find(r => r.fecha === fechaSeleccionada && r.hora === hora);

        if (existente) {
            if (existente.es_bloqueo) {
                // Permitir eliminar bloqueos
                const resp = await fetch(`${backendUrl}/api/reserva/${existente.id}`, { method: "DELETE" });
                if (resp.ok) {
                    cargarReservas();
                    alert("Bloqueo eliminado correctamente.");
                } else {
                    alert("Error al eliminar el bloqueo.");
                }
            } else {
                alert("No se puede eliminar una reserva de cliente desde aquí. Usa la gestión de reservas.");
            }
        } else {
            // Crear un bloqueo
            const resp = await fetch(`${backendUrl}/api/reserva`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fecha: fechaSeleccionada,
                    hora: hora,
                    cancha_id: canchaId,
                    es_bloqueo: true
                })
            });
            if (resp.ok) {
                cargarReservas();
                alert("Bloqueo creado correctamente.");
            } else {
                alert("Error al crear el bloqueo.");
            }
        }
    };

    const bloquesHoras = generarHoras();

    return (
        <div className="card p-4 shadow-sm border-0 mt-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Gestión Horaria: {nombreCancha}</h5>
                <input
                    type="date"
                    className="form-control w-auto"
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                />
            </div>

            {cargando ? (
                <div className="text-center p-4"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {bloquesHoras.map(hora => {
                        const res = reservas.find(r => r.fecha === fechaSeleccionada && r.hora === hora);
                        let btnClass = "btn-outline-secondary";
                        let texto = "Libre";

                        if (res) {
                            btnClass = res.es_bloqueo ? "btn-danger" : "btn-success";
                            texto = res.es_bloqueo ? "CERRADO" : "CLIENTE";
                        }

                        return (
                            <button
                                key={hora}
                                className={`btn ${btnClass} d-flex flex-column align-items-center justify-content-center shadow-sm`}
                                onClick={() => toggleBloqueo(hora)}
                                style={{ width: "95px", height: "60px" }}
                            >
                                <span className="fw-bold">{hora}</span>
                                <span style={{ fontSize: '9px' }}>{texto}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
