import React from 'react';

const DadosAtleta = () => {
  return (
    <div className="auth-container">
      
      <div className="auth-card">
        

        <div className="formContent">
          <div className="formBody">
            <div className="fieldGroup">
              <label className="label">NOME COMPLETO</label>
              <input type="text" className="input" />
            </div>

            <div className="fieldGroup">
              <label className="label">DATA DE NASCIMENTO</label>
              <input type="text" placeholder="00/00/0000" className="input" />
            </div>

            <div className="fieldGroup">
              <label className="label">GÊNERO</label>
              <div className="selectWrapper">
                  <select className="input" defaultValue="">
                      <option value="" disabled hidden>Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                  </select>
              </div>
            </div>

            <div className="fieldGroup">
              <label className="label">MODALIDADE</label>
              <div className="selectWrapper">
                  <select className="input" defaultValue="">
                      <option value="" disabled hidden>Selecione</option>
                      <option value="futebol">Futebol</option>
                      <option value="volei">Vôlei</option>
                  </select>
              </div>
            </div>

            <div className="fieldGroup fieldGroupActive">
              <label className="label">EQUIPE</label>
              <div className="selectWrapper">
                  <select className="input inputActive" defaultValue="">
                      <option value="" disabled hidden>Selecione</option>
                  </select>
              </div>
            </div>

            <div className="fieldGroup">
              <label className="label">PESO (Kg)</label>
              <input type="number" className="input" />
            </div>

            <div className="fieldGroup">
              <label className="label">ALTURA (cm)</label>
              <input type="number" className="input" />
            </div>
          </div>

         
          <div className="buttonContainer">
            <button className="auth-btn primary" type="button">
              Cancelar
            </button>
            <button className="auth-btn primary" type="button">
              Salvar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DadosAtleta;