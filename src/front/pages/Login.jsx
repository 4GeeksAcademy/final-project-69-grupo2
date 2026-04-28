import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/user.services";
import useGlobalReducer from "../hooks/useGlobalReducer";


const initialLoginState = {
    email: "",
    password: "",
};

export const Login = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();
    const [credentials, setCredentials] = useState(initialLoginState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = ({ target }) => {
        const { name, value } = target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        loginUser(credentials)
            .then((response) => {
                if (!response?.access_token || response.access_token === "undefined" || response.access_token === "null") {
                    throw new Error("Login response did not include a valid token.");
                }

                localStorage.setItem("access_token", response.access_token);
                localStorage.setItem("user", JSON.stringify(response.user));
                dispatch({
                    type: "set_auth",
                    payload: {
                        token: response.access_token,
                        user: response.user,
                    },
                });
                setSuccess(`Welcome back, ${response?.user?.username || "user"}!`);
                setCredentials({ ...initialLoginState });
                navigate("/");
            })
            .catch((error) => {
                setError(error.message || "Failed to login. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">

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
                                placeholder="Enter your email"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="d-grid">
                            <button type="submit" className="btn btn-auth-shared" disabled={loading}>
                                {loading ? "Signing in..." : "Login"}
                            </button>
                        </div>

                        <p className="text-center mt-3 mb-1">
                            No tienes cuenta? <Link to="/register">Registrate</Link>
                        </p>
                        <p className="text-center mb-0">
                            <Link to="/forgot-password">Recordar contrasena</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
