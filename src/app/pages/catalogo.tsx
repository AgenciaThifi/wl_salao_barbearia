"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from '../components/styles/Catalogo.module.css';
import ServiceCard from '../components/ServiceCard';
import { Servico, adicionarServico, excluirServico, obterServicos, atualizarServico } from '../services/firestoreService';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/config/firebase";
import { useUser } from "../context/UserContext";

function Catalogo() {
  const { role, loading } = useUser();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [tempo, setTempo] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicos = async () => {
      const lista = await obterServicos();
      setServicos(lista);
    };
    fetchServicos();
  }, []);

  const resetCampos = () => {
    setNome('');
    setDescricao('');
    setPreco('');
    setTempo('');
    setImagem(null);
    setEditandoId(null);
  };

  const handleAdicionarOuEditarServico = async () => {
    if (!nome.trim() || !descricao.trim() || !preco.trim() || !tempo.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      let imgURL = '';

      if (imagem) {
        const imgRef = ref(storage, `servicos/${Date.now()}-${imagem.name}`);
        await uploadBytes(imgRef, imagem);
        imgURL = await getDownloadURL(imgRef);
      }

      const servicoAtualizado: Omit<Servico, "id"> = {
        nome,
        descricao,
        preco: parseFloat(preco),
        tempo,
        imagem: imgURL,
      };

      if (editandoId) {
        await atualizarServico(editandoId, {
          ...servicoAtualizado,
          imagem: imgURL || servicos.find(s => s.id === editandoId)?.imagem || ''
        });

        setServicos(prev =>
          prev.map(s =>
            s.id === editandoId ? { id: editandoId, ...servicoAtualizado, imagem: imgURL || s.imagem } : s
          )
        );
      } else {
        const docRef = await adicionarServico(servicoAtualizado);
        if (docRef) {
          setServicos(prev => [...prev, { id: docRef.id, ...servicoAtualizado }]);
        }
      }

      resetCampos();
    } catch (error) {
      console.error("Erro ao salvar serviço: ", error);
      alert("Erro ao salvar serviço.");
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

  const preencherCamposParaEdicao = (servico: Servico) => {
    setEditandoId(servico.id);
    setNome(servico.nome);
    setDescricao(servico.descricao);
    setPreco(servico.preco.toString());
    setTempo(servico.tempo);
    setImagem(null);
  };

  if (loading) return <p className={styles.loading}>Carregando...</p>;

  return (
    <div className={styles.catalogoContainer}>
      <h1 className={styles.titulo}>Catálogo de Serviços</h1>

      {role === "admin" && (
        <div className={styles.addServiceContainer}>
          <h3 className={styles.subtitulo}>{editandoId ? "Editar Serviço" : "Adicionar Novo Serviço"}</h3>
          <input type="text" className={styles.input} placeholder="Nome do serviço" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input type="text" className={styles.input} placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <input type="number" className={styles.input} placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} />
          <input type="text" className={styles.input} placeholder="Tempo" value={tempo} onChange={(e) => setTempo(e.target.value)} />
          <input type="file" className={styles.input} accept="image/*" onChange={(e) => setImagem(e.target.files?.[0] || null)} />
          <button className={styles.button} onClick={handleAdicionarOuEditarServico}>
            {editandoId ? "Salvar Alterações" : "Adicionar"}
          </button>
          {editandoId && (
            <button className={styles.cancelarButton} onClick={resetCampos}>
              Cancelar Edição
            </button>
          )}
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
                <div className={styles.botoesContainer}>
                  <button className={styles.excluirButton} onClick={() => handleExcluirServico(servico.id)}>
                    Excluir
                  </button>
                  <button className={styles.editarButton} onClick={() => preencherCamposParaEdicao(servico)}>
                    Editar
                  </button>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Catalogo;
