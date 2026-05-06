export const Footer = () => (
	<footer className="footer mt-auto py-4 text-center" style={{ background: "#0d1b2a", color: "rgba(255,255,255,0.7)" }}>
		<p style={{ marginBottom: "8px", fontSize: "14px" }}>
			<strong style={{ color: "#C8F135" }}>COMPLEJO DEPORTIVO</strong>
		</p>
		<p style={{ marginBottom: "8px", fontSize: "12px" }}>
			Deporte, diversión y bienestar en un solo lugar.
		</p>
		<p style={{ marginBottom: "0", fontSize: "12px" }}>
			<a href="/terminos_condiciones.pdf" target="_blank" rel="noopener noreferrer"
				style={{ color: "#C8F135", textDecoration: "none", fontWeight: 500 }}>
				Términos y Condiciones
			</a>
			{" · "}
			<span style={{ color: "rgba(255,255,255,0.5)" }}>
				2026 Complejo Deportivo. Todos los derechos reservados.
			</span>
		</p>
	</footer>
);