import { useNavigate } from "react-router-dom";
import styles from "../styles/Menu.module.css";
import { useState, useEffect } from "react";

export default function MenuAtleta() {
  const navigate = useNavigate();

  const [nomeUsuario, setNomeUsuario] = useState("Atleta");
  const [clima, setClima] = useState<{ temp: string; desc: string } | null>(null);
  const [ultimaSessao, setUltimaSessao] = useState<{ data: string; resultado: string } | null>(null);

  const getAtletaIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload).User_id;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const atletaId = getAtletaIdFromToken();
    const nomeSalvo = localStorage.getItem("nomeUsuario");
    if (nomeSalvo) setNomeUsuario(nomeSalvo);

    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5001";
    const headers = { "Authorization": `Bearer ${token}` };

    async function fetchClima() {
      try {
        const response = await fetch(`${apiUrl}/clima`, { headers }); 
        if (!response.ok) throw new Error("Erro na resposta do clima");
        
        const data = await response.json();
        setClima({ temp: `${data.weather.temperature}°C`, desc: data.weather.description});
      } catch (error) {
        console.error("Erro ao buscar clima:", error);
        setClima({ temp: "--", desc: "Clima offline" });
      }
    }

    async function fetchUltimaSessao() {
      if (!atletaId) return;
      
      try {
        const response = await fetch(`${apiUrl}/api/sessoes/ultima/${atletaId}`, { headers });
        if (!response.ok) throw new Error("Erro na resposta da última sessão");
        
        const data = await response.json();
        setUltimaSessao({ 
          data: data.data || "--/--", 
          resultado: data.balancoHidrico ? `${data.balancoHidrico} ml` : "Sem cálculo" 
        });
      } catch (error) {
        console.error("Erro ao buscar última sessão:", error);
        setUltimaSessao({ data: "Inicie um treino!", resultado: "" });
      }
    }

    fetchClima();
    fetchUltimaSessao();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <svg 
          className={styles.userIconSvg} 
          viewBox="0 0 24 24" 
          fill="currentColor"
          onClick={() => navigate("/dados-atleta")}
          style={{ cursor: "pointer" }}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </header>

      <main>
        <h1 className={styles.welcomeText}>Olá, {nomeUsuario}!</h1>

        <div className={styles.grid}>
          
          <button className={styles.card} style={{ flexDirection: 'column', gap: '8px', cursor: 'default' }}>
            <span>API Clima</span>
            {clima ? (
              <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                {clima.temp} - {clima.desc}
              </div>
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>Carregando...</div>
            )}
          </button>

          {/* Card navegável: clicar na última sessão pode levar ao relatório pessoal */}
          <button 
            className={styles.card} 
            style={{ flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
            onClick={() => navigate("/relatorio-atleta")}
          >
            <span>Última Sessão</span>
            {ultimaSessao ? (
              <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                {ultimaSessao.data} <br/> 
                <span style={{ 
                  fontSize: '1rem', 
                  color: ultimaSessao.resultado.includes('-') ? '#b71c1c' : '#2e7d32' 
                }}>
                  {ultimaSessao.resultado}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>Carregando...</div>
            )}
          </button>
          
        </div>

        <div className={`${styles.footerActions} ${styles.footerActionsMultiBtn}`}>
          <button className={styles.reportsBtn} onClick={() => navigate("/pre-sessao")}>
            {/* Ícone de Nova Sessão (Plus/Adicionar) */}
            <svg className={styles.reportIconSvg} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Nova sessão
          </button>

          <button className={styles.reportsBtn} onClick={() => navigate("/relatorio-atleta")}>
            <svg className={styles.reportIconSvg} viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Relatórios
          </button>
        </div>
      </main>
    </div>
  );
}