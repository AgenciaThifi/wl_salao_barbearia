"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from '../components/styles/Catalogo.module.css';
import ServiceCard from '../components/ServiceCard';
import { Servico, obterServicos } from '../services/firestoreService'; // Mantemos apenas Servico e obterServicos

function Catalogo() {
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const lista = await obterServicos();
        setServicos(lista);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    };
    fetchServicos();
  }, []);

  return (
    <div className={styles.catalogoContainer}>
      <h1 className={styles.titulo}>Catálogo de Serviços</h1>
      
      {/* Apenas o carrossel, sem inserção e sem botões de edição/exclusão */}
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
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Catalogo;
