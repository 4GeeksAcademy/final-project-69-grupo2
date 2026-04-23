import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// 1. Cambiamos el import del context por tu nuevo hook
import useGlobalReducer from "../hooks/useGlobalReducer"; 

export const AddContactComplejo = () => {
    // 2. Extraemos store y dispatch
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { id } = useParams();

    const [contact, setContact] = useState({
        name: "", email: "", phone: "", address: "", country: "", city: "", google_map: ""
    });

    const baseUrl = "https://4geeks.com";

    useEffect(() => {
        if (id && store.listContacts.length > 0) {
            const contactToEdit = store.listContacts.find(c => c.id == id);
            if (contactToEdit) setContact(contactToEdit);
        }
    }, [id, store.listContacts]);

    // 3. Manejo del envío de datos con fetch directo
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const method = id ? "PUT" : "POST";
        const url = id ? `${baseUrl}/${id}` : baseUrl;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact),
            });

            if (response.ok) {
                // 4. Después de guardar, pedimos que se recarguen los contactos en el Home
                // o podrías hacer un dispatch aquí mismo para actualizar el store
                navigate("/");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">{id ? "Modificar datos del complejo" : "Ingrese datos del complejo"}</h1>
            <form onSubmit={handleSubmit} className="col-md-8 mx-auto shadow p-4 mt-3 bg-light rounded">
                <div className="mb-3">
                    <label className="form-label fw-bold">Nombre Del Complejo</label>
                    <input className="form-control" placeholder="Full Name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input className="form-control" type="email" placeholder="Enter email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Teléfono</label>
                    <input className="form-control" placeholder="Enter phone" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Dirección</label>
                    <input className="form-control" placeholder="Enter address" value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Enlace de Google Maps</label>
                    <input className="form-control" placeholder="Pegue el link aquí" value={contact.google_map} onChange={e => setContact({ ...contact, google_map: e.target.value })} />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">País</label>
                    <input className="form-control" placeholder="Enter country" value={contact.country} onChange={e => setContact({ ...contact, country: e.target.value })} required />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Ciudad</label>
                    <input className="form-control" placeholder="Enter city" value={contact.city} onChange={e => setContact({ ...contact, city: e.target.value })} required />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2">Guardar</button>
                <Link to="/" className="d-block mt-3 text-center text-muted">Volver a la lista</Link>
            </form>
        </div>
    );
};