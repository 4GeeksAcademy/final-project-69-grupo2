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
		<nav className="navbar navbar-light bg-light">
			<div className="container">

				<Link to="/">
					<span className="navbar-brand mb-0 h1">Reservas de Canchas</span>
				</Link>

				<div className="d-flex align-items-center gap-3 ms-auto">
					<Link className="nav-link" to="/">Inicio</Link>
					<Link className="nav-link" to="/registro">Registro</Link>

					<div className="dropdown">
						<button
							className="btn btn-outline-secondary dropdown-toggle"
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
				</div>

			</div>
		</nav>
	);
};
