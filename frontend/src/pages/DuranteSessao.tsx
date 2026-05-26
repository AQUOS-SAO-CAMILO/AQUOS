import { useState } from "react";
import { useNavigate } from "react-router-dom";

// importando os ícones da pasta assets
import icon250ml from "../assets/250ml.svg";
import icon500ml from "../assets/500ml.svg";
import icon1L from "../assets/1L.svg";
import icon150ml from "../assets/bexiga1.svg";
import icon300ml from "../assets/bexiga2.svg";
import icon600ml from "../assets/bexiga3.svg";

// 1. Importando o CSS de Sessão
import styles from "../styles/Session.module.css";

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
    // 2. Substituindo 'pre-sessao-container' por styles.container
    <div className={styles.container}>
      
      {/* abas de navegação */}
      <nav className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>
          Pré-Sessão
        </div>
        <div className={`${styles.tab} ${styles.tabActive}`}>
          Durante a Sessão
        </div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>
          Pós-Sessão
        </div>
      </nav>

      {/* Juntando content e duringContent */}
      <main className={`${styles.content} ${styles.duringContent}`}>
        
        {/* bloco de ingestão de água */}
        <section className={`${styles.monitoringBlock} ${styles.waterBlock}`}>
          <div className={styles.blockHeader}>
            <h3>INGESTÃO DE ÁGUA TOTAL</h3>
            <span className={styles.totalValue}>{aguaTotal.toString().padStart(4, '0')} ml</span>
          </div>
          
          <div className={styles.iconSelectionGrid}>
            <div className={styles.iconItem} onClick={() => addAgua(250)}>
              <div className={`${styles.iconBox} ${styles.waterBg}`}>
                <img src={icon250ml} alt="250ml" />
              </div>
              <span>250ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addAgua(500)}>
              <div className={`${styles.iconBox} ${styles.waterBg}`}>
                <img src={icon500ml} alt="500ml" />
              </div>
              <span>500ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addAgua(1000)}>
              <div className={`${styles.iconBox} ${styles.waterBg}`}>
                <img src={icon1L} alt="1l" />
              </div>
              <span>1l</span>
            </div>
          </div>

          <div className={styles.fineAdjustment}>
            <button onClick={() => ajustarAgua(-50)}>−</button>
            <span>Ajustar 50ml</span>
            <button onClick={() => ajustarAgua(50)}>+</button>
          </div>
        </section>

        {/* bloco de volume urinário */}
        <section className={`${styles.monitoringBlock} ${styles.urineBlock}`}>
          <div className={styles.blockHeader}>
            <h3>VOLUME URINÁRIO TOTAL</h3>
            <span className={styles.totalValue}>{urinaTotal.toString().padStart(4, '0')} ml</span>
          </div>

          <div className={styles.iconSelectionGrid}>
            <div className={styles.iconItem} onClick={() => addUrina(150)}>
              <div className={`${styles.iconBox} ${styles.urineBg}`}>
                <img src={icon150ml} alt="150ml" />
              </div>
              <span>150ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addUrina(300)}>
              <div className={`${styles.iconBox} ${styles.urineBg}`}>
                <img src={icon300ml} alt="300ml" />
              </div>
              <span>300ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addUrina(600)}>
              <div className={`${styles.iconBox} ${styles.urineBg}`}>
                <img src={icon600ml} alt="600ml" />
              </div>
              <span>600ml</span>
            </div>
          </div>

          <div className={styles.fineAdjustment}>
            <button onClick={() => ajustarUrina(-50)}>−</button>
            <span>Ajustar 50ml</span>
            <button onClick={() => ajustarUrina(50)}>+</button>
          </div>
        </section>

        {/* btn de prosseguir */}
        {/* Removi a classe 'sessao-footer' da tag footer pois não havia estilo declarado no CSS base */}
        <footer>
          <button className={styles.continueBtn} onClick={() => navigate("/pos-sessao")}>
            Continuar
          </button>
          <button 
            className={`${styles.btnBackSessao}`}
            onClick={() => navigate("/pre-sessao")}>
            Voltar
          </button>
        </footer>
      </main>
    </div>
  );
}