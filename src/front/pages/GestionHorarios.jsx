import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HorariosAdministrador } from "../components/HorariosAdministrador.jsx";

export const GestionHorarios = () => {
    const { canchaId } = useParams();
    const navigate = useNavigate();
    const [cancha, setCancha] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    useEffect(() => {
        const cargarCancha = async () => {
            try {
                const resp = await fetch(`${backendUrl}/api/cancha/${canchaId}`);
                if (resp.ok) setCancha(await resp.json());
            } catch (error) { console.error(error); }
        };
        cargarCancha();
    }, [canchaId]);

    if (!cancha) return <div className="container mt-5">Cargando...</div>;

    return (
        <div className="container mt-5">
            <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-dark mb-4">
                <i className="fa fa-arrow-left me-2"></i>Volver
            </button>
            <HorariosAdministrador 
                canchaId={cancha.id} 
                nombreCancha={cancha.nombre}
                horaApertura={cancha.hora_apertura}
                horaCierre={cancha.hora_cierre}
            />
        </div>
    );
};