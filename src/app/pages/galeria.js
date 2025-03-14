"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Gallery() {
  const [imagens, setImagens] = useState([]);

  // Carregar as imagens do arquivo galeria.json
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/galeria.json");
        const data = await response.json();
        setImagens(data); // Armazenar as imagens no estado
      } catch (error) {
        console.error("Erro ao carregar imagens:", error);
      }
    };
    fetchImages();
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section className="py-10 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">Galeria</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {imagens.map((imagem) => (
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
              src={selectedImage}
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
