import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/user.services";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const response = await requestPasswordReset(email);
            setSuccess(response?.message || "If the email exists, a reset link was sent.");
            setEmail("");
        } catch (err) {
            setError(err.message || "Failed to request password reset.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <h1 className="text-center mb-4">Recordar contraseña</h1>
                    <form className="border p-4 rounded" onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {success && <div className="alert alert-success" role="alert">{success}</div>}

                        <div className="mb-3 form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                placeholder="Ingresa tu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar enlace"}
                            </button>
                        </div>

                        <p className="text-center mt-3 mb-0">
                            Volver a <Link to="/login">iniciar sesión</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
