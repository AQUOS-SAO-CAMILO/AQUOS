import React from 'react';
import authStyles from '../styles/Auth.module.css';
import formStyles from '../styles/Form.module.css';
import { useNavigate } from "react-router-dom";


const DadosAtleta = () => {
  const navigate = useNavigate();

  return (
    // Usamos authStyles para o container externo
    <div className={authStyles.container}>
      
      <div className={authStyles.card}>
        
        {/* A partir daqui, usamos formStyles para o formulário interno */}
        <div className={formStyles.content}>
          <div className={formStyles.body}>
            
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>NOME COMPLETO</label>
              <input type="text" className={formStyles.input} />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>DATA DE NASCIMENTO</label>
              <input type="text" placeholder="00/00/0000" className={formStyles.input} />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>GÊNERO</label>
              <div className={formStyles.selectWrapper}>
                  {/* Nota: no CSS modules eu converti a tag select.input só para a classe .input */}
                  <select className={formStyles.input} defaultValue="">
                      <option value="" disabled hidden>Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                  </select>
              </div>
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>MODALIDADE</label>
              <div className={formStyles.selectWrapper}>
                  <select className={formStyles.input} defaultValue="">
                      <option value="" disabled hidden>Selecione</option>
                      <option value="futebol">Futebol</option>
                      <option value="volei">Vôlei</option>
                  </select>
              </div>
            </div>

            {/* A classe fieldGroupActive não tinha CSS no seu arquivo original, mas mantive a estrutura caso você crie depois */}
            <div className={`${formStyles.fieldGroup} ${formStyles.fieldGroupActive || ''}`}>
              <label className={formStyles.label}>EQUIPE</label>
              <div className={formStyles.selectWrapper}>
                  {/* Juntando input e inputActive do formulário */}
                  <select className={`${formStyles.input} ${formStyles.inputActive}`} defaultValue="">
                      <option value="" disabled hidden>Selecione</option>
                  </select>
              </div>
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>PESO (Kg)</label>
              <input type="number" className={formStyles.input} />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>ALTURA (cm)</label>
              <input type="number" className={formStyles.input} />
            </div>
          </div>

          <div className={formStyles.buttonContainer}>
        
            <button className={`${authStyles.btn} ${authStyles.btnPrimary}`} type="button" onClick={() => navigate("/menu-atleta")}>
              Cancelar
            </button>
            
            <button className={`${authStyles.btn} ${authStyles.btnPrimary}`} type="button" onClick={() => navigate("/menu-atleta")}>
              Salvar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DadosAtleta;