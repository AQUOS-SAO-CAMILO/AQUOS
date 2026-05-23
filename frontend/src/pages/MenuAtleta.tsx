import { useNavigate } from "react-router-dom";
import styles from "../styles/Menu.module.css";
import { useState, useEffect } from "react";

export default function MenuAtleta() {
  const navigate = useNavigate();

  // 1. Estados para armazenar os dados dinâmicos
  const [nomeUsuario, setNomeUsuario] = useState("Atleta");
  
  // Estado do Clima (exemplo guardando temperatura e descrição)
  const [clima, setClima] = useState<{ temp: string; desc: string } | null>(null);
  
  // Estado da Última Sessão (exemplo guardando a data e o balanço hídrico)
  const [ultimaSessao, setUltimaSessao] = useState<{ data: string; resultado: string } | null>(null);

  // 2. useEffect para buscar tudo assim que a tela abre
  useEffect(() => {
    // --- BUSCA O NOME DO USUÁRIO ---
    const nomeSalvo = localStorage.getItem("nomeUsuario");
    if (nomeSalvo) setNomeUsuario(nomeSalvo);

    // --- BUSCA O CLIMA (GET) ---
    async function fetchClima() {
      try {
        // Substitua pela URL real da sua API de Clima ou do seu Backend
        const response = await fetch("https://sua-api.com/clima"); 
        const data = await response.json();
        
        // Supondo que a API retorne algo como { temperatura: 28, condicao: "Ensolarado" }
        setClima({ temp: `${data.temperatura}°C`, desc: data.condicao });
      } catch (error) {
        console.error("Erro ao buscar clima:", error);
        setClima({ temp: "--", desc: "Indisponível" });
      }
    }

    // --- BUSCA A ÚLTIMA SESSÃO (GET) ---
    async function fetchUltimaSessao() {
      try {
        // Substitua pela rota do seu backend que retorna a última sessão do atleta
        const response = await fetch("https://seu-backend.com/api/sessoes/ultima");
        const data = await response.json();
        
        // Supondo que o backend retorne { data: "23/05/2026", balancoHidrico: "- 200ml" }
        setUltimaSessao({ data: data.data, resultado: data.balancoHidrico });
      } catch (error) {
        console.error("Erro ao buscar última sessão:", error);
        setUltimaSessao({ data: "--/--", resultado: "Sem dados" });
      }
    }

    // Executa as funções de busca
    fetchClima();
    fetchUltimaSessao();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <svg 
          className={styles.userIconSvg} 
          viewBox="0 0 24 24" 
          fill="currentColor"
          onClick={() => navigate("/dados-atleta")}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </header>

      <main>
        <h1 className={styles.welcomeText}>Olá, {nomeUsuario}!</h1>

        {/* 3. Cards atualizados para exibir os dados do GET */}
        <div className={styles.grid}>
          
          <button className={styles.card} style={{ flexDirection: 'column', gap: '8px' }}>
            <span>API Clima</span>
            {/* Renderização condicional: Mostra "Carregando..." enquanto o GET não termina */}
            {clima ? (
              <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                {clima.temp} - {clima.desc}
              </div>
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>Carregando...</div>
            )}
          </button>

          <button className={styles.card} style={{ flexDirection: 'column', gap: '8px' }}>
            <span>Última Sessão</span>
            {ultimaSessao ? (
              <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                {ultimaSessao.data} <br/> 
                <span style={{ fontSize: '1rem', color: '#b71c1c' }}>{ultimaSessao.resultado}</span>
              </div>
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>Carregando...</div>
            )}
          </button>
          
        </div>

        <div className={`${styles.footerActions} ${styles.footerActionsMultiBtn}`}>
          <button className={styles.reportsBtn} onClick={() => navigate("/pre-sessao")}>
            <svg className={styles.reportIconSvg} viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Nova sessão
          </button>

          <button className={styles.reportsBtn} onClick={() => navigate("/relatorios")}>
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