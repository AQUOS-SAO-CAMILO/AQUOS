import { useNavigate } from "react-router-dom";

// 1. Importando o CSS correspondente ao Menu
import styles from "../styles/Menu.module.css"; 

// tela p/ gerenciar o sistema (adm)
export default function MenuAdm() {
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

      {/* Removi a className "menu-adm-content" da tag <main> pois não havia CSS para ela no seu arquivo original */}
      <main>
        <h1 className={styles.welcomeText}>Olá, Guilherme!</h1>

        {/* cards principais do menu */}
        <div className={styles.grid}>
          <button className={styles.card}>
            <span>API Clima</span>
          </button>

          <button className={styles.card}>
            <span>Atletas em risco</span>
          </button>
        </div>

        {/* btn p/ ver relatórios no rodapé */}
        <div className={styles.footerActions}>
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