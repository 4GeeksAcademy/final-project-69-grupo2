import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export const AddCancha = () => {
    const { complejoId } = useParams();
    const [nombre, setNombre] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [catId, setCatId] = useState("");
    const [canchas, setCanchas] = useState([]);
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarDatos = async () => {
        try {
            const resCat = await fetch(`${backendUrl}/api/categorias`);
            if (resCat.ok) setCategorias(await resCat.json());

            const resCan = await fetch(`${backendUrl}/api/canchas?complejo_id=${complejoId}`);
            if (resCan.ok) setCanchas(await resCan.json());
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [complejoId]);

    const guardar = async (e) => {
        e.preventDefault();
        const resp = await fetch(`${backendUrl}/api/cancha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                nombre: nombre, 
                complejo_id: complejoId, 
                categoria_id: catId 
            })
        });
        if (resp.ok) { 
            setNombre(""); 
            setCatId("");
            cargarDatos(); 
        }
    };

    const eliminar = async (idCancha) => {
        if (window.confirm("¿Seguro que quieres borrar esta cancha?")) {
            const resp = await fetch(`${backendUrl}/api/cancha/${idCancha}`, { method: "DELETE" });
            if (resp.ok) cargarDatos();
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="fa fa-futbol text-success me-2"></i>Gestionar Canchas</h2>
                <Link to="/add-complejo" className="btn btn-outline-secondary">Volver</Link>
            </div>

            <div className="card p-4 shadow-sm mb-5 bg-light">
                <form onSubmit={guardar} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Nombre de la Cancha</label>
                        <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Cancha 1" required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Deporte</label>
                        <select className="form-select" value={catId} onChange={e => setCatId(e.target.value)} required>
                            <option value="">Selecciona...</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                        <button className="btn btn-success w-100">Añadir</button>
                    </div>
                </form>
            </div>

            <h4>Lista de Canchas</h4>
            <div className="list-group shadow-sm mt-3">
                {canchas.map(c => (
                    <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center p-3">
                        <div>
                            <span className="h5 mb-0">{c.nombre}</span>
                            <span className="badge bg-info text-dark ms-3">{c.categoria_nombre}</span>
                        </div>
                        <button onClick={() => eliminar(c.id)} className="btn btn-outline-danger btn-sm">
                            <i className="fa fa-trash-alt"></i> Borrar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};