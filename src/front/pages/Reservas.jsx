import { useNavigate } from "react-router-dom";

const Reservas = () => {
  const navigate = useNavigate();

  return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="text-center">
        <h1 style={{fontSize:"4rem"}}>🏟️</h1>
        <h2 style={{fontWeight:700,marginBottom:"12px"}}>Próximamente</h2>
        <p className="text-muted mb-4">El módulo de reservas está en desarrollo. ¡Vuelve pronto!</p>
        <button
          className="btn"
          style={{background:"#C8F135",color:"#111",fontWeight:600,padding:"10px 24px"}}
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Reservas;