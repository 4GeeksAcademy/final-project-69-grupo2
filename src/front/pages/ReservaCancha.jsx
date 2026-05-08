
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Swal from "sweetalert2";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
                                  
const ReservaCancha = ({ canchaDesdePadre = null }) => {
    const { canchaId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    const idFinal = canchaDesdePadre?.id || canchaId;
    const [cancha, setCancha] = useState(canchaDesdePadre);
    const [complejo, setComplejo] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [horaSeleccionada, setHoraSeleccionada] = useState("");
    const [paso, setPaso] = useState(1);
    const [pagarTotal, setPagarTotal] = useState(false); // ✅ Estado para el checkbox

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

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
        try {
            const res = await fetch(`${backendUrl}/api/reservas/${idFinal}`);
            if (res.ok) setReservas(await res.json());
        } catch (e) { console.error(e); }
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
        if (!store.auth.isAuthenticated) {
            return Swal.fire({ icon: 'warning', title: 'Atención', text: 'Inicia sesión para reservar.', confirmButtonColor: '#0d1b2a' });
        }

        const montoTotal = Number(cancha?.precio_hora || 0);
        const montoAPagar = pagarTotal ? montoTotal : montoTotal * 0.10;

        const result = await Swal.fire({
            title: pagarTotal ? '¿Confirmar Pago Total?' : '¿Confirmar y Pagar Seña?',
            html: `
        <div class="container-fluid text-center">
            <!-- Alerta de Verificación -->
            <div class="alert alert-warning border-0 py-2 small mb-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <b>¡Atención! Verifique el resumen antes de continuar.</b>
            </div>

            <!-- Aviso de Cancelación -->
            <div class="bg-light p-3 rounded border border-danger-subtle mb-3">
                <p class="text-danger small mb-0" style="line-height: 1.4;">
                    
                    <b> Pago online.</b><br>
                    Su reserva queda pendiente en caso de fallar el pago. En ese caso,
                    Deberá solicitar cambios al correo o teléfono indicados en el resumen del turno, caso contrario se cancelará automáticamente.
                </p>
            </div>

            <!-- Detalle de la Reserva -->
            <div class="mb-2">
                <p class="text-muted mb-1">Vas a reservar para las <b>${horaSeleccionada}hs</b></p>
                <h3 class="${pagarTotal ? 'text-success' : 'text-primary'} fw-bold mb-0">
                    Pagas ahora: $${montoAPagar.toLocaleString("es-CO")}
                </h3>
            </div>

            <!-- Saldo Pendiente o Confirmación -->
            ${!pagarTotal ? `
                <div class="badge bg-secondary-subtle text-dark border mt-2">
                    Saldo pendiente en cancha: $${(montoTotal * 0.9).toLocaleString("es-CO")}
                </div>
            ` : `
                <div class="badge bg-success-subtle text-success border mt-2">
                    <i class="fas fa-check-circle me-1"></i>Pago Total Completo
                </div>
            `}
        </div>
    `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: pagarTotal ? '#198754' : '#0d1b2a', // Verde si es total, oscuro si es seña
            confirmButtonText: '<i class="fas fa-credit-card me-2"></i>Ir a pagar',
            cancelButtonText: 'Volver',
            color: '#111'
        });

        if (result.isConfirmed) {
            try {
                // 1. Crear la reserva
                const respReserva = await fetch(`${backendUrl}/api/reserva`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fecha,
                        hora: horaSeleccionada,
                        cancha_id: idFinal,
                        user_id: store.auth.user.id,
                        es_bloqueo: false
                    })
                });

                if (!respReserva.ok) throw new Error("No se pudo crear la reserva.");

                // ✅ CAMBIO 1: Obtener el objeto de la reserva creada (que trae el ID real)
                const nuevaReserva = await respReserva.json();

                // 2. Crear la sesión de Stripe
                const respStripe = await fetch(`${backendUrl}/api/create-checkout-session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        precio: montoAPagar,
                        nombre: `${pagarTotal ? 'Pago Total' : 'Seña'} - ${cancha?.nombre}`,
                        // ✅ CAMBIO 2: Usar el ID de la reserva, NO el idFinal de la cancha
                        reserva_id: nuevaReserva.id,
                        success_url: `${window.location.origin}/pago-exitoso`,
                        cancel_url: window.location.href
                    })
                });

                const data = await respStripe.json();
                if (data.url) window.location.href = data.url;
            } catch (e) {
                console.error(e);
                Swal.fire('Error', 'Hubo un fallo al procesar la reserva.', 'error');
            }
        }

    };

    return (
        <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: 16 }}>
            <div className="row g-4 align-items-start">
                {/* COLUMNA IZQUIERDA: Info, Pasos y Calendario */}
                <div className="col-md-7">
                    {/* Cabecera */}
                    <div className="mb-4">
                        <h2 className="fw-bold mb-0" style={{ fontSize: "1.5rem", color: "#495057" }}>
                            <i className="fa fa-building me-2"></i>
                            {complejo?.nombre || cancha?.complejo_nombre || "Cargando complejo..."}
                        </h2>
                        <p className="text-muted small mb-2 ms-4 ps-1">
                            <i className="fa fa-map-marker-alt me-1 text-danger"></i>
                            {complejo?.city || complejo?.ciudad || "Ciudad"}, {complejo?.country || complejo?.pais || "País"}
                        </p>
                        <h3 className="fw-bold mb-0">{cancha?.nombre || "Cancha"}</h3>
                        <span className="badge bg-light text-dark border mt-2">
                            {cancha?.categoria_nombre || "General"}
                        </span>
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

                    {/* Selección de Fecha */}
                    <label className="form-label small fw-bold text-muted text-uppercase">1. Elige el día</label>
                    <input
                        type="date"
                        className="form-control mb-4 shadow-sm"
                        value={fecha}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => { setFecha(e.target.value); setHoraSeleccionada(""); setPaso(1); }}
                        style={{ maxWidth: "200px", borderRadius: "10px" }}
                    />

                    {/* Selección de Hora */}
                    <label className="form-label small fw-bold text-muted text-uppercase">2. Selecciona la hora</label>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {generarHoras().map((h) => {
                            const res = reservas.find(r => r.fecha === fecha && r.hora === h);
                            const isSelected = horaSeleccionada === h;
                            let color = "#EAF3DE"; let text = "#27500A";
                            if (res) { color = "#f8f9fa"; text = "#adb5bd"; }
                            else if (isSelected) { color = "#0d1b2a"; text = "#C8F135"; }

                            return (
                                <button
                                    key={h}
                                    onClick={() => { setHoraSeleccionada(h); setPaso(2); }}
                                    className="btn btn-sm shadow-sm"
                                    disabled={res}
                                    style={{
                                        width: "100px", fontWeight: "700", padding: "10px",
                                        background: color, color: text,
                                        border: isSelected ? "2px solid #0d1b2a" : "1px solid #ddd",
                                        borderRadius: "8px"
                                    }}
                                >
                                    {res ? (res.es_bloqueo ? "CERRADO" : "OCUPADO") : h}
                                </button>
                            );
                        })}
                    </div>
                </div>

              
                <div className="col-md-5">
                    <div className="p-4 bg-light shadow-sm" style={{ borderRadius: 15, border: "1px solid #eee" }}>
                        <h5 className="fw-bold mb-3 text-uppercase border-bottom pb-2" style={{ fontSize: "14px", color: "#0d1b2a" }}>
                            <p className="mb-3 text-danger"><b>   Resumen del turno </b></p>
                        </h5>


                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small">
                                <span className="text-muted">Complejo:</span>
                                <span className="fw-bold text-dark">{complejo?.nombre || cancha?.complejo_nombre || "---"}</span>
                            </div>

                            {/* Nuevo Campo: Teléfono */}
                            <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small">
                                <span className="text-muted">Teléfono:</span>
                                <span className="fw-bold text-dark">{complejo?.phone || complejo?.telefono || "---"}</span>
                            </div>

                            {/* Nuevo Campo: Correo */}
                            <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small">
                                <span className="text-muted">Correo:</span>
                                <span className="fw-bold text-dark" style={{ fontSize: '10px' }}>{complejo?.email || "---"}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small">
                                <span className="text-muted">Ubicación:</span>
                                <span className="fw-bold text-dark text-truncate ms-2">
                                    {complejo?.city || "---"}, {complejo?.country || "---"}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small">
                                <span className="text-muted">Cancha / Cat:</span>
                                <span className="fw-bold text-dark">
                                    {cancha?.nombre} ({cancha?.categoria_nombre || "Gral"})
                                </span>
                            </div>

                            <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small">
                                <span className="text-muted">Usuario:</span>
                                <span className="fw-bold text-dark text-capitalize">
                                    {store.auth?.user?.first_name || store.auth?.user?.username || "Invitado"}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small">
                                <span className="text-muted">Fecha:</span>
                                <span className="fw-bold text-dark">{fecha}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Horario:</span>
                                <span className="fw-bold text-dark">{horaSeleccionada || "--:--"} hs</span>
                            </div>
                        </div>


                        {/* Precios */}
                        <div className="mt-4 p-3 bg-white rounded border shadow-sm">
                            <div className="d-flex justify-content-between mb-2 small">
                                <span className="text-muted fw-bold">VALOR TOTAL:</span>
                                <span className="fw-bold text-dark">${Number(cancha?.precio_hora || 0).toLocaleString("es-CO")}</span>
                            </div>

                            <div className={`d-flex justify-content-between p-2 rounded border-start border-4 ${pagarTotal ? 'border-success bg-success bg-opacity-10' : 'border-primary bg-primary bg-opacity-10'}`}>
                                <span className="fw-bold small" style={{ fontSize: '11px' }}>
                                    {pagarTotal ? 'PAGO TOTAL AHORA:' : 'SEÑA REQUERIDA (10%):'}
                                </span>
                                <span className="fw-bold fs-6 text-dark">
                                    ${(pagarTotal ? Number(cancha?.precio_hora || 0) : Number(cancha?.precio_hora || 0) * 0.1).toLocaleString("es-CO")}
                                </span>
                            </div>

                            <div className="form-check mt-3 pt-2 border-top">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="pTotal"
                                    checked={pagarTotal}
                                    onChange={() => setPagarTotal(!pagarTotal)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label className="form-check-label fw-bold small text-dark" htmlFor="pTotal" style={{ cursor: 'pointer', fontSize: '11px' }}>
                                    QUIERO PAGAR EL TOTAL AHORA
                                </label>
                            </div>
                        </div>

                        <button
                            className="btn w-100 py-3 fw-bold mt-4 shadow-sm"
                            onClick={handleConfirmar}
                            disabled={!horaSeleccionada || estaOcupada}
                            style={{
                                borderRadius: "12px",
                                background: horaSeleccionada && !estaOcupada ? (pagarTotal ? "#198754" : "#0d1b2a") : "#ccc",
                                color: "#C8F135",
                                border: "none",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {pagarTotal ? 'CONFIRMAR Y PAGAR TOTAL' : 'CONFIRMAR Y PAGAR SEÑA'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default ReservaCancha;



