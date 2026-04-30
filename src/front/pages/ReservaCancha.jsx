import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const HORAS = ["8:00am", "9:00am", "10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm", "7:00pm"];

const ReservaCancha = () => {
    const { cancha_id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const complejo_nombre = searchParams.get("complejo") || "Complejo";
    const cancha_nombre = searchParams.get("cancha") || "Cancha";
    const categoria = searchParams.get("categoria") || "";

    const [fecha, setFecha] = useState("");
    const [horaSeleccionada, setHoraSeleccionada] = useState("");
    const [ocupados, setOcupados] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [paso, setPaso] = useState(1);

    const hoy = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (fecha && cancha_id) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reservas/horarios?cancha_id=${cancha_id}&fecha=${fecha}`)
                .then(r => r.json())
                .then(data => setOcupados(data.ocupados || []));
        }
    }, [fecha, cancha_id]);

    const handleConfirmar = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setMostrarModal(true);
            return;
        }
        hacerReserva(token);
    };

    const hacerReserva = (token) => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reservas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ cancha_id: parseInt(cancha_id), fecha, hora: horaSeleccionada })
        })
            .then(r => r.json())
            .then(data => {
                if (data.id) {
                    alert("¡Reserva creada exitosamente! Revisa tu email para confirmar.");
                    navigate("/");
                } else {
                    alert(data.error || "Error al crear la reserva");
                }
            });
    };

    return (
        <div className="container py-5">
            <p className="text-muted small mb-3">
                Inicio › Complejos › {complejo_nombre} › <strong>Reservar cancha</strong>
            </p>

            {/* Pasos */}
            <div className="d-flex align-items-center gap-3 mb-4">
                {["Seleccionar día", "Elegir horario", "Confirmar reserva"].map((label, i) => (
                    <div key={i} className="d-flex align-items-center gap-2">
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500,
                            background: paso === i + 1 ? "#0d1b2a" : paso > i + 1 ? "#7cba00" : "#eee",
                            color: paso === i + 1 ? "#C8F135" : paso > i + 1 ? "#fff" : "#999"
                        }}>{i + 1}</div>
                        <span style={{ fontSize: 13, fontWeight: paso === i + 1 ? 500 : 400, color: paso === i + 1 ? "#111" : "#999" }}>{label}</span>
                        {i < 2 && <div style={{ width: 40, height: 1, background: "#ddd" }} />}
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-8">
                    <div className="card border-0 shadow-sm p-3 mb-3" style={{ borderRadius: 12 }}>
                        <h5 style={{ fontWeight: 700 }}>{complejo_nombre} — {cancha_nombre}</h5>
                        <p className="text-muted small mb-3">{categoria} · Colombia</p>

                        <p style={{ fontSize: 11, fontWeight: 500, color: "#999", letterSpacing: ".05em" }}>SELECCIONA EL DÍA</p>
                        <input
                            type="date"
                            min={hoy}
                            value={fecha}
                            onChange={e => { setFecha(e.target.value); setHoraSeleccionada(""); setPaso(1); }}
                            className="form-control mb-3"
                            style={{ maxWidth: 220 }}
                        />

                        {fecha && (
                            <>
                                <p style={{ fontSize: 11, fontWeight: 500, color: "#999", letterSpacing: ".05em" }}>
                                    HORARIOS DISPONIBLES — {fecha}
                                </p>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {HORAS.map(hora => {
                                        const ocupado = ocupados.includes(hora);
                                        const seleccionado = horaSeleccionada === hora;
                                        return (
                                            <button key={hora}
                                                disabled={ocupado}
                                                onClick={() => { setHoraSeleccionada(hora); setPaso(2); }}
                                                style={{
                                                    padding: "6px 14px", borderRadius: 8, fontSize: 12,
                                                    cursor: ocupado ? "not-allowed" : "pointer",
                                                    border: "0.5px solid",
                                                    background: seleccionado ? "#0d1b2a" : ocupado ? "#f5f5f5" : "#EAF3DE",
                                                    color: seleccionado ? "#C8F135" : ocupado ? "#bbb" : "#27500A",
                                                    borderColor: seleccionado ? "#0d1b2a" : ocupado ? "#eee" : "#C0DD97",
                                                    textDecoration: ocupado ? "line-through" : "none"
                                                }}>
                                                {hora}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="d-flex gap-3">
                                    <span style={{ fontSize: 11, color: "#999" }}>
                                        <span style={{ display: "inline-block", width: 10, height: 10, background: "#EAF3DE", border: "0.5px solid #C0DD97", borderRadius: 3, marginRight: 4 }} />Disponible
                                    </span>
                                    <span style={{ fontSize: 11, color: "#999" }}>
                                        <span style={{ display: "inline-block", width: 10, height: 10, background: "#f5f5f5", borderRadius: 3, marginRight: 4 }} />Ocupado
                                    </span>
                                    <span style={{ fontSize: 11, color: "#999" }}>
                                        <span style={{ display: "inline-block", width: 10, height: 10, background: "#0d1b2a", borderRadius: 3, marginRight: 4 }} />Seleccionado
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="col-4">
                    <div className="card border-0 shadow-sm p-3 mb-3" style={{ borderRadius: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: "#999", letterSpacing: ".05em" }}>RESUMEN DE TU RESERVA</p>
                        {[
                            ["Complejo", complejo_nombre],
                            ["Cancha", cancha_nombre],
                            ["Deporte", categoria],
                            ["Fecha", fecha || "—"],
                            ["Horario", horaSeleccionada ? `${horaSeleccionada} — +1h` : "—"],
                            ["Precio/hora", "$50.000"],
                        ].map(([label, val]) => (
                            <div key={label} className="d-flex justify-content-between mb-2">
                                <span style={{ fontSize: 13, color: "#666" }}>{label}</span>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between pt-2" style={{ borderTop: "0.5px solid #eee" }}>
                            <span style={{ fontWeight: 500 }}>Total</span>
                            <span style={{ fontWeight: 500, color: "#3B6D11" }}>$50.000</span>
                        </div>
                    </div>

                    {fecha && horaSeleccionada && (
                        <>
                            <div style={{ background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                                <p style={{ fontSize: 12, fontWeight: 500, color: "#633806", margin: 0 }}>Pago de seña requerido</p>
                                <p style={{ fontSize: 11, color: "#854F0B", margin: 0 }}>Para confirmar tu reserva debes pagar una seña del 10%: $5.000</p>
                            </div>
                            <button className="btn w-100 mb-2"
                                style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 8, padding: "10px" }}
                                onClick={handleConfirmar}>
                                Confirmar y pagar seña →
                            </button>
                            <button className="btn w-100" style={{ border: "0.5px solid #ddd", borderRadius: 8 }}
                                onClick={() => navigate(-1)}>
                                Cancelar
                            </button>
                            <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 10 }}>
                                Recibirás un email de confirmación al finalizar el pago
                            </p>
                        </>
                    )}
                </div>
            </div>

            {mostrarModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 340, width: "90%" }}>
                        <h5 style={{ fontWeight: 700, marginBottom: 8 }}>¿Tienes una cuenta?</h5>
                        <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Para confirmar tu reserva necesitas iniciar sesión o registrarte.</p>
                        <button className="btn w-100 mb-2"
                            style={{ background: "#C8F135", color: "#111", fontWeight: 600, borderRadius: 8 }}
                            onClick={() => navigate("/login")}>
                            Iniciar sesión
                        </button>
                        <button className="btn w-100 mb-2"
                            style={{ background: "#0d1b2a", color: "#fff", fontWeight: 600, borderRadius: 8 }}
                            onClick={() => navigate("/registro")}>
                            Registrarme
                        </button>
                        <button className="btn w-100" style={{ border: "0.5px solid #ddd", borderRadius: 8 }}
                            onClick={() => setMostrarModal(false)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservaCancha;