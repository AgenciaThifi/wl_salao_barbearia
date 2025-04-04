"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from '../components/styles/Catalogo.module.css';
import ServiceCard from '../components/ServiceCard';
import { Servico, adicionarServico, excluirServico } from '../services/firestoreService';

interface CatalogoProps {
  servicos: Servico[];
  setServicos: React.Dispatch<React.SetStateAction<Servico[]>>;
}

function Catalogo({ servicos, setServicos }: CatalogoProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [tempo, setTempo] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole || "");
  }, []);

  const handleAdicionarServico = async () => {
    if (!nome.trim() || !descricao.trim() || !preco.trim() || !tempo.trim()) {
      alert("Preencha todos os campos");
      return;
    }

    const novoServico: Omit<Servico, "id"> = {
      nome,
      descricao,
      preco: parseFloat(preco),
      tempo,
    };

    try {
      const docRef = await adicionarServico(novoServico);
      if (docRef) {
        const serviceWithId: Servico = {
          id: docRef.id,
          ...novoServico,
        };
        setServicos(prev => [...prev, serviceWithId]);
        setNome('');
        setDescricao('');
        setPreco('');
        setTempo('');
      }
    } catch (error) {
      console.error("Erro ao adicionar serviço: ", error);
    }
  };

  const handleExcluirServico = async (id: string) => {
    try {
      await excluirServico(id);
      setServicos(prev => prev.filter(servico => servico.id !== id));
    } catch (error) {
      console.error("Erro ao excluir serviço: ", error);
    }
  };

  return (
    <div className={styles.catalogoContainer}>
      <h1>Catálogo de Serviços</h1>

      {role === "admin" && (
        <div className={styles.addServiceContainer}>
          <h3>Adicionar Novo Serviço</h3>
          <input
            type="text"
            className={styles.input}
            placeholder="Nome do serviço"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <input
            type="number"
            className={styles.input}
            placeholder="Preço"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="Tempo"
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
          />
          <button className={styles.button} onClick={handleAdicionarServico}>
            Adicionar
          </button>
        </div>
      )}

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {servicos.map((servico: Servico) => (
          <SwiperSlide key={servico.id}>
            <div className={styles.serviceCard}>
              <ServiceCard servico={servico} />
              {role === "admin" && (
                <button
                  className={styles.button}
                  onClick={() => handleExcluirServico(servico.id)}
                >
                  Excluir
                </button>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Catalogo;
