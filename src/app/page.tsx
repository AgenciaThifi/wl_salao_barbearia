"use client";
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Gallery from "./pages/galeria";
import Catalogo from "./pages/catalogo";
import Agendamento from "./pages/agendamento";
import Contato from "./pages/contato";
import config from "./config.json";
import { obterGaleria, adicionarImagemManual } from "./services/firestoreService";
import { Imagem } from "./services/firestoreService";

import Image from "next/image";
import styles from './components/styles/scheduling.module.css';

export default function Home() {
  // State
  const [servicos, setServicos] = useState([]);
  const [galeria, setGaleria] = useState<Imagem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [url, setUrl] = useState("");

  // Effects
  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await fetch("/servicos.json");
        const data = await response.json();
        setServicos(data);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    };

    const fetchGaleria = async () => {
      try {
        const imagens: Imagem[] = await obterGaleria(); // Certifique-se de que obterGaleria retorna Imagem[]
        setGaleria(imagens);
      } catch (error) {
        console.error("Erro ao carregar galeria:", error);
      }
    };

    fetchServicos();
    fetchGaleria();
  }, []);

  // Função para adicionar imagem manualmente
  const handleAdicionarImagem = async () => {
    if (!url.trim() || !titulo.trim()) {
      alert("Preencha o título e a URL da imagem.");
      return;
    }

    // Verifica se a imagem já existe
    const imagemExistente = galeria.find((img) => img.url === url);
    if (imagemExistente) {
      alert("Imagem já adicionada.");
      return;
    }

    // Adiciona a nova imagem
    await adicionarImagemManual(url, titulo, descricao);
    setGaleria((prevGaleria) => [
      ...prevGaleria,
      { id: Date.now().toString(), titulo, descricao, url },
    ]);
    setTitulo("");
    setDescricao("");
    setUrl("");
  };

  return (
    <div style={{ backgroundColor: config.cores.primaria, color: "#fff" }}>
      {/* Header Component */}
      <Header
        logo={config.logo}
        cabecalho={config.cabecalho}
        backgroundImage={config.backgroundImage || "url('default-background.jpg')"}
      />

      {/* Main Content */}
      <main>
        {/* Catalog Section */}
        <section id="catalogo">
          <h2>Nossos Serviços</h2>
          <Catalogo servicos={servicos} />
        </section>

        {/* Gallery Section */}
        <section id="galeria">
          <h2>Galeria de Imagens</h2>

          {/* Formulário para adicionar imagem manualmente */}
          <div>
            <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            <input type="text" placeholder="URL da Imagem" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button onClick={handleAdicionarImagem}>Adicionar Imagem</button>
          </div>

          {/* Exibição da galeria */}
          <div className="gallery">
            {galeria.map((img, index) => (
              <div key={index} className="relative cursor-pointer">
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.titulo || "Imagem sem título"}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <p>Imagem não disponível</p>
                )}
                <p>{img.titulo}</p>
                <p>{img.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contato">
          <Contato />
        </section>

        {/* Scheduling Section */}
        <section id="agendamento">
          <div className={styles.agendamento}>
            <Agendamento servicos={servicos} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: config.cores.secundaria, color: "#000", padding: "10px" }}>
        <p>{config.rodape}</p>
      </footer>
    </div>
  );
}
