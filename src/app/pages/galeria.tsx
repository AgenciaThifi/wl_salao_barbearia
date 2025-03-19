"use client";
import { useState, useEffect } from "react";
import { obterGaleria, adicionarImagemManual, Imagem } from "../services/firestoreService";
import Image from "next/image";
import UploadImagem from "../components/UploadImagem";
import styles from "./styles/Gallery.module.css";
import { Timestamp } from 'firebase/firestore';

export default function Gallery() {
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState(""); // URL do Instagram para adicionar manualmente
  const [manualTitulo, setManualTitulo] = useState("");
  const [manualDescricao, setManualDescricao] = useState("");

  const carregarImagens = async () => {
    try {
      const imagens = await obterGaleria();
      setImagens(imagens);
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    }
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? imagens.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === imagens.length - 1 ? 0 : prevIndex + 1));
  };

  const handleAdicionarManual = async () => {
    if (!instagramUrl.trim() || !manualTitulo.trim()) {
      alert("Preencha todos os campos.");
      return;
    }
  
    const imagemExistente = imagens.find((imagem) => imagem.instagramUrl === instagramUrl);
    if (imagemExistente) {
      alert("Imagem já adicionada.");
      return;
    }
  
    try {
      await adicionarImagemManual(instagramUrl, manualTitulo, manualDescricao, true, Timestamp.now());
      alert("Imagem adicionada com sucesso!");
  
      const novaImagem: Imagem = {
        id: Date.now().toString(),
        titulo: manualTitulo,
        descricao: manualDescricao,
        instagramUrl,
        isActive: true,
        criadoEm: Timestamp.now(), // Simulando a adição manual da imagem
      };
      setImagens((prevImagens) => [...prevImagens, novaImagem]);
  
      // Limpa os campos de entrada
      setInstagramUrl("");
      setManualTitulo("");
      setManualDescricao("");
    } catch (error) {
      console.error("Erro ao adicionar imagem manual:", error);
      alert("Erro ao adicionar imagem.");
    }
  };
  

  return (
    <section className={styles.galleryContainer}>
      <h2 className={styles.galleryTitle}>Galeria</h2>

      <UploadImagem onUpload={carregarImagens} /> {/* Upload de imagem */}

      <div className={styles.manualInputContainer}>
        <input
          type="text"
          placeholder="URL do Instagram"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          className={styles.manualInput}
        />
        <input
          type="text"
          placeholder="Título da Imagem"
          value={manualTitulo}
          onChange={(e) => setManualTitulo(e.target.value)}
          className={styles.manualInput}
        />
        <button onClick={handleAdicionarManual} className={styles.manualButton}>
          Adicionar
        </button>
      </div>

      <div className={styles.carousel}>
        <button className={styles.prevButton} onClick={handlePrev}>❮</button>

        <div className={styles.carouselTrack} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {imagens.map((imagem: Imagem) => (
            <div key={imagem.id} className={styles.carouselItem} onClick={() => setSelectedImage(imagem.instagramUrl || null)}>
              <Image
                src={imagem.instagramUrl || '/default-image.jpg'} // Aqui, você pode usar uma imagem padrão caso não haja URL
                alt={imagem.titulo || 'Imagem sem título'}
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
