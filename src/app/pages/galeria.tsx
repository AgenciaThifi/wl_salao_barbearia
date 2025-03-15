"use client";
import { useState, useEffect } from "react";
import { obterGaleria, Imagem } from "../services/firestoreService"; // Importando a interface Imagem
import Image from "next/image";

export default function Gallery() {
  const [imagens, setImagens] = useState<Imagem[]>([]);  // Agora o estado usa a interface Imagem
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

  return (
    <section className="py-10 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">Galeria</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {imagens.map((imagem: Imagem) => (  // Garantindo que estamos usando o tipo Imagem aqui
          <div
            key={imagem.id}
            className="relative cursor-pointer"
            onClick={() => setSelectedImage(imagem.url)}  // Acessando a propriedade url corretamente
          >
            <Image
              src={imagem.url}  // Acessando a propriedade url corretamente
              alt={imagem.titulo}  // Acessando a propriedade titulo corretamente
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 text-white">{imagem.titulo}</div>  // Acessando a propriedade titulo corretamente
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
            <Image
              src={selectedImage}  // Acessando a imagem selecionada
              alt="Imagem Ampliada"
              width={800}
              height={500}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      )}
    </section>
  );
}
