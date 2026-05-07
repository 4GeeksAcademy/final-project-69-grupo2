import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getUserReservas } from "../services/user.services.js";
import "../pages/css/global.css";

const MisReservas = () => {
    const { store } = useGlobalReducer();
    const [reservas, setReservas] = useState([]);
    const [reservasFiltradas, setReservasFiltradas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [busqueda, setBusqueda] = useState("");

    // Cargar reservas al montar el componente
    useEffect(() => {
        const cargarReservas = async () => {
            try {
                setCargando(true);
                setError(null);

                if (!store.auth?.user?.id) {
                    setError("Usuario no autenticado");
                    return;
                }

                const data = await getUserReservas(store.auth.user.id, store.auth?.token);
                setReservas(data);
            } catch (err) {
                console.error("Error al cargar reservas:", err);
                setError(err.message || "Error al cargar las reservas");
            } finally {
                setCargando(false);
            }
        };

        cargarReservas();
    }, [store.auth?.user?.id, store.auth?.token]);

    // Aplicar filtros
    useEffect(() => {
        let resultado = [...reservas];

        // Filtrar por estado
        if (filtroEstado !== "todos") {
            resultado = resultado.filter((r) => r.estado === filtroEstado);
        }

        // Filtrar por búsqueda (cancha, complejo)
        if (busqueda.trim()) {
            const busquedaLower = busqueda.toLowerCase();
            resultado = resultado.filter(
                (r) =>
                    r.cancha_nombre?.toLowerCase().includes(busquedaLower) ||
                    r.complejo_nombre?.toLowerCase().includes(busquedaLower)
            );
        }

        // Ordenar por fecha descendente
        resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        setReservasFiltradas(resultado);
    }, [reservas, filtroEstado, busqueda]);

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        const date = new Date(fecha + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Función para formatear hora
    const formatearHora = (hora) => {
        return `${hora}:00`;
    };

    // Función para obtener color del estado
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

    // Función para calcular estadísticas
    const calcularEstadisticas = () => {
        const stats = {
            total: reservas.length,
            confirmadas: reservas.filter((r) => r.estado === "confirmada").length,
            pendientes: reservas.filter((r) => r.estado === "pendiente").length,
            canceladas: reservas.filter((r) => r.estado === "cancelada").length,
        };
        return stats;
    };

    // Función para descargar reporte como CSV
    const descargarReporte = () => {
        if (reservasFiltradas.length === 0) {
            alert("No hay reservas para descargar");
            return;
        }

        const csv = [
            ["Fecha", "Hora", "Cancha", "Complejo", "Estado"],
            ...reservasFiltradas.map((r) => [
                r.fecha,
                r.hora,
                r.cancha_nombre,
                r.complejo_nombre,
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

    const stats = calcularEstadisticas();

    if (cargando) {
        return (
            <div className="container py-5 report-page">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando tu historial de reservas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 report-page">
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> {error}
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                    ></button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 report-page">
            <div className="report-hero">
                <div className="report-eyebrow">Historial personal</div>
                <h1 className="display-5 fw-bold mb-2">Mis Reservas</h1>
                <p className="fs-5 mb-0">
                    Historial completo de todas tus reservas
                </p>
            </div>

            <div className="row mb-5">
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card stat-card-brand stat-card-dark">
                        <div className="card-body">
                            <h6 className="card-title">Total</h6>
                            <h2>{stats.total}</h2>
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

            <div className="panel-surface report-filter-card mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-6">
                        <label className="report-form-label">Buscar por cancha o complejo</label>
                        <input
                            type="text"
                            className="form-control report-input"
                            placeholder="Busca por cancha o complejo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="report-form-label">Filtrar por estado</label>
                        <select
                            className="form-select report-select"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="todos">— Todos los estados —</option>
                            <option value="confirmada">✓ Confirmada</option>
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="cancelada">✗ Cancelada</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button
                            className="btn btn-brand-lime w-100 h-100"
                            onClick={descargarReporte}
                            title="Descargar reporte como CSV"
                        >
                            <i className="fa fa-download me-2"></i>Descargar
                        </button>
                    </div>
                </div>
            </div>

            {/* Listado de reservas */}
            {reservasFiltradas.length > 0 ? (
                <div>
                    <div className="mb-3">
                        <p className="report-summary-text mb-0">
                            Mostrando <strong>{reservasFiltradas.length}</strong> de{" "}
                            <strong>{reservas.length}</strong> reservas
                        </p>
                    </div>

                    <div className="row">
                        {reservasFiltradas.map((reserva) => (
                            <div key={reserva.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="report-item-card">
                                    <div className={`report-item-header ${getEstadoClase(reserva.estado)}`}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold">
                                                {reserva.complejo_nombre || "Complejo"}
                                            </span>
                                            <span className="report-status-chip report-status-chip-light">
                                                {reserva.estado?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <h5 className="card-title fw-bold mb-3">
                                            {reserva.cancha_nombre}
                                        </h5>

                                        <div className="mb-3">
                                            <div className="report-meta-row">
                                                <span className="report-meta-icon">
                                                    <i className="fa fa-calendar"></i>
                                                </span>
                                                <span>
                                                    <strong>Fecha:</strong> {formatearFecha(reserva.fecha)}
                                                </span>
                                            </div>
                                            <div className="report-meta-row">
                                                <span className="report-meta-icon">
                                                    <i className="fa fa-clock"></i>
                                                </span>
                                                <span>
                                                    <strong>Hora:</strong> {formatearHora(reserva.hora)}
                                                </span>
                                            </div>
                                            <div className="report-meta-row mb-0">
                                                <span className="report-meta-icon">
                                                    <i className="fa fa-map-marker"></i>
                                                </span>
                                                <span>
                                                    <strong>Complejo:</strong> {reserva.complejo_nombre}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-top pt-2 mt-3">
                                            <small className="text-muted">
                                                ID de reserva: {reserva.id}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="report-empty-state" role="alert">
                    <i className="fa fa-info-circle mb-3"></i>
                    <strong>No hay reservas</strong>
                    <p className="mb-0 mt-2">
                        {busqueda || filtroEstado !== "todos"
                            ? "No se encontraron reservas con los filtros aplicados."
                            : "Aún no tienes reservas. ¡Crea una nueva!"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MisReservas;
