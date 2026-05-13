import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="pre-sessao-container">
      {/* abas de navegação */}
      <nav className="sessao-tabs">
        <div className="tab disabled" onClick={() => navigate("/pre-sessao")}>Pré-Sessão</div>
        <div className="tab disabled" onClick={() => navigate("/durante-sessao")}>Durante a Sessão</div>
        <div className="tab active">Pós-Sessão</div>
      </nav>

      <main className="sessao-content">
        {/* massa corporal pós-treino */}
        <section className="input-group">
          <label>MASSA CORPORAL (Kg)</label>
          <input 
            type="text" 
            placeholder="EX: 70.6" 
            className="sessao-input"
            value={massaCorporal}
            onChange={(e) => setMassaCorporal(e.target.value)}
          />
        </section>

        {/* nível de suor nas roupas */}
        <section className="input-group">
          <label>NIVEL DE SUOR NAS ROUPAS</label>
          <div className="option-buttons">
            {["Pouco", "Moderado", "Encharcado"].map((n) => (
              <button 
                key={n}
                className={`option-btn ${nivelSuor === n ? 'active' : ''}`}
                onClick={() => setNivelSuor(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* grid de sintomas pós-treino */}
        <section className="input-group">
          <label>SINTOMAS</label>
          <div className="sintomas-grid">
            {listaSintomas.map((s) => (
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

        {/* btn de finalizar (vermelho no protótipo) */}
        <footer className="sessao-footer">
          <button className="continue-btn finish-btn" onClick={() => navigate("/menu-atleta")}>
            Finalizar
          </button>
        </footer>
      </main>
    </div>
  );
}
