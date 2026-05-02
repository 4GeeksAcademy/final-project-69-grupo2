// 

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
    const [categorias, setCategorias] = useState([]);
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    
    const isAuthenticated = Boolean(store?.auth?.isAuthenticated);
    const user = store?.auth?.user;
    const role = String(user?.role || "user").toLowerCase();
    
    const isAdmin = role === "admin";
    const isSuperAdmin = role === "super_admin";
    const isGeneralUser = role === "user";
    
    const avatarUrl = user?.avatar_url;
    const avatarFallback = (user?.username?.[0] || user?.email?.[0] || "U").toUpperCase();

    const handleLogout = () => {
        localStorage.clear();
        dispatch({ type: "clear_auth" });
        navigate("/");
    };

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/api/categorias")
            .then(r => r.json())
            .then(data => setCategorias(data))
            .catch(err => console.error("Error categorías:", err));
    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: "#0d1b2a" }}>
            <div className="container">
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2" style={{ fontWeight: 700 }}>
                    <div style={{
                        background: "#C8F135", borderRadius: "50%", width: "36px", height: "36px",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
                    }}>🏃</div>
                    <div style={{ lineHeight: 1.1 }}>
                        <div style={{ fontSize: "14px", letterSpacing: "0.05em" }}>COMPLEJO</div>
                        <div style={{ color: "#C8F135", fontSize: "14px", letterSpacing: "0.05em" }}>DEPORTIVO</div>
                    </div>
                </Link>

                <div className="d-flex align-items-center gap-3 ms-auto">
                    <Link className="nav-link text-white" to="/">Inicio</Link>

                    {!isAuthenticated && (
                        <Link className="nav-link text-white" to="/register">Registro</Link>
                    )}

                    {/* Dropdown Categorías */}
                    <div className="dropdown">
                        <button className="btn nav-link text-white dropdown-toggle" data-bs-toggle="dropdown">
                            Categorías
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            {categorias.length === 0 ? (
                                <li><span className="dropdown-item text-muted">Cargando...</span></li>
                            ) : (
                                categorias.map((cat) => (
                                    <li key={cat.id || cat.nombre}>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => navigate(`/?categoria=${cat.nombre}`)}
                                        >
                                            {cat.nombre}
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Dropdown Opciones de Usuario (Solo si está autenticado) */}
                    {isAuthenticated && (
                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                Mi Panel
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                {isSuperAdmin && (
                                    <>
                                        <li><Link className="dropdown-item" to="/admin/complejos">Gestionar Complejos</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/reservas">Reporte de Reservas</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/confirmaciones">Confirmación de Reservas</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/usuarios">Gestionar Usuarios</Link></li>
                                    </>
                                )}
                                {isAdmin && (
                                    <>
                                        <li><Link className="dropdown-item" to="/mis-complejos">Gestionar Complejos</Link></li>
                                        <li><Link className="dropdown-item" to="/reportes">Reporte de Reservas</Link></li>
                                        <li><Link className="dropdown-item" to="/confirmar">Confirmación de Reservas</Link></li>
                                    </>
                                )}
                                {isGeneralUser && (
                                    <>
                                        <li><Link className="dropdown-item" to="/mis-reservas">Mis Reservas</Link></li>
                                        <li><Link className="dropdown-item" to="/add-complejo">Registro de Complejo</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}

                    <button
                        className="btn"
                        style={{ background: "#C8F135", color: "#111", fontWeight: 600, padding: "8px 20px", borderRadius: "8px" }}
                        onClick={() => navigate("/reservas")}
                    >
                        RESERVAR AHORA 
                    </button>

                    {!isAuthenticated ? (
                        <button
                            className="btn btn-outline-light"
                            style={{ fontWeight: 600, padding: "8px 20px", borderRadius: "8px" }}
                            onClick={() => navigate("/login")}
                        >
                            LOGIN
                        </button>
                    ) : (
                        <div className="d-flex align-items-center gap-2 ms-2">
                            <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    width: "34px", height: "34px", borderRadius: "50%",
                                    overflow: "hidden", border: "2px solid #C8F135",
                                    background: "#14263b", color: "#fff", fontWeight: 700, fontSize: "12px"
                                }}
                                title={user?.username || user?.email}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span>{avatarFallback}</span>
                                )}
                            </div>
                            <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
