import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import authStyles from '../styles/Auth.module.css';
import formStyles from '../styles/Form.module.css';

export default function FiltroRelatorios() {
  const navigate = useNavigate();

  // 1. Estados para armazenar as seleções do Administrador
  const [modalidade, setModalidade] = useState("");
  const [equipe, setEquipe] = useState("");
  const [atleta, setAtleta] = useState("");

  // 2. Estados para armazenar as opções vindas do Banco de Dados
  const [listaModalidades, setListaModalidades] = useState<{ id: string, nome: string }[]>([]);
  const [listaEquipes, setListaEquipes] = useState<{ id: string, nome: string }[]>([]);
  const [listaAtletas, setListaAtletas] = useState<{ id: string, nome: string }[]>([]);

  const [loading, setLoading] = useState(true);

  // 3. Busca inicial das opções para preencher os Selects
  useEffect(() => {
    async function fetchFiltros() {
      try {
        // Exemplo de chamadas reais:
        const [resModalidades, resEquipes, resAtletas] = await Promise.all([
          fetch("https://seu-backend.com/api/modalidades"),
          fetch("https://seu-backend.com/api/equipes"),
          fetch("https://seu-backend.com/api/atletas")
        ]);

        // SIMULAÇÃO: Dados do banco de dados
        // setListaModalidades([
        //   { id: "1", nome: "Futebol" },
        //   { id: "2", nome: "Natação" }
        // ]);

        // setListaEquipes([
        //   { id: "101", nome: "Equipe Alpha" },
        //   { id: "102", nome: "Equipe Beta" }
        // ]);

        // setListaAtletas([
        //   { id: "1001", nome: "Guilherme Silva" },
        //   { id: "1002", nome: "João Pedro" },
        //   { id: "1003", nome: "Carlos Eduardo" }
        // ]);

      } catch (error) {
        console.error("Erro ao buscar filtros:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFiltros();
  }, []);

  // 4. Função para avançar e gerar o relatório
  const handleAvancar = () => {
    // Monta os parâmetros para enviar para a tela de visualização ou para a API
    const filtros = {
      modalidade,
      equipe,
      atleta
    };

    console.log("Gerando relatório com os filtros:", filtros);

    // Navega para a tela que vai exibir os gráficos/resultados, 
    // passando os filtros pela URL (Query Params) ou pelo state do React Router
    // Exemplo: /exibir-relatorio?equipe=101&atleta=1001
    navigate(`/exibir-relatorio?modalidade=${modalidade}&equipe=${equipe}&atleta=${atleta}`);
  };

  if (loading) {
    return (
      <div className={authStyles.container} style={{ justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Carregando filtros...</h2>
      </div>
    );
  }

  return (
    <div className={authStyles.container}>
      <div className={formStyles.content}>

        <div className={formStyles.body}>
          
          {/* SELECT: MODALIDADE */}
          <div className={formStyles.fieldGroup}>
            <label className={formStyles.label}>MODALIDADE</label>
            <div className={formStyles.selectWrapper}>
                <select 
                  className={formStyles.input} 
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                >
                    <option value="" disabled hidden>Selecione</option>
                    {listaModalidades.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                </select>
            </div>
          </div>

          {/* SELECT: EQUIPE */}
          <div className={formStyles.fieldGroup}>
            <label className={formStyles.label}>EQUIPE</label>
            <div className={formStyles.selectWrapper}>
                <select 
                  className={formStyles.input} 
                  value={equipe}
                  onChange={(e) => setEquipe(e.target.value)}
                >
                    <option value="" disabled hidden>Selecione</option>
                    {listaEquipes.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.nome}</option>
                    ))}
                </select>
            </div>
          </div>

          {/* SELECT: ATLETA */}
          <div className={formStyles.fieldGroup}>
            <label className={formStyles.label}>ATLETA</label>
            <div className={formStyles.selectWrapper}>
                <select 
                  className={formStyles.input} 
                  value={atleta}
                  onChange={(e) => setAtleta(e.target.value)}
                >
                    <option value="" disabled hidden>Selecione</option>
                    {listaAtletas.map((atl) => (
                      <option key={atl.id} value={atl.id}>{atl.nome}</option>
                    ))}
                </select>
            </div>
          </div>

        </div>

        {/* BOTÕES CANCELAR E AVANÇAR */}
        <div className={formStyles.buttonContainer} style={{ marginTop: '50px' }}>
          <button 
            className={`${authStyles.btn}`} 
            type="button" 
            onClick={() => navigate("/menu-adm")}
            style={{ marginTop: '24px' }}
          >
            Cancelar
          </button>
          
          <button 
            className={`${authStyles.btn} ${authStyles.btnPrimary}`} 
            type="button" 
            onClick={handleAvancar}
          >
            Avançar
          </button>
        </div>

      </div>
    </div>
  );
}