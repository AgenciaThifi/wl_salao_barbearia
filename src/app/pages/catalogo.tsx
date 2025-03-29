import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

import styles from '../components/styles/Catalogo.module.css';
import ServiceCard from '../components/ServiceCard';

function Catalogo({ servicos, setServicos }: CatalogoProps) {
  return (
    <div className={styles.catalogoContainer}>
      <h1>Catálogo de Serviços</h1>

      <div className={styles.addServiceContainer}>
        <h3>Adicionar Novo Serviço</h3>
        <input type="text" className={styles.input} placeholder="Nome do serviço" />
        <input type="text" className={styles.input} placeholder="Descrição" />
        <input type="number" className={styles.input} placeholder="Preço" />
        <input type="text" className={styles.input} placeholder="Tempo" />
        <button className={styles.button}>Adicionar</button>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 }, // 2 cards por vez no tablet
          1024: { slidesPerView: 3 }, // 3 cards por vez no desktop
        }}
      >
        {servicos.map((servico) => (
          <SwiperSlide key={servico.id}>
            <div className={styles.serviceCard}>
              <ServiceCard servico={servico} />
              <button className={styles.button}>Excluir</button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Catalogo;
