
// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";

// export const AddCancha = () => {
//     const { complejoId } = useParams();
//     const [categorias, setCategorias] = useState([]);
//     const [canchas, setCanchas] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const [datos, setDatos] = useState({
//         nombre: "",
//         catId: "",
//         precio: "",
//         image: null
//     });

//     const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

//     const cargarDatos = async () => {
//         try {
//             const resCat = await fetch(`${backendUrl}/api/categorias`);
//             if (resCat.ok) setCategorias(await resCat.json());

//             const resCan = await fetch(`${backendUrl}/api/canchas?complejo_id=${complejoId}`);
//             if (resCan.ok) setCanchas(await resCan.json());
//         } catch (error) {
//             console.error("Error cargando datos:", error);
//         }
//     };

//     useEffect(() => {
//         cargarDatos();
//     }, [complejoId]);

//     const guardar = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const formData = new FormData();
//         formData.append("nombre", datos.nombre);
//         formData.append("complejo_id", complejoId);
//         formData.append("categoria_id", datos.catId);
//         formData.append("precio_hora", datos.precio);

//         // Envío correcto del archivo para Cloudinary
//         if (datos.image && datos.image.length > 0) {
//             formData.append("image", datos.image[0]);
//         }

//         try {
//             const resp = await fetch(`${backendUrl}/api/cancha`, {
//                 method: "POST",
//                 body: formData
//             });

//             if (resp.ok) {
//                 alert("¡Cancha añadida!");
//                 setDatos({ nombre: "", catId: "", precio: "", image: null });
//                 e.target.reset(); 
//                 cargarDatos();
//             } else {
//                 const error = await resp.json();
//                 alert("Error: " + (error.error || error.msg));
//             }
//         } catch (error) {
//             console.error("Error al guardar:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const eliminar = async (idCancha) => {
//         if (!window.confirm("¿Seguro que quieres borrar esta cancha?")) return;
//         try {
//             const resp = await fetch(`${backendUrl}/api/cancha/${idCancha}`, { method: "DELETE" });
//             if (resp.ok) cargarDatos();
//         } catch (error) {
//             console.error("Error al eliminar:", error);
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h2 className="text-success fw-bold">
//                     <i className="fa fa-futbol me-2"></i>Gestionar Canchas
//                 </h2>
//                 <Link to="/add-complejo" className="btn btn-outline-secondary shadow-sm">
//                     <i className="fa fa-arrow-left me-1"></i> Volver a Complejos
//                 </Link>
//             </div>

//             {/* Formulario */}
//             <div className="card p-4 shadow-sm mb-5 bg-white border-0">
//                 <h5 className="mb-3 border-bottom pb-2">Añadir Nueva Cancha</h5>
//                 <form onSubmit={guardar} className="row g-3">
//                     <div className="col-md-4">
//                         <label className="form-label fw-bold">Nombre / Número</label>
//                         <input className="form-control" value={datos.nombre} placeholder="Ej: Cancha 1" required
//                             onChange={e => setDatos({ ...datos, nombre: e.target.value })} />
//                     </div>
//                     <div className="col-md-3">
//                         <label className="form-label fw-bold">Deporte</label>
//                         <select className="form-select" value={datos.catId} required
//                             onChange={e => setDatos({ ...datos, catId: e.target.value })}>
//                             <option value="">Selecciona...</option>
//                             {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
//                         </select>
//                     </div>
//                     <div className="col-md-2">
//                         <label className="form-label fw-bold">Precio / Hora</label>
//                         <input type="number" className="form-control" value={datos.precio} placeholder="0.00" required
//                             onChange={e => setDatos({ ...datos, precio: e.target.value })} />
//                     </div>
//                     <div className="col-md-3">
//                         <label className="form-label fw-bold">Foto</label>
//                         <input type="file" className="form-control" accept="image/*"
//                             onChange={e => setDatos({ ...datos, image: e.target.files })} />
//                     </div>
//                     <div className="col-12 mt-3">
//                         <button className="btn btn-success w-100 fw-bold py-2 shadow-sm" disabled={loading}>
//                             <i className="fa fa-plus me-1"></i> {loading ? "Registrando..." : "Registrar Cancha"}
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {/* Listado */}
//             <h4 className="mb-3">Canchas en este Complejo</h4>
//             <div className="row">
//                 {canchas.length > 0 ? canchas.map(c => (
//                     <div key={c.id} className="col-md-4 mb-4">
//                         <div className="card shadow-sm h-100 border-0 overflow-hidden">
//                             <img src={c.foto_url || "https://placehold.co"} 
//                                  className="card-img-top" style={{ height: "160px", objectFit: "cover" }} />
//                             <div className="card-body d-flex flex-column">
//                                 <div className="d-flex justify-content-between align-items-start mb-2">
//                                     <h5 className="card-title fw-bold text-dark mb-0">{c.nombre}</h5>
//                                     <span className="badge bg-info text-dark">{c.categoria_nombre}</span>
//                                 </div>
//                                 <p className="card-text text-success fs-5 fw-bold mb-3">
//                                     ${c.precio_hora} <small className="text-muted fw-normal">/ hora</small>
//                                 </p>
                                
//                                 <div className="mt-auto d-flex flex-column gap-2">
//                                     {/* 👇 AQUÍ ESTÁ EL BOTÓN DE CARGAR HORARIOS 👇 */}
//                                     <Link to={`/gestion-horarios/${c.id}`} className="btn btn-sm btn-primary w-100 shadow-sm">
//                                         <i className="fa fa-calendar-alt me-1"></i> Gestionar y ver horarios reservados
//                                     </Link>

//                                     <button onClick={() => eliminar(c.id)} className="btn btn-sm btn-outline-danger w-100">
//                                         <i className="fa fa-trash me-1"></i> Eliminar Cancha
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )) : (
//                     <div className="col-12 text-center text-muted py-4">No hay canchas registradas aún.</div>
//                 )}
//             </div>
//         </div>
//     );
// };
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export const AddCancha = () => {
    const { complejoId } = useParams();
    const [categorias, setCategorias] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [complejo, setComplejo] = useState(null); // Estado para el nombre del complejo
    const [loading, setLoading] = useState(false);

    const [datos, setDatos] = useState({
        nombre: "",
        catId: "",
        precio: "",
        image: null
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarDatos = async () => {
        try {
            // 1. Cargar Categorías
            const resCat = await fetch(`${backendUrl}/api/categorias`);
            if (resCat.ok) setCategorias(await resCat.json());

            // 2. Cargar Canchas de este complejo
            const resCan = await fetch(`${backendUrl}/api/canchas?complejo_id=${complejoId}`);
            if (resCan.ok) setCanchas(await resCan.json());

            // 3. Cargar Info del Complejo (para el título y tarjetas)
            const resComp = await fetch(`${backendUrl}/api/complejo/${complejoId}`);
            if (resComp.ok) {
                const data = await resComp.json();
                setComplejo(data);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [complejoId]);

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
                body: formData
            });

            if (resp.ok) {
                alert("¡Cancha añadida!");
                setDatos({ nombre: "", catId: "", precio: "", image: null });
                e.target.reset(); 
                cargarDatos();
            } else {
                const error = await resp.json();
                alert("Error: " + (error.error || error.msg));
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminar = async (idCancha) => {
        if (!window.confirm("¿Seguro que quieres borrar esta cancha?")) return;
        try {
            const resp = await fetch(`${backendUrl}/api/cancha/${idCancha}`, { method: "DELETE" });
            if (resp.ok) cargarDatos();
        } catch (error) {
            console.error("Error al eliminar:", error);
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
            <div className="card p-4 shadow-sm mb-5 bg-white border-0">
                <h5 className="mb-3 border-bottom pb-2">Añadir Nueva Cancha a <span className="text-success">{complejo?.nombre || "..."}</span></h5>
                <form onSubmit={guardar} className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Nombre / Número</label>
                        <input className="form-control" value={datos.nombre} placeholder="Ej: Cancha 1" required
                            onChange={e => setDatos({ ...datos, nombre: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Deporte</label>
                        <select className="form-select" value={datos.catId} required
                            onChange={e => setDatos({ ...datos, catId: e.target.value })}>
                            <option value="">Selecciona...</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Precio / Hora</label>
                        <input type="number" className="form-control" value={datos.precio} placeholder="0.00" required
                            onChange={e => setDatos({ ...datos, precio: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Foto</label>
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

            {/* Listado con Nombre del Complejo */}
            <h4 className="mb-3">Canchas disponibles en: <span className="text-success">{complejo?.nombre || "Cargando..."}</span></h4>
            
            <div className="row">
                {canchas.length > 0 ? canchas.map(c => (
                    <div key={c.id} className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100 border-0 overflow-hidden">
                            <img src={c.foto_url || "https://placehold.co"} 
                                 className="card-img-top" style={{ height: "160px", objectFit: "cover" }} />
                            <div className="card-body d-flex flex-column">
                                <div className="mb-2">
                                    {/* Muestra Nombre Cancha + Nombre Complejo */}
                                    <h5 className="card-title fw-bold text-dark mb-0">{c.nombre}</h5>
                                    <small className="text-muted">
                                        <i className="fa fa-building me-1"></i> {complejo?.nombre}
                                    </small>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="badge bg-info text-dark">{c.categoria_nombre}</span>
                                    <p className="card-text text-success fs-5 fw-bold mb-0">
                                        ${c.precio_hora} <small className="text-muted fw-normal">/ h</small>
                                    </p>
                                </div>
                                
                                <div className="mt-auto d-flex flex-column gap-2">
                                    <Link to={`/gestion-horarios/${c.id}`} className="btn btn-sm btn-primary w-100 shadow-sm">
                                        <i className="fa fa-calendar-alt me-1"></i> Gestionar y ver horarios
                                    </Link>

                                    <button onClick={() => eliminar(c.id)} className="btn btn-sm btn-outline-danger w-100">
                                        <i className="fa fa-trash me-1"></i> Eliminar Cancha
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-12 text-center text-muted py-4">No hay canchas registradas en este complejo.</div>
                )}
            </div>
        </div>
    );
};
