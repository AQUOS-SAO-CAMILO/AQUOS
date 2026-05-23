import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../styles/Menu.module.css"; 

// tela p/ gerenciar o sistema (adm)
export default function MenuAdm() {
  const navigate = useNavigate();

  // 1. Estados para armazenar os dados dinâmicos
  const [nomeUsuario, setNomeUsuario] = useState("Administrador");
  
  // Estado do Clima
  const [clima, setClima] = useState<{ temp: string; desc: string } | null>(null);
  
  // Estado para os Atletas em Risco (vamos guardar a quantidade)
  const [atletasEmRisco, setAtletasEmRisco] = useState<number | null>(null);

  // 2. useEffect para buscar os dados assim que o menu do adm abrir
  useEffect(() => {
    // --- BUSCA O NOME DO ADM ---
    const nomeSalvo = localStorage.getItem("nomeUsuario");
    if (nomeSalvo) setNomeUsuario(nomeSalvo);

    // --- BUSCA O CLIMA (GET) ---
    async function fetchClima() {
      try {
        const response = await fetch("https://sua-api.com/clima"); 
        const data = await response.json();
        setClima({ temp: `${data.temperatura}°C`, desc: data.condicao });
      } catch (error) {
        console.error("Erro ao buscar clima:", error);
        setClima({ temp: "--", desc: "Indisponível" });
      }
    }

    // --- BUSCA ATLETAS EM RISCO (GET) ---
    async function fetchAtletasRisco() {
      try {
        // Substitua pela rota do seu backend que conta os alertas ativos
        const response = await fetch("https://seu-backend.com/api/alertas/atletas-risco");
        const data = await response.json();
        
        // Supondo que a API retorne { quantidade: 3 }
        setAtletasEmRisco(data.quantidade);
      } catch (error) {
        console.error("Erro ao buscar atletas em risco:", error);
        // Em caso de erro, podemos deixar um valor de fallback como 0 ou null
        setAtletasEmRisco(0); 
      }
    }

    fetchClima();
    fetchAtletasRisco();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* ícone do user no topo */}
        <svg 
          className={styles.userIconSvg} 
          viewBox="0 0 24 24" 
          fill="currentColor"
          onClick={() => navigate("/dados-adm")}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </header>

      <main>
        {/* 3. Nome Dinâmico */}
        <h1 className={styles.welcomeText}>Olá, {nomeUsuario}!</h1>

        {/* cards principais do menu */}
        <div className={styles.grid}>
          
          {/* Card API Clima Dinâmico */}
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

          {/* Card Atletas em Risco Dinâmico */}
          <button 
            className={styles.card} 
            style={{ flexDirection: 'column', gap: '8px' }}
            onClick={() => navigate("/atletas-risco")} // Exemplo de navegação p/ lista
          >
            <span>Atletas em risco</span>
            {atletasEmRisco !== null ? (
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                // Se houver atletas em risco, fica vermelho, senão fica verde/preto
                color: atletasEmRisco > 0 ? '#b71c1c' : '#2e7d32' 
              }}>
                {atletasEmRisco > 0 ? `${atletasEmRisco} detectados` : 'Nenhum atleta'}
              </div>
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>Verificando...</div>
            )}
          </button>
          
        </div>

        {/* btn p/ ver relatórios no rodapé */}
        <div className={styles.footerActions}>
          <button className={styles.reportsBtn} onClick={() => navigate("/filtro-relatorio")}>
            <svg 
              className={styles.reportIconSvg} 
              viewBox="0 0 24 24" 
              fill="currentColor"
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