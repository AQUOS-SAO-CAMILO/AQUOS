import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { preSessaoSchema } from "../schemas/authSchemas";
import Alert from "../components/Alert";
import stylesBotao from "../styles/Auth.module.css"

// 1. Importando o CSS de Sessão
import styles from "../styles/Session.module.css";

// formulário de pré-treino (dados do atleta)
export default function PreSessao() {
  const navigate = useNavigate();
  
  // estados p/ os inputs interativos
  const [intensidade, setIntensidade] = useState(3);
  const [vestimenta, setVestimenta] = useState("Normal");
  const [corUrina, setCorUrina] = useState(0);
  const [sede, setSede] = useState(3);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [modalidade, setModalidade] = useState("");

  const [massaCorporal, setMassaCorporal] = useState("");
  const [duracaoPrevista, setDuracaoPrevista] = useState("");
  const [hidratacao, setHidratacao] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");

  // gerencia seleção d sintomas (múltipla)
  const toggleSintoma = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter((s) => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  // escala d cores p/ o seletor de urina
  const coresUrina = [
    "#FFFFFF",
    "#F9F5C5",
    "#F7EF4E",
    "#FFCC00",
    "#FFA500",
    "#F28500",
    "#C67111",
  ];

  async function validatePreSessao() {
    try {
      await preSessaoSchema.validate({
        massaCorporal,
        duracaoPrevista,
        hidratacao,
      });

      setAlertType("success");
      setAlertMessage("Dados validados com sucesso!");
      setTimeout(() => {
        navigate("/durante-sessao");
      }, 1200);
    } catch (erro: any) {
      setAlertType("error");
      setAlertMessage(erro.message);
    }
  }

  return (
   
    <div className={styles.container}>
      <nav className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabActive}`}>
          Pré-Sessão
        </div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>
          Durante a Sessão
        </div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>
          Pós-Sessão
        </div>
      </nav>

      <main className={styles.content}>
        {/* campos de texto básicos */}
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

        <section className={styles.inputGroup}>
          <label>MODALIDADE</label>
          <select
            // 3. Juntando as 3 classes do select
            className={`${styles.input} ${styles.selectInput} ${modalidade === "" ? styles.placeholderState : ""}`}
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
          >
            <option value="" disabled hidden>
              Selecione
            </option>
            <option value="corrida">Corrida</option>
            <option value="natacao">Natação</option>
            <option value="ciclismo">Ciclismo</option>
          </select>
        </section>

        <section className={styles.inputGroup}>
          <label>DURAÇÃO PREVISTA (min)</label>
          <input
            className={styles.input}
            type="text"
            placeholder="EX: 120"
            value={duracaoPrevista}
            onChange={(e) => setDuracaoPrevista(e.target.value)}
          />
        </section>

        {/* slider d intensidade 1-5 */}
        <section className={styles.inputGroup}>
          <label>INTENSIDADE</label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="1"
              max="5"
              value={intensidade}
              onChange={(e) => setIntensidade(parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderValue}>{intensidade}</div>
          </div>
        </section>

        {/* escolha de tipo d roupa */}
        <section className={styles.inputGroup}>
          <label>VESTIMENTA</label>
          <div className={styles.optionButtons}>
            {["Leve", "Normal", "Pesada"].map((v) => (
              <button
                key={v}
                // Interpolação de classe ativa
                className={`${styles.optionBtn} ${vestimenta === v ? styles.optionBtnActive : ""}`}
                onClick={() => setVestimenta(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </section>

        {/* seletor visual p/ urina */}
        <section className={styles.inputGroup}>
          <label>COR DA URINA</label>
          <div className={styles.colorScale}>
            {coresUrina.map((cor, index) => (
              <div
                key={index}
                className={`${styles.colorBox} ${corUrina === index ? styles.colorBoxSelected : ""}`}
                style={{ backgroundColor: cor }}
                onClick={() => setCorUrina(index)}
              />
            ))}
          </div>
        </section>

        {/* escala d sede */}
        <section className={styles.inputGroup}>
          <label>SEDE</label>
          <div className={styles.sedeScale}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={styles.sedeItem} onClick={() => setSede(s)}>
                <svg
                  className={`${styles.dropIcon} ${sede >= s ? styles.dropIconActive : ""}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* grid d sintomas */}
        <section className={styles.inputGroup}>
          <label>SINTOMAS</label>
          <div className={styles.sintomasGrid}>
            {[
              "Boca seca",
              "Fadiga",
              "Tontura",
              "Dor de Cabeça",
              "Irritabilidade",
              "Cãibras",
            ].map((s) => (
              <button
                key={s}
                className={`${styles.sintomaBtn} ${sintomas.includes(s) ? styles.sintomaBtnActive : ""}`}
                onClick={() => toggleSintoma(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* campo d hidratação (azul) */}
        <section className={styles.inputGroup}>
          <label>HIDRATAÇÃO (ml)</label>
          <input
            className={`${styles.input} ${styles.hydrationInput}`}
            type="text"
            placeholder="EX: 2000"
            value={hidratacao}
            onChange={(e) => setHidratacao(e.target.value)}
          />
        </section>

        {/* btn p/ seguir no fluxo */}
        {/* Novamente, removida a classe 'sessao-footer' da tag footer para manter limpo */}
        <footer>
          <button className={styles.continueBtn} onClick={validatePreSessao}>
            Continuar
          </button>

          <button 
            className={`${styles.btnBackSessao}`}
            onClick={() => navigate("/menu-atleta")}>
            Voltar
          </button>
        </footer>

        {alertMessage && (
          <Alert
            message={alertMessage}
            type={alertType}
            onClose={() => setAlertMessage("")}
          />
        )}
      </main>
    </div>
  );
}