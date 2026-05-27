import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { preSessaoSchema } from "../schemas/authSchemas";
import Alert from "../components/Alert";
import styles from "../styles/Session.module.css";

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

  // gerencia seleção de sintomas (múltipla)
  const toggleSintoma = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter((s) => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  const coresUrina = [
    "#FFFFFF", "#F9F5C5", "#F7EF4E", "#FFCC00", "#FFA500", "#F28500", "#C67111",
  ];

  // Função para pegar o ID do atleta de dentro do Token JWT
  const getAthleteId = () => {
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

  async function validatePreSessao() {
    try {
    
      await preSessaoSchema.validate({
        massaCorporal,
        duracaoPrevista,
        hidratacao,
      });

      const athleteId = getAthleteId();
      if (!athleteId) throw new Error("Sessão expirada. Faça login novamente.");

  
      const pesoNumerico = parseFloat(massaCorporal.replace(',', '.'));
      if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
        throw new Error("Por favor, insira uma massa corporal válida maior que zero.");
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

      const payloadStart = {
        athlete_id: athleteId,
        modality: modalidade,
        intensity: intensidade,
        session_start: new Date().toISOString().split('.')[0], 
        urine_color_pre: corUrina + 1, 
        bladder_emptied: false, 
        clothing_soaked: false, 
        urine_volume_ml: 0.1, 
        pre_weight_kg: pesoNumerico,
        
        notes: `Sintomas: ${sintomas.join(", ") || "Nenhum"} | Sede: ${sede} | Roupa: ${vestimenta} | Previsão: ${duracaoPrevista}min`
      };

      // Inicia a sessão no banco
      const resStart = await fetch(`${apiUrl}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadStart)
      });

      const dataStart = await resStart.json();

      if (!resStart.ok) {
        throw new Error(dataStart.message || dataStart.error || "Erro ao iniciar sessão.");
      }

      // 
      // Busca por session_id ou id
      const sessionId = dataStart.session_id || dataStart.id; 
      
      if (!sessionId) {
          throw new Error("O servidor não retornou um ID de sessão válido.");
      }

      // Salva os dados no navegador de forma limpa
      localStorage.setItem("current_session_id", sessionId);
      localStorage.setItem("pre_weight_kg", pesoNumerico.toString());

      if (hidratacao && Number(hidratacao) > 0) {
        await fetch(`${apiUrl}/session/fluidIntake`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            fluid_type: "water",
            volume_ml: Number(hidratacao),
            logged_at: new Date().toISOString().split('.')[0]
          })
        });
      }
      
      setAlertType("success");
      setAlertMessage(dataStart.hydration_alert || "Sessão iniciada com sucesso!");
      
      setTimeout(() => {
        navigate("/durante-sessao");
      }, 2500); 

    } catch (erro: any) {
      setAlertType("error");
      setAlertMessage(erro.message || "Erro de conexão com o servidor");
    }
  }

  return (
    <div className={styles.container}>
      <nav className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabActive}`}>Pré-Sessão</div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>Durante a Sessão</div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>Pós-Sessão</div>
      </nav>

      <main className={styles.content}>
        <section className={styles.inputGroup}>
          <label>MASSA CORPORAL (Kg)</label>
          <input
            type="number"
            placeholder="EX: 70.6"
            className={styles.input}
            value={massaCorporal}
            onChange={(e) => setMassaCorporal(e.target.value)}
          />
        </section>

        <section className={styles.inputGroup}>
          <label>MODALIDADE</label>
          <select
            className={`${styles.input} ${styles.selectInput} ${modalidade === "" ? styles.placeholderState : ""}`}
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
          >
            <option value="" disabled hidden>Selecione</option>
            <option value="Corrida">Corrida</option>
            <option value="Natação">Natação</option>
            <option value="Ciclismo">Ciclismo</option>
            <option value="Futsal">Futsal</option>
          </select>
        </section>

        <section className={styles.inputGroup}>
          <label>DURAÇÃO PREVISTA (min)</label>
          <input
            className={styles.input}
            type="number"
            placeholder="EX: 120"
            value={duracaoPrevista}
            onChange={(e) => setDuracaoPrevista(e.target.value)}
          />
        </section>

        <section className={styles.inputGroup}>
          <label>INTENSIDADE</label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="1" max="5"
              value={intensidade}
              onChange={(e) => setIntensidade(parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderValue}>{intensidade}</div>
          </div>
        </section>

        <section className={styles.inputGroup}>
          <label>VESTIMENTA</label>
          <div className={styles.optionButtons}>
            {["Leve", "Normal", "Pesada"].map((v) => (
              <button
                key={v}
                className={`${styles.optionBtn} ${vestimenta === v ? styles.optionBtnActive : ""}`}
                onClick={() => setVestimenta(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </section>

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

        <section className={styles.inputGroup}>
          <label>SEDE</label>
          <div className={styles.sedeScale}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={styles.sedeItem} onClick={() => setSede(s)}>
                <svg
                  className={`${styles.dropIcon} ${sede >= s ? styles.dropIconActive : ""}`}
                  viewBox="0 0 24 24" fill="currentColor"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.inputGroup}>
          <label>SINTOMAS</label>
          <div className={styles.sintomasGrid}>
            {["Boca seca", "Fadiga", "Tontura", "Dor de Cabeça", "Irritabilidade", "Cãibras"].map((s) => (
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

        <section className={styles.inputGroup}>
          <label>HIDRATAÇÃO PRÉ-SESSÃO (ml)</label>
          <input
            className={`${styles.input} ${styles.hydrationInput}`}
            type="number"
            placeholder="EX: 500"
            value={hidratacao}
            onChange={(e) => setHidratacao(e.target.value)}
          />
        </section>

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
          <Alert message={alertMessage} type={alertType} onClose={() => setAlertMessage("")} />
        )}
      </main>
    </div>
  );
}