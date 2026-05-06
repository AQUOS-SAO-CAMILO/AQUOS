import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // gerencia seleção d sintomas (múltipla)
  const toggleSintoma = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter(s => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  // escala d cores p/ o seletor de urina
  const coresUrina = [
    "#FFFFFF", "#F9F5C5", "#F7EF4E", "#FFCC00", "#FFA500", "#F28500", "#C67111"
  ];

  return (
    <div className="pre-sessao-container">
      {/* navegação entre as fases do treino */}
      <nav className="sessao-tabs">
        <div className="tab active">Pré-Sessão</div>
        <div className="tab disabled">Durante a Sessão</div>
        <div className="tab disabled">Pós-Sessão</div>
      </nav>

      <main className="sessao-content">
        {/* campos de texto básicos */}
        <section className="input-group">
          <label>MASSA CORPORAL (Kg)</label>
          <input type="text" placeholder="EX: 70.6" className="sessao-input" />
        </section>

        <section className="input-group">
          <label>MODALIDADE</label>
          <select 
            className={`sessao-input select-input ${modalidade === "" ? "placeholder-state" : ""}`}
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
          >
            <option value="" disabled hidden>Selecione</option>
            <option value="corrida">Corrida</option>
            <option value="natacao">Natação</option>
            <option value="ciclismo">Ciclismo</option>
          </select>
        </section>

        <section className="input-group">
          <label>DURAÇÃO PREVISTA (min)</label>
          <input type="text" placeholder="EX: 120" className="sessao-input" />
        </section>

        {/* slider d intensidade 1-5 */}
        <section className="input-group">
          <label>INTENSIDADE</label>
          <div className="slider-container">
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={intensidade} 
              onChange={(e) => setIntensidade(parseInt(e.target.value))}
              className="sessao-slider"
            />
            <div className="slider-value">{intensidade}</div>
          </div>
        </section>

        {/* escolha de tipo d roupa */}
        <section className="input-group">
          <label>VESTIMENTA</label>
          <div className="option-buttons">
            {["Leve", "Normal", "Pesada"].map((v) => (
              <button 
                key={v}
                className={`option-btn ${vestimenta === v ? 'active' : ''}`}
                onClick={() => setVestimenta(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </section>

        {/* seletor visual p/ urina */}
        <section className="input-group">
          <label>COR DA URINA</label>
          <div className="color-scale">
            {coresUrina.map((cor, index) => (
              <div 
                key={index}
                className={`color-box ${corUrina === index ? 'selected' : ''}`}
                style={{ backgroundColor: cor }}
                onClick={() => setCorUrina(index)}
              />
            ))}
          </div>
        </section>

        {/* escala d sede */}
        <section className="input-group">
          <label>SEDE</label>
          <div className="sede-scale">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="sede-item" onClick={() => setSede(s)}>
                <svg 
                  className={`drop-icon ${sede >= s ? 'active' : ''}`} 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* grid d sintomas */}
        <section className="input-group">
          <label>SINTOMAS</label>
          <div className="sintomas-grid">
            {["Boca seca", "Fadiga", "Tontura", "Dor de Cabeça", "Irritabilidade", "Cãibras"].map((s) => (
              <button 
                key={s}
                className={`sintoma-btn ${sintomas.includes(s) ? 'active' : ''}`}
                onClick={() => toggleSintoma(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* campo d hidratação (azul) */}
        <section className="input-group">
          <label>HIDRATAÇÃO (ml)</label>
          <input type="text" placeholder="EX: 2000" className="sessao-input hydration-input" />
        </section>

        {/* btn p/ seguir no fluxo */}
        <footer className="sessao-footer">
          <button className="continue-btn" onClick={() => navigate("/menu-atleta")}>
            Continuar
          </button>
        </footer>
      </main>
    </div>
  );
}
