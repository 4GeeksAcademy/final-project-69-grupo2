import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getAdminUsuarios, updateAdminUsuario } from "../services/user.services.js";
import "../pages/css/global.css";

const AdminUsuarios = () => {
    const { store } = useGlobalReducer();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroTexto, setFiltroTexto] = useState("");
    const [filtroRol, setFiltroRol] = useState("todos");
    const [updatingId, setUpdatingId] = useState(null);

    const currentUserId = store.auth?.user?.id;
    const currentRole = String(store.auth?.user?.role || "").toLowerCase();
    const isSuperAdmin = currentRole === "super_admin";

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAdminUsuarios(store.auth?.token);
            setUsuarios(data || []);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            setError(err.message || "No se pudieron cargar los usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (store.auth?.token && isSuperAdmin) {
            cargarUsuarios();
        } else {
            setLoading(false);
        }
    }, [store.auth?.token, isSuperAdmin]);

    const actualizarUsuario = async (userId, payload) => {
        try {
            setUpdatingId(userId);
            const actualizado = await updateAdminUsuario(store.auth?.token, userId, payload);
            setUsuarios((prev) => prev.map((u) => (u.id === userId ? actualizado : u)));
        } catch (err) {
            alert(err.message || "No se pudo actualizar el usuario");
        } finally {
            setUpdatingId(null);
        }
    };

    const usuariosFiltrados = usuarios.filter((u) => {
        const txt = filtroTexto.trim().toLowerCase();
        const matchTexto =
            !txt ||
            u.username?.toLowerCase().includes(txt) ||
            u.email?.toLowerCase().includes(txt) ||
            u.full_name?.toLowerCase().includes(txt);

        const matchRol = filtroRol === "todos" ? true : u.role === filtroRol;
        return matchTexto && matchRol;
    });

    if (!store.auth?.user || !store.auth?.isAuthenticated) {
        return (
            <div className="container py-5 report-page">
                <div className="alert alert-danger" role="alert">
                    Debes iniciar sesión para acceder.
                </div>
            </div>
        );
    }

    if (!isSuperAdmin) {
        return (
            <div className="container py-5 report-page">
                <div className="alert alert-danger" role="alert">
                    Acceso denegado. Solo superadministrador.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-5 report-page">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5 report-page-fluid">
            <div className="report-hero">
                <div className="report-eyebrow">Panel superadmin</div>
                <h1 className="display-5 fw-bold mb-2">Gestión de Usuarios</h1>
                <p className="fs-5 mb-0">Administra rol y estado activo de usuarios del sistema.</p>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> {error}
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                    ></button>
                </div>
            )}

            <div className="panel-surface report-filter-card mb-4">
                <h5 className="report-filter-title">Filtros</h5>
                <div className="row g-3 align-items-end">
                    <div className="col-md-8">
                        <label className="report-form-label">Buscar</label>
                        <input
                            type="text"
                            className="form-control report-input"
                            placeholder="Nombre, usuario o email"
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="report-form-label">Rol</label>
                        <select
                            className="form-select report-select"
                            value={filtroRol}
                            onChange={(e) => setFiltroRol(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="admin">Admin</option>
                            <option value="user">General</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card panel-surface report-table-card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Usuarios ({usuariosFiltrados.length} resultados)</h5>
                    <button className="btn btn-outline-dark btn-outline-rounded" onClick={cargarUsuarios}>
                        <i className="fa fa-sync me-2"></i>Recargar
                    </button>
                </div>
                <div className="card-body p-0">
                    {usuariosFiltrados.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover report-table align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados.map((u) => {
                                        const isSelf = Number(u.id) === Number(currentUserId);
                                        const isOtherSuperAdmin = u.role === "super_admin";
                                        const blocked = isSelf || isOtherSuperAdmin;

                                        return (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>
                                                    <div className="fw-bold">{u.full_name || u.username}</div>
                                                    <small className="text-muted">@{u.username}</small>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className="badge bg-secondary text-uppercase">{u.role}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${u.is_active ? "bg-success" : "bg-danger"}`}>
                                                        {u.is_active ? "Activo" : "Inactivo"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            disabled={blocked || updatingId === u.id || u.role === "admin"}
                                                            onClick={() => actualizarUsuario(u.id, { role: "admin" })}
                                                        >
                                                            Hacer Admin
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            disabled={blocked || updatingId === u.id || u.role === "user"}
                                                            onClick={() => actualizarUsuario(u.id, { role: "user" })}
                                                        >
                                                            Hacer General
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            disabled={blocked || updatingId === u.id || !u.is_active}
                                                            onClick={() => actualizarUsuario(u.id, { is_active: false })}
                                                        >
                                                            Inactivar
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-success"
                                                            disabled={blocked || updatingId === u.id || u.is_active}
                                                            onClick={() => actualizarUsuario(u.id, { is_active: true })}
                                                        >
                                                            Activar
                                                        </button>
                                                    </div>
                                                    {blocked && (
                                                        <small className="text-muted d-block mt-1">
                                                            Usuario protegido para evitar bloqueos del panel.
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="report-empty-state m-4">
                            <i className="fa fa-users mb-3"></i>
                            <p className="mt-3 mb-0">No hay usuarios que coincidan con los filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsuarios;
