

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CATEGORIA_IMGS = {
  "Futbol Sala": "https://unsplash.com",
  "Futbol Campo": "https://unsplash.com",
  "Padel": "https://unsplash.com",
  "Basketball": "https://unsplash.com",
  "Volleyball": "https://unsplash.com",
  "Salon de eventos": "https://unsplash.com",
};

const CAT_ICONS = ["⚽", "🏟️", "🎾", "🏀", "🏐", "🎉"];

const BENEFICIOS = [
  { title: "Reserva fácil y rápida", desc: "Reserva tu cancha en solo unos pasos.", icon: "M8 2a6 6 0 100 12A6 6 0 008 2zM1 8a7 7 0 1114 0A7 7 0 011 8zm7-4a1 1 0 011 1v3.586l2.207 2.207a1 1 0 01-1.414 1.414l-2.5-2.5A1 1 0 016 9V5a1 1 0 011-1z" },
  { title: "Instalaciones seguras", desc: "Espacios modernos y seguros para tu tranquilidad.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { title: "Atención 24/7", desc: "Estamos disponibles para ayudarte siempre.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Comunidad deportiva", desc: "Únete a nuestra comunidad y disfruta más.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
];

const Landing = () => {
  const [complejos, setComplejos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [indice, setIndice] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);
  const [complejosLista, setComplejosLista] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoria = searchParams.get("categoria");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Estado para imágenes dinámicas del Hero (usando tus fotos locales)
  const [heroImages, setHeroImages] = useState([
    "https://unsplash.com"
  ]);

  useEffect(() => {
    const url = categoria
      ? `${BACKEND_URL}/api/complejos?categoria=${categoria}`
      : `${BACKEND_URL}/api/complejos`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setComplejos(data);
        setIndice(0);

        // Filtrar complejos por categoría si existe
        if (categoria) {
          fetch(`${BACKEND_URL}/api/canchas?categoria=${categoria}`)
            .then(r => r.json())
            .then(canchas => {
              const complejosIds = new Set(canchas.map(c => c.complejo_id));
              const complejosConCanchas = data.filter(c => complejosIds.has(c.id));
              setComplejosLista(complejosConCanchas);
            });
        } else {
          setComplejosLista(data);
        }

        if (data.length > 0) {
          const fotosDB = data
            .filter(c => c.imagen_url)
            .map(c => c.imagen_url.startsWith('http')
              ? c.imagen_url
              : `${BACKEND_URL}/uploads/${c.imagen_url}`
            );

          if (fotosDB.length > 0) setHeroImages(fotosDB);
        }
      });

    fetch(`${BACKEND_URL}/api/categorias`).then(r => r.json()).then(setCategorias);
  }, [categoria, BACKEND_URL]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx(i => (i === heroImages.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  const anterior = () => setIndice(i => (i === 0 ? complejosLista.length - 1 : i - 1));
  const siguiente = () => setIndice(i => (i === complejosLista.length - 1 ? 0 : i + 1));
  const visibles = complejosLista.slice(indice, indice + 3);

  // Función para obtener imagen de complejo o fallback
  const getImg = (url, i) => url
    ? (url.startsWith('http') ? url : `${BACKEND_URL}/uploads/${url}`)
    : `https://picsum.photos/seed/${i}comp/600/400`;

  return (
    <div>
      {/* HERO SECCIÓN */}
      <div style={{
        backgroundImage: `url(${heroImages[heroIdx]})`,
        backgroundSize: "cover", backgroundPosition: "center",
        minHeight: "520px", display: "flex", alignItems: "center", position: "relative",
        transition: "background-image 0.8s ease-in-out"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />

        <button onClick={() => setHeroIdx(i => (i === 0 ? heroImages.length - 1 : i - 1))}
          style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", cursor: "pointer" }}>‹</button>
        <button onClick={() => setHeroIdx(i => (i === heroImages.length - 1 ? 0 : i + 1))}
          style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", cursor: "pointer" }}>›</button>

        <div className="container" style={{ position: "relative", zIndex: 1, color: "#fff" }}>
          <p style={{ color: "#C8F135", fontWeight: 500, letterSpacing: "0.1em", marginBottom: "8px" }}>BIENVENIDOS</p>
          <h1 style={{ fontSize: "3rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "16px" }}>
            Tu próximo partido<br />
            <span style={{ color: "#C8F135" }}>empieza aquí</span>
          </h1>
          <p style={{ maxWidth: "400px", marginBottom: "28px", opacity: 0.85 }}>
            Disfruta de nuestras modernas instalaciones para pádel, tenis, fútbol y más.
          </p>
          <button className="btn" style={{ background: "#C8F135", color: "#111", fontWeight: 600, padding: "12px 24px", borderRadius: "8px" }}
            onClick={() => navigate("/todos-complejos")}>VER COMPLEJOS →</button>
        </div>

        <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 1 }}>
          {heroImages.map((_, i) => (
            <div key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? "24px" : "8px", height: "8px", borderRadius: "4px", cursor: "pointer", background: i === heroIdx ? "#C8F135" : "rgba(255,255,255,0.5)" }} />
          ))}
        </div>
      </div>

      {/* SECCIÓN COMPLEJOS */}
      <div style={{ background: "#f8f9fa" }} className="py-5">
        <div className="container">
          <p style={{ color: "#7cba00", fontWeight: 500, letterSpacing: ".1em", fontSize: "13px" }}>INSTALACIONES DESTACADAS</p>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h2 style={{ fontWeight: 700, fontSize: "2rem" }}>{categoria || "Nuestros Complejos"}</h2>
            <button className="btn btn-link" style={{ color: "#7cba00", fontWeight: 600, textDecoration: "none" }} onClick={() => navigate("/todos-complejos")}>Ver todos →</button>
          </div>

          <div style={{ position: "relative" }}>
            <button onClick={anterior} style={{ position: "absolute", left: "-20px", top: "40%", zIndex: 2, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}>‹</button>
            <div className="row g-3">
              {visibles.map((complejo, idx) => (
                <div className="col-4" key={complejo.id}>
                  <div className="card border-0 shadow-sm h-100" style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden" }} onClick={() => navigate(`/complejos/${complejo.id}`)}>
                    <img src={getImg(complejo.imagen_url, idx)} style={{ width: "100%", height: "200px", objectFit: "cover" }} alt={complejo.nombre} />
                    <div className="p-3">
                      <h6 className="fw-bold mb-1">{complejo.nombre}</h6>
                      <p className="text-muted small">📍 {complejo.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={siguiente} style={{ position: "absolute", right: "-20px", top: "40%", zIndex: 2, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}>›</button>
          </div>
        </div>
      </div>



      {/* BENEFICIOS */}
      <div style={{ background: "#0d1b2a" }} className="py-5">
        <div className="container">
          <div className="row g-4 text-center">
            {BENEFICIOS.map((b, i) => (
              <div className="col-3" key={i}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#1a3a1a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="22" height="22" fill="none" stroke="#C8F135" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                  </svg>
                </div>
                <h6 style={{ fontWeight: 700, color: "#fff" }}>{b.title}</h6>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BANNER FINAL DINÁMICO */}
      <div style={{
        backgroundImage: `url(${heroImages[0]})`, // Usa la primera foto de tus complejos
        backgroundSize: "cover", backgroundPosition: "center", position: "relative"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(30,100,30,0.85)" }} />
        <div className="container py-5 d-flex justify-content-between align-items-center" style={{ position: "relative", zIndex: 1, color: "#fff" }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "2rem" }}>¿Listo para jugar?</h2>
            <p style={{ opacity: 0.85, margin: 0 }}>Reserva tu cancha y vive la experiencia.</p>
          </div>
          <button className="btn" style={{ background: "#0d1b2a", color: "#fff", fontWeight: 600, padding: "14px 32px", borderRadius: "8px" }}
            onClick={() => navigate("/todos-complejos")}>RESERVAR AHORA →</button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
