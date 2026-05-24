import React, { useState, useEffect } from 'react';
import authStyles from '../styles/Auth.module.css';
import formStyles from '../styles/Form.module.css';
import { useNavigate } from "react-router-dom";

const DadosAtleta = () => {
  const navigate = useNavigate();

  // 1. Estados dos valores do atleta (o que ele escolheu)
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [equipe, setEquipe] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  // 2. Novos estados para as LISTAS vindas do banco de dados
  // Esses arrays guardarão as opções que vão aparecer nos selects
  const [listaModalidades, setListaModalidades] = useState<{ id: string, nome: string }[]>([]);
  const [listaEquipes, setListaEquipes] = useState<{ id: string, nome: string }[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 3. Função que busca tudo que a tela precisa
    async function fetchTodosOsDados() {
      try {
        // AQUI VOCÊ FARÁ AS SUAS REQUISIÇÕES REAIS. Exemplo:
        const [resPerfil, resModalidades, resEquipes] = await Promise.all([
          fetch("https://seu-backend.com/api/atleta/perfil"),
          fetch("https://seu-backend.com/api/modalidades"),
          fetch("https://seu-backend.com/api/equipes")
        ]);
        const [dadosPerfil, dadosModalidades, dadosEquipes] = await Promise.all([
          resPerfil.json(), resModalidades.json(), resEquipes.json()
        ]);


        
        // ==========================================
        // DADOS SIMULADOS VINDO DO BANCO DE DADOS
        // ==========================================
        
        // 1. As opções cadastradas no sistema pelo Adm
        // const dadosModalidades = [
        //   { id: "1", nome: "Futebol" },
        //   { id: "2", nome: "Vôlei" },
        //   { id: "3", nome: "Natação" },
        //   { id: "4", nome: "Corrida" }
        // ];

        // const dadosEquipes = [
        //   { id: "101", nome: "Equipe Alpha" },
        //   { id: "102", nome: "Equipe Beta" },
        //   { id: "103", nome: "Time Principal" }
        // ];

        // 2. O perfil atual do Atleta
        // const dadosPerfil = {
        //   nome: "Guilherme Silva",
        //   dataNascimento: "15/05/1998",
        //   genero: "masculino",
        //   modalidadeId: "3", // Ele já estava salvo como "Natação" (id 3)
        //   equipeId: "101", // Ele já estava salvo como "Equipe Alpha" (id 101)
        //   peso: "75.5",
        //   altura: "180"
        // };

        // Alimentando os estados das listas
        setListaModalidades(dadosModalidades);
        setListaEquipes(dadosEquipes);

        // Alimentando os estados do perfil do atleta
        setNome(dadosPerfil.nome);
        setDataNascimento(dadosPerfil.dataNascimento);
        setGenero(dadosPerfil.genero);
        setPeso(dadosPerfil.peso);
        setAltura(dadosPerfil.altura);
        
        // Salvamos os IDs para que o <select> marque a opção certa
        setModalidade(dadosPerfil.modalidadeId);
        setEquipe(dadosPerfil.equipeId);

      } catch (error) {
        console.error("Erro ao buscar dados do servidor:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTodosOsDados();
  }, []);

  async function handleSalvar() {
    try {
      // Objeto com os dados para enviar ao backend (PUT/PATCH)
      const dadosAtualizados = {
        nome,
        dataNascimento,
        genero,
        modalidadeId: modalidade, // Enviamos o ID da modalidade escolhida
        equipeId: equipe,         // Enviamos o ID da equipe escolhida
        peso,
        altura
      };

      console.log("Enviando para o Banco:", dadosAtualizados);
      
      // await fetch("https://seu-backend.com/api/atleta/perfil", { ... })

      alert("Dados atualizados com sucesso!");
      navigate("/menu-atleta");
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
            
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>NOME COMPLETO</label>
              <input 
                type="text" 
                className={formStyles.input} 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

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

            {/* 4. Select de MODALIDADE construído via MAP */}
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>MODALIDADE</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={formStyles.input} 
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      {listaModalidades.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.nome}
                        </option>
                      ))}
                  </select>
              </div>
            </div>

            {/* 5. Select de EQUIPE construído via MAP */}
            <div className={`${formStyles.fieldGroup} ${equipe !== "" ? formStyles.fieldGroupActive : ''}`}>
              <label className={formStyles.label}>EQUIPE</label>
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

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>PESO (Kg)</label>
              <input 
                type="number" 
                className={formStyles.input} 
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>ALTURA (cm)</label>
              <input 
                type="number" 
                className={formStyles.input} 
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
              />
            </div>
          </div>

          <div className={formStyles.buttonContainer}>
            <button 
              className={authStyles.btn} 
              type="button" 
              onClick={() => navigate("/menu-atleta")}
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

export default DadosAtleta;