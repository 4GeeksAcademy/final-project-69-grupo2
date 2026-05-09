import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

const PagoExitoso = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const alertaMostrada = useRef(false);
    const [estado, setEstado] = useState("verificando"); // "verificando", "exito" o "error"

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    useEffect(() => {
        const confirmarPago = async () => {
            // Evitar ejecuciones duplicadas o sin ID
            if (!sessionId || alertaMostrada.current) return;
            alertaMostrada.current = true;

            try {
                const resp = await fetch(`${backendUrl}/api/confirmar-pago`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId })
                });

                const data = await resp.json();

                if (resp.ok && data.success) {
                    setEstado("exito");
                    Swal.fire({
                        icon: 'success',
                        title: '¡Pago Confirmado!',
                        html: `Tu reserva en <b>${data.cancha}</b> ha sido procesada con éxito.`,
                        confirmButtonColor: '#C8F135',
                        confirmButtonText: 'Ver mis reservas',
                        allowOutsideClick: false,
                    }).then(() => navigate("/reservas"));
                } else {
                    throw new Error(data.error || "Error en el servidor");
                }
            } catch (error) {
                console.error("Error confirmando pago:", error);
                setEstado("error");
                Swal.fire({
                    icon: 'warning',
                    title: 'Verificación pendiente',
                    text: 'Tu pago fue procesado por Stripe pero no pudimos actualizar tu reserva automáticamente. La administración lo hará manualmente.',
                    confirmButtonText: 'Entendido',
                }).then(() => navigate("/reservas"));
            }
        };

        confirmarPago();
    }, [sessionId, navigate, backendUrl]);

    // Redirigir si alguien entra directo sin session_id
    if (!sessionId) {
        navigate("/");
        return null;
    }

    return (
        <div className="container text-center vh-100 d-flex flex-column justify-content-center align-items-center">
            {estado === "verificando" && (
                <>
                    <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <h2 className="fw-bold">Confirmando tu pago...</h2>
                    <p className="text-muted">Estamos validando la transacción con Stripe y actualizando tu reserva.</p>
                </>
            )}
            {estado === "error" && <p>Hubo un problema, redirigiendo...</p>}
        </div>
    );
};

export default PagoExitoso;
