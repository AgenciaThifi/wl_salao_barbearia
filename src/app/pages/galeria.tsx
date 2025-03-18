"use client";
import { useState, useEffect } from "react";
import { obterGaleria, Imagem } from "../services/firestoreService"; // Importando a interface Imagem
import Image from "next/image";
import styles from './styles/Gallery.module.css'; // Importando o CSS Module

export default function Gallery() {
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagens = await obterGaleria();
        setImagens(imagens);
      } catch (error) {
        console.error("Erro ao carregar imagens:", error);
      }
    };
    fetchImages();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? imagens.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === imagens.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section className={styles.galleryContainer}>
      <h2 className={styles.galleryTitle}>Galeria</h2>
      
      <div className={styles.carousel}>
        <button className={styles.prevButton} onClick={handlePrev}>❮</button>
        
        <div className={styles.carouselTrack} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {imagens.map((imagem: Imagem, index) => (
            <div key={imagem.id} className={styles.carouselItem} onClick={() => setSelectedImage(imagem.url)}>
              <Image
                src={imagem.url}
                alt={imagem.titulo}
                width={600}
                height={400}
                className={styles.image}
              />
              <div className={styles.imageTitle}>{imagem.titulo}</div>
            </div>
          ))}
        </div>

        <button className={styles.nextButton} onClick={handleNext}>❯</button>
      </div>

      {/* Modal de Imagem */}
      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent}>
            <Image
              src={selectedImage}
              alt="Imagem Ampliada"
              width={800}
              height={500}
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </section>
  );
}
