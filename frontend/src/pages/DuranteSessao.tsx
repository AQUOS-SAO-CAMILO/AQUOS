import { useState } from "react";
import { useNavigate } from "react-router-dom";

// importando os ícones da pasta assets
import icon250ml from "../assets/250ml.svg";
import icon500ml from "../assets/500ml.svg";
import icon1L from "../assets/1L.svg";
import icon150ml from "../assets/150ml.svg";
import icon300ml from "../assets/300ml.svg";
import icon600ml from "../assets/600ml.svg";

// tela p/ monitorar hidratação e urina durante o treino
export default function DuranteSessao() {
  const navigate = useNavigate();
  
  // estados p/ os totais acumulados
  const [aguaTotal, setAguaTotal] = useState(0);
  const [urinaTotal, setUrinaTotal] = useState(0);

  // funções p/ somar volumes rápidos
  const addAgua = (ml: number) => setAguaTotal(prev => prev + ml);
  const addUrina = (ml: number) => setUrinaTotal(prev => prev + ml);

  // ajuste fino de 50ml
  const ajustarAgua = (ml: number) => setAguaTotal(prev => Math.max(0, prev + ml));
  const ajustarUrina = (ml: number) => setUrinaTotal(prev => Math.max(0, prev + ml));

  return (
    <div className="pre-sessao-container">
      {/* abas de navegação (mesmo padrão da anterior) */}
      <nav className="sessao-tabs">
        <div className="tab disabled" onClick={() => navigate("/pre-sessao")}>Pré-Sessão</div>
        <div className="tab active">Durante a Sessão</div>
        <div className="tab disabled">Pós-Sessão</div>
      </nav>

      <main className="sessao-content during-content">
        
        {/* bloco de ingestão de água */}
        <section className="monitoring-block water-block">
          <div className="block-header">
            <h3>INGESTÃO DE ÁGUA TOTAL</h3>
            <span className="total-value">{aguaTotal.toString().padStart(4, '0')} ml</span>
          </div>
          
          <div className="icon-selection-grid">
            <div className="icon-item" onClick={() => addAgua(250)}>
              <div className="icon-box water-bg">
                <img src={icon250ml} alt="250ml" />
              </div>
              <span>250ml</span>
            </div>
            <div className="icon-item" onClick={() => addAgua(500)}>
              <div className="icon-box water-bg">
                <img src={icon500ml} alt="500ml" />
              </div>
              <span>500ml</span>
            </div>
            <div className="icon-item" onClick={() => addAgua(1000)}>
              <div className="icon-box water-bg">
                <img src={icon1L} alt="1l" />
              </div>
              <span>1l</span>
            </div>
          </div>

          <div className="fine-adjustment">
            <button onClick={() => ajustarAgua(-50)}>−</button>
            <span>Ajustar 50ml</span>
            <button onClick={() => ajustarAgua(50)}>+</button>
          </div>
        </section>

        {/* bloco de volume urinário */}
        <section className="monitoring-block urine-block">
          <div className="block-header">
            <h3>VOLUME URINÁRIO TOTAL</h3>
            <span className="total-value">{urinaTotal.toString().padStart(4, '0')} ml</span>
          </div>

          <div className="icon-selection-grid">
            <div className="icon-item" onClick={() => addUrina(150)}>
              <div className="icon-box urine-bg">
                <img src={icon150ml} alt="150ml" />
              </div>
              <span>150ml</span>
            </div>
            <div className="icon-item" onClick={() => addUrina(300)}>
              <div className="icon-box urine-bg">
                <img src={icon300ml} alt="300ml" />
              </div>
              <span>300ml</span>
            </div>
            <div className="icon-item" onClick={() => addUrina(600)}>
              <div className="icon-box urine-bg">
                <img src={icon600ml} alt="600ml" />
              </div>
              <span>600ml</span>
            </div>
          </div>

          <div className="fine-adjustment">
            <button onClick={() => ajustarUrina(-50)}>−</button>
            <span>Ajustar 50ml</span>
            <button onClick={() => ajustarUrina(50)}>+</button>
          </div>
        </section>

        {/* btn de prosseguir */}
        <footer className="sessao-footer">
          <button className="continue-btn" onClick={() => navigate("/menu-atleta")}>
            Continuar
          </button>
        </footer>
      </main>
    </div>
  );
}
