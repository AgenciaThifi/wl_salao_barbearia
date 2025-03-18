"use client";
import { useState, useEffect } from "react";
import { obterGaleria, Imagem } from "../services/firestoreService"; // Importando a interface Imagem
import Image from "next/image";
import UploadImagem from "../components/UploadImagem"; // Importa o componente de upload


export default function Gallery() {
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  return (
    <section className="py-10 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">Galeria</h2>

      {/* Formulário de Upload */}
      <UploadImagem onUpload={carregarImagens} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        {imagens.map((imagem: Imagem) => (
          <div
            key={imagem.id}
            className="relative cursor-pointer"
            onClick={() => setSelectedImage(imagem.url)}
          >
            <Image
              src={imagem.url}
              alt={imagem.titulo}
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 text-white">{imagem.titulo}</div>
          </div>
        ))}
      </div>

      {/* Modal de Imagem */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <Image src={selectedImage} alt="Imagem Ampliada" width={800} height={500} className="rounded-lg object-cover" />
          </div>
        </div>
      )}
    </section>
  );
}
