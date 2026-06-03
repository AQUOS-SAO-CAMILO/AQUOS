import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../styles/Menu.module.css"; 

export default function MenuAdm() {
  const navigate = useNavigate();

  const [nomeUsuario, setNomeUsuario] = useState("Administrador");
  const [clima, setClima] = useState<{ temp: string; desc: string } | null>(null);
  const [atletasEmRisco, setAtletasEmRisco] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const nomeSalvo = localStorage.getItem("nomeUsuario");
    if (nomeSalvo) setNomeUsuario(nomeSalvo);

    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5001";
    const headers = { "Authorization": `Bearer ${token}` };

    async function fetchClima() {
      try {
        
        const response = await fetch(`${apiUrl}/clima`, { headers });
        
        if (!response.ok) throw new Error("Erro na resposta do clima");
        
        const data = await response.json();
        setClima({ temp: `${data.weather.temperature}°C`, desc: `${data.weather.description}`});
      } catch (error) {
        console.error("Erro ao buscar clima:", error);
        setClima({ temp: "--", desc: "Clima offline" }); 
      }
    }

    async function fetchAtletasRisco() {
      try {
        const response = await fetch(`${apiUrl}/alertas/atletas-risco`, { headers });
        
        if (!response.ok) throw new Error("Erro na resposta dos alertas");
        
        const data = await response.json();
        setAtletasEmRisco(data.quantidade);
      } catch (error) {
        console.error("Erro ao buscar atletas em risco:", error);
        setAtletasEmRisco(0); 
      }
    }

    fetchClima();
    fetchAtletasRisco();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <svg 
          className={styles.userIconSvg} 
          viewBox="0 0 24 24" 
          fill="currentColor"
          onClick={() => navigate("/dados-adm")}
          style={{ cursor: "pointer" }}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </header>

      <main>
        <h1 className={styles.welcomeText}>Olá, {nomeUsuario}!</h1>

        <div className={styles.grid}>
          
          <button className={styles.card} style={{ flexDirection: 'column', gap: '8px' }}>
            <span>API Clima</span>
            {clima ? (
              <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                {clima.temp} - {clima.desc}
              </div>
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>Carregando...</div>
            )}
          </button>

          <button 
            className={styles.card} 
            style={{ flexDirection: 'column', gap: '8px', cursor: "pointer" }}
            onClick={() => navigate("/atletas-risco")} 
          >
            <span>Atletas em risco</span>
            {atletasEmRisco !== null ? (
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                color: atletasEmRisco > 0 ? '#b71c1c' : '#2e7d32' 
              }}>
                {atletasEmRisco > 0 ? `${atletasEmRisco} detectados` : 'Nenhum alerta'}
              </div>
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>Verificando...</div>
            )}
          </button>
          
        </div>

        <div className={styles.footerActions}>
          <button className={styles.reportsBtn} onClick={() => navigate("/filtro-relatorio")}>
            <svg 
              className={styles.reportIconSvg} 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ marginRight: '8px', width: '20px', height: '20px' }}
            >
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Relatórios
          </button>
        </div>
      </main>
    </div>
  );
}