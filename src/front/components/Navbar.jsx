import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const [categorias, setCategorias] = useState([]);
	const navigate = useNavigate();

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
					<Link className="nav-link text-white" to="/">Actividades</Link>
					<Link className="nav-link text-white" to="/reservas">Reservas</Link>
					<Link className="nav-link text-white" to="/">Eventos</Link>
					<Link className="nav-link text-white" to="/registro">Registro</Link>
					<Link className="nav-link text-white" to="/add-complejo">

						<i className="fa fa-plus me-1"></i> Añadir Complejo
					</Link>
					<div className="dropdown">
						<button
							className="btn nav-link text-white dropdown-toggle"
							data-bs-toggle="dropdown"
						>
							Categorías
						</button>
						<ul className="dropdown-menu dropdown-menu-end">
							{categorias.length === 0 ? (
								<li><span className="dropdown-item text-muted">Cargando...</span></li>
							) : (
								categorias.map((cat, i) => (
									<li key={i}>
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

					<button
						className="btn"
						style={{ background: "#C8F135", color: "#111", fontWeight: 600, padding: "8px 20px", borderRadius: "8px" }}
						onClick={() => navigate("/reservas")}
					>
						RESERVAR CANCHA
					</button>
				</div>
			</div>
		</nav>
	);
};