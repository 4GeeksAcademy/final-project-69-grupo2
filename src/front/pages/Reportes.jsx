import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import {
    getAdminReportes,
    getAdminEstadisticas,
    getAdminComplejos,
} from "../services/user.services.js";
import "../pages/css/global.css";

const Reportes = () => {
    const { store } = useGlobalReducer();
    const [reservas, setReservas] = useState([]);
    const [stats, setStats] = useState(null);
    const [complejos, setComplejos] = useState([]);
    const [canchasDisponibles, setCanchasDisponibles] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Filtros
    const [filtroComplejo, setFiltroComplejo] = useState("");
    const [filtroCancha, setFiltroCancha] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");
    const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
    const [filtroFechaFin, setFiltroFechaFin] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    // Cargar complejos del admin
    useEffect(() => {
        const cargarComplejos = async () => {
            try {
                const data = await getAdminComplejos(store.auth?.token);
                setComplejos(data);
            } catch (err) {
                console.error("Error al cargar complejos:", err);
            }
        };

        if (store.auth?.token) {
            cargarComplejos();
        }
    }, [store.auth?.token]);

    // Cargar canchas cuando se selecciona un complejo
    useEffect(() => {
        if (filtroComplejo) {
            const complejo = complejos.find((c) => c.id == filtroComplejo);
            if (complejo) {
                setCanchasDisponibles(complejo.canchas || []);
            }
        } else {
            setCanchasDisponibles([]);
        }
    }, [filtroComplejo, complejos]);

    // Cargar reportes al cambiar filtros
    useEffect(() => {
        const cargarReportes = async () => {
            try {
                setCargando(true);
                setError(null);

                const params = {};
                if (filtroComplejo) params.complejo_id = filtroComplejo;
                if (filtroCancha) params.cancha_id = filtroCancha;
                if (filtroFecha) params.fecha = filtroFecha;
                if (filtroFechaInicio) params.fecha_inicio = filtroFechaInicio;
                if (filtroFechaFin) params.fecha_fin = filtroFechaFin;
                if (filtroEstado) params.estado = filtroEstado;

                const data = await getAdminReportes(store.auth?.token, params);
                setReservas(data);

                // Cargar estadísticas
                const statsData = await getAdminEstadisticas(
                    store.auth?.token,
                    filtroFechaInicio,
                    filtroFechaFin
                );
                setStats(statsData);
            } catch (err) {
                console.error("Error al cargar reportes:", err);
                setError(err.message || "Error al cargar los reportes");
            } finally {
                setCargando(false);
            }
        };

        if (store.auth?.token) {
            cargarReportes();
        }
    }, [
        filtroComplejo,
        filtroCancha,
        filtroFecha,
        filtroFechaInicio,
        filtroFechaFin,
        filtroEstado,
        store.auth?.token,
    ]);

    // Formatear fecha
    const formatearFecha = (fecha) => {
        const date = new Date(fecha + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Descargar CSV
    const descargarCSV = () => {
        if (reservas.length === 0) {
            alert("No hay reservas para descargar");
            return;
        }

        const csv = [
            ["Fecha", "Hora", "Cancha", "Complejo", "Usuario ID", "Estado"],
            ...reservas.map((r) => [
                r.fecha,
                r.hora,
                r.cancha_nombre,
                r.complejo_nombre,
                r.user_id,
                r.estado,
            ]),
        ]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte-reservas-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getEstadoClase = (estado) => {
        switch (estado?.toLowerCase()) {
            case "pendiente":
                return "report-status-pendiente";
            case "confirmada":
                return "report-status-confirmada";
            case "cancelada":
                return "report-status-cancelada";
            default:
                return "";
        }
    };

    if (!store.auth?.user || !["admin", "super_admin"].includes(store.auth.user.role)) {
        return (
            <div className="container py-5 report-page">
                <div className="alert alert-danger" role="alert">
                    <strong>Acceso Denegado</strong>
                    <p className="mb-0">Solo los administradores pueden ver esta página.</p>
                </div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="container py-5 report-page">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando reportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5 report-page-fluid">
            <div className="report-hero">
                <div className="report-eyebrow">Panel administrativo</div>
                <h1 className="display-5 fw-bold mb-2">Reportes de Reservas</h1>
                <p className="fs-5 mb-0">
                    Panel administrativo para gestionar reservas de tus complejos
                </p>
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

            {/* Tarjetas de estadísticas */}
            {stats && (
                <div className="row mb-5">
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card stat-card-brand stat-card-dark">
                            <div className="card-body">
                                <h6 className="card-title">Total Reservas</h6>
                                <h2>{stats.total_reservas}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card stat-card-brand stat-card-green">
                            <div className="card-body">
                                <h6 className="card-title">Confirmadas</h6>
                                <h2>{stats.confirmadas}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card stat-card-brand stat-card-lime">
                            <div className="card-body">
                                <h6 className="card-title">Pendientes</h6>
                                <h2>{stats.pendientes}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card stat-card-brand stat-card-soft">
                            <div className="card-body">
                                <h6 className="card-title">Canceladas</h6>
                                <h2>{stats.canceladas}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {stats && (
                <div className="row mb-5">
                    {Object.keys(stats.por_complejo).length > 0 && (
                        <div className="col-md-6 mb-3">
                            <div className="card panel-surface report-breakdown-card h-100">
                                <div className="card-header">
                                    <h5 className="mb-0 fw-bold">Reservas por Complejo</h5>
                                </div>
                                <div className="card-body">
                                    <ul className="list-group list-group-flush report-breakdown-list">
                                        {Object.entries(stats.por_complejo).map(
                                            ([complejo, data]) => (
                                                <li
                                                    key={complejo}
                                                    className="list-group-item d-flex justify-content-between align-items-center"
                                                >
                                                    <span>{complejo}</span>
                                                    <span>
                                                        <span className="badge bg-primary me-2">
                                                            {data.total}
                                                        </span>
                                                        <span className="badge bg-success">
                                                            {data.confirmadas}
                                                        </span>
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {Object.keys(stats.por_cancha).length > 0 && (
                        <div className="col-md-6 mb-3">
                            <div className="card panel-surface report-breakdown-card h-100">
                                <div className="card-header">
                                    <h5 className="mb-0 fw-bold">Reservas por Cancha</h5>
                                </div>
                                <div className="card-body">
                                    <ul className="list-group list-group-flush report-breakdown-list">
                                        {Object.entries(stats.por_cancha).map(([cancha, data]) => (
                                            <li
                                                key={cancha}
                                                className="list-group-item d-flex justify-content-between align-items-center"
                                            >
                                                <span>{cancha}</span>
                                                <span>
                                                    <span className="badge bg-primary me-2">
                                                        {data.total}
                                                    </span>
                                                    <span className="badge bg-success">
                                                        {data.confirmadas}
                                                    </span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="panel-surface report-filter-card mb-4">
                <h5 className="report-filter-title">Filtros</h5>
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="report-form-label">Complejo</label>
                        <select
                            className="form-select report-select"
                            value={filtroComplejo}
                            onChange={(e) => {
                                setFiltroComplejo(e.target.value);
                                setFiltroCancha(""); // Reset cancha cuando cambia complejo
                            }}
                        >
                            <option value="">— Todos —</option>
                            {complejos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="report-form-label">Cancha</label>
                        <select
                            className="form-select report-select"
                            value={filtroCancha}
                            onChange={(e) => setFiltroCancha(e.target.value)}
                            disabled={!filtroComplejo}
                        >
                            <option value="">— Todas —</option>
                            {canchasDisponibles.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="report-form-label">Fecha específica</label>
                        <input
                            type="date"
                            className="form-control report-input"
                            value={filtroFecha}
                            onChange={(e) => setFiltroFecha(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="report-form-label">Estado</label>
                        <select
                            className="form-select report-select"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">— Todos —</option>
                            <option value="confirmada">✓ Confirmada</option>
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="cancelada">✗ Cancelada</option>
                        </select>
                    </div>
                </div>

                <div className="row g-3 mt-2">
                    <div className="col-md-3">
                        <label className="report-form-label">Desde</label>
                        <input
                            type="date"
                            className="form-control report-input"
                            value={filtroFechaInicio}
                            onChange={(e) => setFiltroFechaInicio(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="report-form-label">Hasta</label>
                        <input
                            type="date"
                            className="form-control report-input"
                            value={filtroFechaFin}
                            onChange={(e) => setFiltroFechaFin(e.target.value)}
                        />
                    </div>

                    <div className="col-md-6 d-flex gap-2 align-items-end">
                        <button
                            className="btn btn-outline-dark btn-outline-rounded flex-grow-1"
                            onClick={() => {
                                setFiltroComplejo("");
                                setFiltroCancha("");
                                setFiltroFecha("");
                                setFiltroFechaInicio("");
                                setFiltroFechaFin("");
                                setFiltroEstado("");
                            }}
                        >
                            <i className="fa fa-redo me-2"></i>Limpiar Filtros
                        </button>
                        <button
                            className="btn btn-brand-lime flex-grow-1"
                            onClick={descargarCSV}
                        >
                            <i className="fa fa-download me-2"></i>Descargar CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="card panel-surface report-table-card">
                <div className="card-header">
                    <h5 className="mb-0 fw-bold">
                        Reservas ({reservas.length} resultados)
                    </h5>
                </div>
                <div className="card-body p-0">
                    {reservas.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover report-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Hora</th>
                                        <th>Cancha</th>
                                        <th>Complejo</th>
                                        <th>Usuario ID</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservas.map((r) => (
                                        <tr key={r.id}>
                                            <td className="fw-bold">
                                                <i className="fa fa-calendar me-2 text-primary"></i>
                                                {formatearFecha(r.fecha)}
                                            </td>
                                            <td>
                                                <i className="fa fa-clock me-2 text-info"></i>
                                                {r.hora}:00
                                            </td>
                                            <td>
                                                <strong>{r.cancha_nombre}</strong>
                                            </td>
                                            <td>{r.complejo_nombre}</td>
                                            <td>
                                                <code>{r.user_id}</code>
                                            </td>
                                            <td>
                                                <span className={`report-status-chip report-status-chip-dark ${getEstadoClase(r.estado)}`}>
                                                    {r.estado.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="report-empty-state m-4">
                            <i className="fa fa-inbox mb-3"></i>
                            <p className="mt-3 mb-0">
                                No hay reservas con los filtros seleccionados
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reportes;
