import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// Reutilizando os mesmos estilos das telas de autenticação e formulário
import authStyles from '../styles/Auth.module.css';
import formStyles from '../styles/Form.module.css';

const DadosAdm = () => {
  const navigate = useNavigate();

  // 1. Estados para controlar cada campo do formulário
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [cargo, setCargo] = useState("");
  const [equipe, setEquipe] = useState("");

  // 2. Estados para as opções que podem vir do banco de dados
  const [listaCargos, setListaCargos] = useState<{ id: string, nome: string }[]>([]);
  const [listaEquipes, setListaEquipes] = useState<{ id: string, nome: string }[]>([]);

  const [loading, setLoading] = useState(true);

  // 3. Busca os dados atuais do Administrador assim que a tela abre (GET)
  useEffect(() => {
    async function fetchDadosAdm() {
      try {
        // Exemplo de chamadas reais:
        const [resPerfil, resCargos, resEquipes] = await Promise.all([
          fetch("https://seu-backend.com/api/adm/perfil"),
          fetch("https://seu-backend.com/api/cargos"),
          fetch("https://seu-backend.com/api/equipes")
        ]);

        // ==========================================
        // SIMULAÇÃO: Dados vindo do banco de dados
        // ==========================================
        // const dadosCargos = [
        //   { id: "1", nome: "Treinador Principal" },
        //   { id: "2", nome: "Auxiliar Técnico" },
        //   { id: "3", nome: "Fisiologista" },
        //   { id: "4", nome: "Nutricionista" }
        // ];

        // const dadosEquipes = [
        //   { id: "101", nome: "Equipe Alpha" },
        //   { id: "102", nome: "Equipe Beta" },
        //   { id: "103", nome: "Todas as Equipes" } // Admins geralmente podem ver todas
        // ];

        // const dadosPerfil = {
        //   nome: "Guilherme Silva",
        //   dataNascimento: "10/10/1985",
        //   genero: "masculino",
        //   cargoId: "3", 
        //   equipeId: "101" 
        // };

        // Preenche os estados com as listas
        setListaCargos(dadosCargos);
        setListaEquipes(dadosEquipes);

        // Preenche os estados com as informações do perfil
        setNome(dadosPerfil.nome);
        setDataNascimento(dadosPerfil.dataNascimento);
        setGenero(dadosPerfil.genero);
        setCargo(dadosPerfil.cargoId);
        setEquipe(dadosPerfil.equipeId);

      } catch (error) {
        console.error("Erro ao buscar os dados do administrador:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDadosAdm();
  }, []);

  // 4. Função acionada ao clicar em "Salvar" (PUT/PATCH)
  async function handleSalvar() {
    try {
      const dadosAtualizados = {
        nome,
        dataNascimento,
        genero,
        cargoId: cargo,
        equipeId: equipe
      };

      console.log("Enviando para o Banco (ADM):", dadosAtualizados);
      
      // await fetch("https://seu-backend.com/api/adm/perfil", { ... })

      alert("Dados do administrador atualizados com sucesso!");
      navigate("/menu-adm");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar os dados.");
    }
  }

  if (loading) {
    return (
      <div className={authStyles.container} style={{ justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Carregando dados...</h2>
      </div>
    );
  }

  return (
    <div className={authStyles.container}>
      <div className={authStyles.card}>
        <div className={formStyles.content}>
          <div className={formStyles.body}>
            
            {/* NOME COMPLETO */}
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>NOME COMPLETO</label>
              <input 
                type="text" 
                className={formStyles.input} 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            {/* DATA DE NASCIMENTO */}
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>DATA DE NASCIMENTO</label>
              <input 
                type="text" 
                placeholder="00/00/0000" 
                className={formStyles.input} 
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>

            {/* GÊNERO */}
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>GÊNERO</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={formStyles.input} 
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                  </select>
              </div>
            </div>

            {/* CARGO */}
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>CARGO</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={formStyles.input} 
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      {listaCargos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                  </select>
              </div>
            </div>

            {/* EQUIPE(S) */}
            <div className={`${formStyles.fieldGroup} ${equipe !== "" ? formStyles.fieldGroupActive : ''}`}>
              <label className={formStyles.label}>EQUIPE(S)</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={`${formStyles.input} ${equipe !== "" ? formStyles.inputActive : ''}`} 
                    value={equipe}
                    onChange={(e) => setEquipe(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      {listaEquipes.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.nome}
                        </option>
                      ))}
                  </select>
              </div>
            </div>

          </div>

          {/* BOTÕES */}
          <div className={formStyles.buttonContainer}>
  
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
              onClick={handleSalvar}
            >
              Salvar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DadosAdm;