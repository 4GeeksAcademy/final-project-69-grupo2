import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2"; // ✅ Importamos SweetAlert2

export const AddCancha = () => {
    const { complejoId } = useParams();
    const [categorias, setCategorias] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [complejo, setComplejo] = useState(null);
    const [loading, setLoading] = useState(false);

    const [datos, setDatos] = useState({
        nombre: "",
        catId: "",
        precio: "",
        image: null
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    const token = localStorage.getItem("token"); // ✅ Obtenemos el token para seguridad

    const cargarDatos = async () => {
        try {
            const resCat = await fetch(`${backendUrl}/api/categorias`);
            if (resCat.ok) setCategorias(await resCat.json());

            const resCan = await fetch(`${backendUrl}/api/canchas?complejo_id=${complejoId}`);
            if (resCan.ok) setCanchas(await resCan.json());

            const resComp = await fetch(`${backendUrl}/api/complejo/${complejoId}`);
            if (resComp.ok) setComplejo(await resComp.json());
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => { cargarDatos(); }, [complejoId]);

    const guardar = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("nombre", datos.nombre);
        formData.append("complejo_id", complejoId);
        formData.append("categoria_id", datos.catId);
        formData.append("precio_hora", datos.precio);

        if (datos.image && datos.image.length > 0) {
            formData.append("image", datos.image[0]);
        }

        try {
            const resp = await fetch(`${backendUrl}/api/cancha`, {
                method: "POST",
                body: formData,
                headers: { "Authorization": `Bearer ${token}` } // ✅ Enviamos token
            });

            if (resp.ok) {
                // ✅ Alert de éxito con estilo
                Swal.fire({
                    icon: 'success',
                    title: '¡Cancha añadida!',
                    text: 'La cancha se ha registrado correctamente.',
                    confirmButtonColor: '#198754'
                });
                setDatos({ nombre: "", catId: "", precio: "", image: null });
                e.target.reset(); 
                cargarDatos();
            } else {
                const error = await resp.json();
                // ✅ Alert de error con estilo
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: error.error || error.msg,
                    confirmButtonColor: '#d33'
                });
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminar = async (idCancha) => {
        // ✅ Confirmación con estilo
        const result = await Swal.fire({
            title: '¿Seguro que quieres borrar esta cancha?',
            text: "Esta acción no se puede deshacer y borrará sus horarios.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const resp = await fetch(`${backendUrl}/api/cancha/${idCancha}`, { 
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    Swal.fire('¡Eliminada!', 'La cancha ha sido borrada.', 'success');
                    cargarDatos();
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-success fw-bold">
                    <i className="fa fa-futbol me-2"></i>Gestionar Canchas
                </h2>
                <Link to="/add-complejo" className="btn btn-outline-secondary shadow-sm">
                    <i className="fa fa-arrow-left me-1"></i> Volver a Complejos
                </Link>
            </div>

            {/* Formulario */}
            <div className="card p-4 shadow-sm mb-5 bg-white border-0" style={{ borderRadius: '15px' }}>
                <h5 className="mb-3 border-bottom pb-2">Añadir Nueva Cancha a <span className="text-success">{complejo?.nombre || "..."}</span></h5>
                <form onSubmit={guardar} className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold small">Nombre / Número</label>
                        <input className="form-control" value={datos.nombre} placeholder="Ej: Cancha 1" required
                            onChange={e => setDatos({ ...datos, nombre: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold small">Deporte</label>
                        <select className="form-select" value={datos.catId} required
                            onChange={e => setDatos({ ...datos, catId: e.target.value })}>
                            <option value="">Selecciona...</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold small">Precio / Hora</label>
                        <input type="number" className="form-control" value={datos.precio} placeholder="0.00" required
                            onChange={e => setDatos({ ...datos, precio: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold small">Foto</label>
                        <input type="file" className="form-control" accept="image/*"
                            onChange={e => setDatos({ ...datos, image: e.target.files })} />
                    </div>
                    <div className="col-12 mt-3">
                        <button className="btn btn-success w-100 fw-bold py-2 shadow-sm" disabled={loading}>
                            <i className="fa fa-plus me-1"></i> {loading ? "Registrando..." : "Registrar Cancha"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Listado */}
            <h4 className="mb-3">Canchas disponibles en: <span className="text-success">{complejo?.nombre || "Cargando..."}</span></h4>
            
            <div className="row">
                {canchas.length > 0 ? canchas.map(c => (
                    <div key={c.id} className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100 border-0 overflow-hidden" style={{ borderRadius: '12px' }}>
                            <img src={c.foto_url || "https://placehold.co"} 
                                 className="card-img-top" style={{ height: "160px", objectFit: "cover" }} />
                            <div className="card-body d-flex flex-column">
                                <div className="mb-2">
                                    <h5 className="card-title fw-bold text-dark mb-0">{c.nombre}</h5>
                                    <small className="text-muted"><i className="fa fa-tag me-1"></i> {c.categoria_nombre}</small>
                                </div>
                                <p className="card-text text-success fs-5 fw-bold mb-3">
                                    ${c.precio_hora} <small className="text-muted fw-normal">/ h</small>
                                </p>
                                <div className="mt-auto d-flex flex-column gap-2">
                                    <Link to={`/gestion-horarios/${c.id}`} className="btn btn-sm btn-primary w-100">
                                        <i className="fa fa-calendar-alt me-1"></i> Gestionar Horarios
                                    </Link>
                                    <button onClick={() => eliminar(c.id)} className="btn btn-sm btn-outline-danger w-100">
                                        <i className="fa fa-trash me-1"></i> Eliminar Cancha
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-5 bg-light rounded border">
                        <p className="text-muted">No hay canchas registradas en este complejo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
