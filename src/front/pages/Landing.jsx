import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CATEGORIA_IMGS = {
  "Futbol Sala": "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80",
  "Futbol Campo": "https://picsum.photos/seed/futbolcampo/600/300",
  "Padel": "https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?w=600&q=80",
  "Basketball": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
  "Volleyball": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80",
  "Salon de eventos": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
};

const CAT_ICONS = ["⚽", "🏟️", "🎾", "🏀", "🏐", "🎉"];

const COMPLEJO_IMGS = [
  "https://picsum.photos/seed/cancha1/600/400",
  "https://picsum.photos/seed/cancha2/600/400",
  "https://picsum.photos/seed/cancha3/600/400",
];

const HERO_IMGS = [
  "https://picsum.photos/seed/hero1/1400/600",
  "https://picsum.photos/seed/hero2/1400/600",
  "https://picsum.photos/seed/hero3/1400/600",
];

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoria = searchParams.get("categoria");

  useEffect(() => {
    const url = categoria
      ? import.meta.env.VITE_BACKEND_URL + `/api/complejos?categoria=${categoria}`
      : import.meta.env.VITE_BACKEND_URL + "/api/complejos";
    fetch(url).then(r => r.json()).then(data => { setComplejos(data); setIndice(0); });
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/categorias").then(r => r.json()).then(setCategorias);
  }, [categoria]);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i === HERO_IMGS.length - 1 ? 0 : i + 1)), 4000);
    return () => clearInterval(timer);
  }, []);

  const anterior = () => setIndice(i => (i === 0 ? complejos.length - 1 : i - 1));
  const siguiente = () => setIndice(i => (i === complejos.length - 1 ? 0 : i + 1));
  const visibles = complejos.slice(indice, indice + 3);

  return (
    <div>
      {/* HERO */}
      <div style={{
        backgroundImage: `url(${HERO_IMGS[heroIdx]})`,
        backgroundSize: "cover", backgroundPosition: "center",
        minHeight: "520px", display: "flex", alignItems: "center", position: "relative"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />

        {/* Flechas hero */}
        <button onClick={() => setHeroIdx(i => (i === 0 ? HERO_IMGS.length - 1 : i - 1))}
          style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "20px", cursor: "pointer" }}>‹</button>
        <button onClick={() => setHeroIdx(i => (i === HERO_IMGS.length - 1 ? 0 : i + 1))}
          style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "20px", cursor: "pointer" }}>›</button>

        <div className="container" style={{ position: "relative", zIndex: 1, color: "#fff" }}>
          <p style={{ color: "#C8F135", fontWeight: 500, letterSpacing: "0.1em", marginBottom: "8px" }}>BIENVENIDOS</p>
          <h1 style={{ fontSize: "3rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "16px" }}>
            Tu próximo partido<br />
            <span style={{ color: "#C8F135" }}>empieza aquí</span>
          </h1>
          <p style={{ maxWidth: "400px", marginBottom: "28px", opacity: 0.85 }}>
            Disfruta de nuestras modernas instalaciones para pádel, tenis, fútbol y más.
          </p>
          <div className="d-flex gap-3">
            <button className="btn" style={{ background: "#C8F135", color: "#111", fontWeight: 600, padding: "12px 24px", borderRadius: "8px" }}
              onClick={() => navigate("/")}>VER COMPLEJOS →</button>
            <button className="btn btn-outline-light" style={{ padding: "12px 24px", borderRadius: "8px" }}>NUESTRAS ACTIVIDADES</button>
          </div>
        </div>

        {/* Puntitos */}
        <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 1 }}>
          {HERO_IMGS.map((_, i) => (
            <div key={i} onClick={() => setHeroIdx(i)} style={{
              width: i === heroIdx ? "24px" : "8px", height: "8px",
              borderRadius: "4px", cursor: "pointer", transition: "all 0.3s ease",
              background: i === heroIdx ? "#C8F135" : "rgba(255,255,255,0.5)"
            }} />
          ))}
        </div>
      </div>

      {/* COMPLEJOS */}
      <div style={{ background: "#f8f9fa" }} className="py-5">
        <div className="container">
          <p style={{ color: "#7cba00", fontWeight: 500, letterSpacing: ".1em", fontSize: "13px" }}>INSTALACIONES DESTACADAS</p>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h2 style={{ fontWeight: 700, fontSize: "2rem" }}>{categoria || "Nuestros Complejos"}</h2>
            <button className="btn btn-link" style={{ color: "#7cba00", fontWeight: 600, textDecoration: "none" }} onClick={() => navigate("/todos-complejos")}>Ver todos los complejos →</button>
          </div>
          <p className="text-muted mb-4">Descubre los mejores espacios deportivos en diferentes localidades.</p>

          <div style={{ position: "relative" }}>
            <button onClick={anterior} style={{ position: "absolute", left: "-20px", top: "40%", transform: "translateY(-50%)", zIndex: 2, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "40px", height: "40px", fontSize: "18px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>‹</button>
            <div className="row g-3">
              {visibles.map((complejo, idx) => (
                <div className="col-4" key={complejo.id}>
                  <div className="card border-0 shadow-sm h-100"
                    style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden", transition: "transform 0.2s ease" }}
                    onClick={() => navigate(`/complejos/${complejo.id}?categoria=${complejo.categoria}`)}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ position: "relative" }}>
                      <img src={complejo.imagen_url || COMPLEJO_IMGS[idx % COMPLEJO_IMGS.length]}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }} alt={complejo.nombre} />
                      <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "32px", height: "32px", borderRadius: "50%", background: "#7cba00", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "14px" }}>🎾</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h5 style={{ fontWeight: 700, marginBottom: "4px" }}>{complejo.nombre}</h5>
                      <p className="text-muted small mb-2">
                        📍 {complejo.city || complejo.address || "Ubicación no disponible"}
                      </p>
                      {complejo.phone && (
                        <p className="text-muted small mb-2">
                          📞 {complejo.phone}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {complejo.google_map && (
                          <a href={complejo.google_map} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#7cba00", fontWeight: 600, fontSize: "12px", textDecoration: "none" }}>
                            🗺️ Google Maps
                          </a>
                        )}
                        <p style={{ color: "#7cba00", fontWeight: 600, fontSize: "13px", margin: 0 }}>Ver más →</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={siguiente} style={{ position: "absolute", right: "-20px", top: "40%", transform: "translateY(-50%)", zIndex: 2, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "40px", height: "40px", fontSize: "18px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>›</button>
          </div>

          {/* Puntitos complejos */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
            {Array.from({ length: Math.ceil(complejos.length / 3) }).map((_, i) => (
              <div key={i} onClick={() => setIndice(i * 3)} style={{
                width: i === Math.floor(indice / 3) ? "24px" : "8px", height: "8px",
                borderRadius: "4px", cursor: "pointer", transition: "all 0.3s ease",
                background: i === Math.floor(indice / 3) ? "#7cba00" : "#ccc"
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORÍAS */}
      <div style={{ background: "#f8f9fa" }} className="pb-5">
        <div className="container text-center">
          <p style={{ color: "#7cba00", fontWeight: 500, letterSpacing: ".1em", fontSize: "13px" }}>EXPLORA POR DEPORTE</p>
          <h2 style={{ fontWeight: 700, marginBottom: "8px", fontSize: "2.5rem" }}>Categorías</h2>
          <p style={{ color: "#666", marginBottom: "28px" }}>Encuentra tu deporte favorito y reserva en segundos.</p>
          <div className="row g-3">
            {categorias.map((cat, i) => (
              <div className="col-4" key={i}>
                <div onClick={() => navigate(`/?categoria=${cat.nombre}`)}
                  style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden", position: "relative", height: "170px", transition: "transform 0.2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  <img src={CATEGORIA_IMGS[cat.nombre] || `https://picsum.photos/seed/${i}cat/600/300`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={cat.nombre} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)" }} />
                  <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#7cba00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                      {CAT_ICONS[i] || "⚽"}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: "15px" }}>{cat.nombre}</p>
                      <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "12px" }}>complejos disponibles</p>
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: "14px", right: "14px", width: "30px", height: "30px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BENEFICIOS */}
      <div style={{ background: "#0d1b2a" }} className="py-4">
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

      {/* BANNER FINAL */}
      <div style={{ backgroundImage: `url(https://picsum.photos/seed/banner/1400/300)`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(30,100,30,0.88)" }} />
        <div className="container py-5 d-flex justify-content-between align-items-center" style={{ position: "relative", zIndex: 1, color: "#fff" }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: "8px" }}>¿Listo para jugar?</h2>
            <p style={{ opacity: 0.85, margin: 0 }}>Reserva tu cancha y vive la experiencia.</p>
          </div>
          <button className="btn" style={{ background: "#0d1b2a", color: "#fff", fontWeight: 600, padding: "14px 32px", borderRadius: "8px", whiteSpace: "nowrap" }}
            onClick={() => navigate("/reservas")}>RESERVAR AHORA →</button>
        </div>
      </div>
    </div>
  );
};

export default Landing;