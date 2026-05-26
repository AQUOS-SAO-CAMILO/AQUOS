import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import authStyles from '../styles/Auth.module.css';

export default function FiltroRelatorios() {
  const navigate = useNavigate();

  const [modalidades, setModalidades] = useState<string[]>([]);
  const [equipes, setEquipes] = useState<string[]>([]);
  const [atletas, setAtletas] = useState<string[]>([]);

  const [listaModalidades, setListaModalidades] = useState<{ id: string, nome: string }[]>([]);
  const [listaEquipes, setListaEquipes] = useState<{ id: string, nome: string }[]>([]);
  const [listaAtletas, setListaAtletas] = useState<{ id: string, nome: string }[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiltros() {
      try {
        setListaModalidades([
          { id: "1", nome: "Futebol" },
          { id: "2", nome: "Natação" },
          { id: "3", nome: "Vôlei" }
        ]);

        setListaEquipes([
          { id: "101", nome: "Equipe Alpha" },
          { id: "102", nome: "Equipe Beta" },
          { id: "103", nome: "Equipe Gama" }
        ]);

        setListaAtletas([
          { id: "1001", nome: "Guilherme Silva" },
          { id: "1002", nome: "João Pedro" },
          { id: "1003", nome: "Carlos Eduardo" },
          { id: "1004", nome: "Lucas Fernandes" },
          { id: "1005", nome: "Marcos Antônio" }
        ]);
      } catch (error) {
        console.error("Erro ao buscar filtros:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFiltros();
  }, []);

  const toggleSelection = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleAvancar = () => {
    const queryModalidade = modalidades.join(',');
    const queryEquipe = equipes.join(',');
    const queryAtleta = atletas.join(',');

    navigate(`/relatorio-adm?modalidade=${queryModalidade}&equipe=${queryEquipe}&atleta=${queryAtleta}`);
  };

  if (loading) {
    return (
      <div className={authStyles.container} style={{ justifyContent: 'center' }}>
        <h2 style={{ color: '#000' }}>Carregando filtros...</h2>
      </div>
    );
  }

  // Estilo premium para a caixa das listas
  const cardListStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '8px 16px',
    maxHeight: '160px',
    overflowY: 'auto' as 'auto',
    display: 'flex',
    flexDirection: 'column' as 'column',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)', // Sombra suave
    border: '1px solid rgba(0,0,0,0.02)'
  };

  // Função para renderizar cada item (linha) da lista com visual moderno
  const renderItem = (item: { id: string, nome: string }, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    const isSelected = list.includes(item.id);
    
    return (
      <div 
        key={item.id} 
        onClick={() => toggleSelection(item.id, list, setList)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px 0', 
          cursor: 'pointer',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <span style={{ 
          color: isSelected ? '#b71c1c' : '#555', 
          fontSize: '1rem',
          fontWeight: isSelected ? '700' : '500',
          transition: 'all 0.2s ease'
        }}>
          {item.nome}
        </span>
        
        {/* Checkbox Customizada (Bolinha) */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: isSelected ? 'none' : '2px solid #ccc',
          backgroundColor: isSelected ? '#b71c1c' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}>
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={authStyles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
      
     
      <p style={{ color: '#000', fontSize: '18px', marginBottom: '32px', fontStyle: 'normal' }}>SELECIONE OS DADOS PARA ANÁLISE</p>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '340px', gap: '28px' }}>
        
        {/* BLOCO: MODALIDADES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 800, marginLeft: '8px', letterSpacing: '0.5px', alignSelf: 'start'}}>
            MODALIDADES
          </label>
          <div style={cardListStyle}>
            {listaModalidades.map(m => renderItem(m, modalidades, setModalidades))}
          </div>
        </div>

        {/* BLOCO: EQUIPES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 800, marginLeft: '8px', letterSpacing: '0.5px', alignSelf: 'start' }}>
            EQUIPES
          </label>
          <div style={cardListStyle}>
            {listaEquipes.map(eq => renderItem(eq, equipes, setEquipes))}
          </div>
        </div>

        {/* BLOCO: ATLETAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
            <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px' }}>
              ATLETAS
            </label>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>{atletas.length} selecionados</span>
          </div>
          <div style={cardListStyle}>
            {listaAtletas.map(atl => renderItem(atl, atletas, setAtletas))}
          </div>
        </div>

        {/* BOTÕES */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px', width: '100%' }}>
          <button 
            type="button" 
            onClick={() => navigate("/menu-adm")}
            style={{ 
              flex: 1, 
              backgroundColor: 'transparent', 
              color: '#b71c1c', 
              padding: '14px 0', 
              borderRadius: '24px', 
              border: '2px solid #b71c1c', 
              fontSize: '1.05rem', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          
          <button 
            type="button" 
            onClick={handleAvancar}
            style={{ 
              flex: 1, 
              backgroundColor: '#b71c1c', 
              color: '#fff', 
              padding: '14px 0', 
              borderRadius: '24px', 
              border: 'none', 
              fontSize: '1.05rem', 
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0px 4px 12px rgba(183, 28, 28, 0.3)' // Brilho no botão principal
            }}
          >
            Avançar
          </button>
        </div>

      </div>
    </div>
  );
}