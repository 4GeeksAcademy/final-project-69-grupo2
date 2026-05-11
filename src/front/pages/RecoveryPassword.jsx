import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { updatePasswordWithToken } from "../services/user.services";

export const RecoveryPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = (searchParams.get("token") || "").trim();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            setError("Token invalido o faltante.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La nueva contrasena debe tener al menos 6 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contrasenas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            const response = await updatePasswordWithToken(token, newPassword);
            setSuccess(response?.message || "Contrasena actualizada correctamente.");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 1800);
        } catch (err) {
            setError(err.message || "No se pudo actualizar la contrasena.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <h1 className="text-center mb-4">Nueva contrasena</h1>
                    <form className="border p-4 rounded" onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {success && <div className="alert alert-success" role="alert">{success}</div>}

                        {!token && (
                            <div className="alert alert-warning" role="alert">
                                Link invalido. Solicita un nuevo correo de recuperacion.
                            </div>
                        )}

                        <div className="mb-3 form-group">
                            <label htmlFor="new_password" className="form-label">Nueva contrasena</label>
                            <input
                                type="password"
                                className="form-control"
                                id="new_password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3 form-group">
                            <label htmlFor="confirm_password" className="form-label">Confirmar contrasena</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirm_password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary" disabled={loading || !token}>
                                {loading ? "Actualizando..." : "Guardar contrasena"}
                            </button>
                        </div>

                        <p className="text-center mt-3 mb-0">
                            Volver a <Link to="/login">iniciar sesion</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
