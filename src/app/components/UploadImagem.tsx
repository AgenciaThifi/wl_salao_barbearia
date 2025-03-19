"use client";
import { useState } from "react";
import { uploadImagem } from "../services/firestoreService";

export default function UploadImagem({ onUpload }: { onUpload: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [isActive, setIsActive] = useState(true); // Imagem ativa por padrão
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !titulo.trim() || !instagramUrl.trim()) {
      alert("Por favor, selecione uma imagem, preencha o título e o URL do Instagram.");
      return;
    }

    setLoading(true);
    try {
      // Chamada à função para upload da imagem
      await uploadImagem(file, titulo, descricao, instagramUrl, isActive);
      alert("Imagem enviada com sucesso!");
      setFile(null);
      setTitulo("");
      setDescricao("");
      setInstagramUrl("");
      setIsActive(true); // Resetando o estado de isActive para true após o upload
      onUpload(); // Atualiza a galeria após o upload
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem.");
    } finally {
      setLoading(false); // Garantir que o loading seja desmarcado após o processo
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <h3 className="text-lg font-bold mb-2">Enviar Nova Imagem</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2 w-full" />
      
      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      
      <textarea
        placeholder="Descrição (opcional)"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <input
        type="text"
        placeholder="URL do Instagram"
        value={instagramUrl}
        onChange={(e) => setInstagramUrl(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      
      <label className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="mr-2"
        />
        Imagem Ativa
      </label>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </div>
  );
}
