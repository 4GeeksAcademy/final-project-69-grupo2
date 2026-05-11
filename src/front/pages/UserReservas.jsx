
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import ReservaCancha from "./ReservaCancha.jsx"; // Asegúrate de que la ruta sea correcta

export const UserReservas = ({ manualCanchaId }) => {
    const { canchaId } = useParams();
    const idFinal = manualCanchaId || canchaId;
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    const [cancha, setCancha] = useState(null);
    const [complejo, setComplejo] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [cargando, setCargando] = useState(false);
    
   
    const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const navegarAReserva = (horaElegida = "") => {
        if (!idFinal) return;
        const queryParams = new URLSearchParams({
            complejo: complejo?.nombre || cancha?.complejo_nombre || "Complejo",
            cancha: cancha?.nombre || "Cancha",
            categoria: cancha?.categoria_nombre || "",
            precio: cancha?.precio_hora || "",
            fecha: fecha,
            hora: horaElegida
        }).toString();
        navigate(`/reservar/${idFinal}?${queryParams}`);
    };

    useEffect(() => {
        if (!idFinal) return;
        const cargarCancha = async () => {
            try {
                const resCancha = await fetch(`${backendUrl}/api/cancha/${idFinal}`);
                if (resCancha.ok) {
                    const data = await resCancha.json();
                    setCancha(data);
                    if (data.complejo_id) {
                        const resComp = await fetch(`${backendUrl}/api/complejo/${data.complejo_id}`);
                        if (resComp.ok) setComplejo(await resComp.json());
                    }
                }
            } catch (error) { console.error("Error:", error); }
        };
        cargarCancha();
    }, [idFinal, backendUrl]);

    useEffect(() => {
        if (!idFinal) return;
        const cargarReservas = async () => {
            setCargando(true);
            try {
                const resRes = await fetch(`${backendUrl}/api/reservas/${idFinal}`);
                if (resRes.ok) setReservas(await resRes.json());
            } catch (error) { console.error(error); }
            finally { setCargando(false); }
        };
        cargarReservas();
    }, [idFinal, fecha, backendUrl]);

    const generarHoras = () => {
        if (!cancha) return [];
        let horas = [];
        let inicio = parseInt(cancha.hora_apertura?.split(":")[0] || 8);
        let fin = parseInt(cancha.hora_cierre?.split(":")[0] || 24);
        for (let i = inicio; i < fin; i++) {
            horas.push(`${i < 10 ? "0" + i : i}:00`);
        }
        return horas;
    };

    if (!cancha && !cargando) return <div className="text-center p-5">Cargando datos...</div>;

   
    if (canchaSeleccionada) {
        return (
            <div className="animate__animated animate__fadeIn container mt-3">
                <button
                    className="btn btn-link text-decoration-none text-dark fw-bold mb-4"
                    onClick={() => setCanchaSeleccionada(null)}
                >
                    <i className="fa fa-arrow-left me-2"></i>Volver a detalles
                </button>
                <ReservaCancha canchaDesdePadre={canchaSeleccionada} />
            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: 15 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="text-muted small mb-0">{complejo?.nombre || complejo?.name || "Complejo"}</h5>
                    <h5 className="text-muted small mb-0">{complejo?.city || "Ubicación"}, {complejo?.country || "Ubicación"}</h5>
                    <h4 className="fw-bold mb-1">{cancha?.nombre}</h4>
                    <div className="d-flex align-items-center gap-3 mt-2">
                        <span className="badge bg-light text-primary border">Disponibilidad</span>
                        
                   
                        <button
                            className="btn btn-sm shadow-sm"
                            style={{ background: "#C8F135", color: "#111", fontWeight: 700, borderRadius: "8px", padding: "5px 15px" }}
                            onClick={() => setCanchaSeleccionada(cancha)} 
                        >
                            Reservar ahora
                        </button>
                    </div>
                </div>
                <div>
                    <input
                        type="date"
                        className="form-control form-control-sm"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                    />
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-center border-top pt-3">
                {generarHoras().map(h => {
                    const res = reservas.find(r => r.fecha === fecha && r.hora === h);
                    const ocupado = !!res;
                    const esMinaReserva = res && res.user_id === store.auth.user?.id;

                    return (
                        <button
                            key={h}
                            className="btn btn-sm"
                            type="button"
                            disabled={ocupado && !esMinaReserva}
                            onClick={() => !ocupado && navegarAReserva(h)}
                            style={{ 
                                minWidth: "90px", borderRadius: "8px", fontWeight: "600",
                                background: ocupado ? (esMinaReserva ? "#fff3cd" : "#f8f9fa") : "#EAF3DE",
                                color: ocupado ? (esMinaReserva ? "#856404" : "#adb5bd") : "#27500A",
                                border: "1px solid #ddd"
                            }}
                        >
                            {ocupado ? (esMinaReserva ? "Reservada" : "cancha no disponible") : h}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default UserReservas;
