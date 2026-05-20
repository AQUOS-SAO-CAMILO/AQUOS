import { useNavigate } from "react-router-dom";

// 1. Importando o mesmo arquivo do Menu Adm
import styles from "../styles/Menu.module.css";

// tela d menu p/ o atleta
export default function MenuAtleta() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* ícone do user no topo */}
        <svg 
          className={styles.userIconSvg} 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </header>

      {/* Mesma coisa do MenuAdm: removi a classe da tag main pois não tinha estilo atrelado a ela */}
      <main>
        <h1 className={styles.welcomeText}>Olá, Guilherme!</h1>

        {/* opções rápidas do atleta */}
        <div className={styles.grid}>
          <button className={styles.card}>
            <span>API Clima</span>
          </button>

          <button className={styles.card}>
            <span>última sessão</span>
          </button>
        </div>

        {/* 2. Juntando a classe base com a classe que ajusta o espaçamento para múltiplos botões */}
        <div className={`${styles.footerActions} ${styles.footerActionsMultiBtn}`}>
          
          {/* Removi a classe "primary-action" pois não havia estilo declarado para ela no seu arquivo original. O styles.reportsBtn já deixa o botão vermelho no padrão correto! */}
          <button className={styles.reportsBtn}>
            <svg 
              className={styles.reportIconSvg} 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Nova sessão
          </button>
          
          <button className={styles.reportsBtn}>
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
