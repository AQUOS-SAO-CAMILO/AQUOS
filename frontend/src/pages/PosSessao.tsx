import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Importando o CSS de Sessão
import styles from "../styles/Session.module.css";

// tela p/ finalizar a sessão e coletar dados pós-treino
export default function PosSessao() {
  const navigate = useNavigate();
  
  // estados p/ os inputs interativos
  const [massaCorporal, setMassaCorporal] = useState("");
  const [nivelSuor, setNivelSuor] = useState("Moderado");
  const [sintomas, setSintomas] = useState<string[]>([]);

  // gerencia seleção d sintomas (múltipla)
  const toggleSintoma = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter(s => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  const listaSintomas = [
    "Boca seca", "Fadiga", "Tontura", 
    "Dor de Cabeça", "Irritabilidade", "Cãibras", 
    "Dor abdominal", "Vômito", "Diarreia"
  ];

  return (
    // container principal
    <div className={styles.container}>
      
      {/* abas de navegação */}
      <nav className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>
          Pré-Sessão
        </div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>
          Durante a Sessão
        </div>
        <div className={`${styles.tab} ${styles.tabActive}`}>
          Pós-Sessão
        </div>
      </nav>

      <main className={styles.content}>
        
        {/* massa corporal pós-treino */}
        <section className={styles.inputGroup}>
          <label>MASSA CORPORAL (Kg)</label>
          <input 
            type="text" 
            placeholder="EX: 70.6" 
            className={styles.input}
            value={massaCorporal}
            onChange={(e) => setMassaCorporal(e.target.value)}
          />
        </section>

        {/* nível de suor nas roupas */}
        <section className={styles.inputGroup}>
          <label>NIVEL DE SUOR NAS ROUPAS</label>
          <div className={styles.optionButtons}>
            {["Pouco", "Moderado", "Encharcado"].map((n) => (
              <button 
                key={n}
                // 2. Interpolação de classe no React com CSS Modules
                className={`${styles.optionBtn} ${nivelSuor === n ? styles.optionBtnActive : ''}`}
                onClick={() => setNivelSuor(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* grid de sintomas pós-treino */}
        <section className={styles.inputGroup}>
          <label>SINTOMAS</label>
          <div className={styles.sintomasGrid}>
            {listaSintomas.map((s) => (
              <button 
                key={s}
                // Mesma interpolação feita nos botões de suor
                className={`${styles.sintomaBtn} ${sintomas.includes(s) ? styles.sintomaBtnActive : ''}`}
                onClick={() => toggleSintoma(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* btn de finalizar */}
        <footer>
          {/* Removi a classe 'finish-btn' pois ela não estava declarada no seu App.css original. A 'continueBtn' já deixa o botão vermelho conforme planejado! */}
          <button className={styles.continueBtn} onClick={() => navigate("/resultado-sessao")}>
            Finalizar
          </button>
        </footer>
      </main>
    </div>
  );
}