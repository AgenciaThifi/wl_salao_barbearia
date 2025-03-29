"use client";
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Gallery from "./pages/galeria";
import Catalogo from "./pages/catalogo";
import Agendamento from "./pages/agendamento";
import Contato from "./pages/contato";
import config from "./config.json";
import galeria from "./galeria.json";
import SalonBooking from "./components/Agenda.tsx";
import { obterGaleria, adicionarImagemManual } from "./services/firestoreService";
import { Imagem } from "./services/firestoreService";
import Image from "next/image";
import styles from './components/styles/scheduling.module.css';
import { Timestamp } from 'firebase/firestore';
import GaleriaInstagram from "./components/GaleriaInstagram";


export default function Home() {
  const [servicos, setServicos] = useState([]);
  const [galeria, setGaleria] = useState<Imagem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [url, setUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState(""); // Novo estado para armazenar URL do Instagram

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
        const imagens: Imagem[] = await obterGaleria();
        setGaleria(imagens);
      } catch (error) {
        console.error("Erro ao carregar galeria:", error);
      }
    };

    fetchServicos();
    fetchGaleria();
  }, []);

  const handleAdicionarImagem = async () => {
    if (!url.trim() || !titulo.trim()) {
      alert("Preencha o título e a URL da imagem.");
      return;
    }

    const imagemExistente = galeria.find((img) => img.instagramUrl === url);
    if (imagemExistente) {
      alert("Imagem já adicionada.");
      return;
    }

    await adicionarImagemManual(instagramUrl, titulo, descricao, true, Timestamp.now());
    setGaleria((prevGaleria) => [
      ...prevGaleria,
      {
        id: Date.now().toString(),
        titulo,
        descricao,
        instagramUrl,
        isActive: true,
        criadoEm: Timestamp.now()  // Usando Timestamp corretamente
      },
    ]);
    setTitulo("");
    setDescricao("");
    setUrl("");
    setInstagramUrl(""); // Limpar o estado após adicionar a imagem
  };

  return (
    <div style={{ backgroundColor: config.cores.primaria, color: "#fff" }}>
      <Header
        logo={config.logo}
        cabecalho={config.cabecalho}
        backgroundImage={config.backgroundImage || "url('default-background.jpg')"}
      />

      <main>
        <section id="catalogo">
          <h2>Nossos Serviços</h2>
          <Catalogo servicos={servicos} />
        </section>

        <section id="instagram">
          <GaleriaInstagram />
        </section>

        {/*
        <section id="galeria">
          <h2>Galeria de Imagens</h2>
          <div>
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL da Imagem"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
            <button onClick={handleAdicionarImagem}>Adicionar Imagem</button>
          </div>

          <div className="gallery">
            {galeria.map((img, index) => (
              <div key={index} className="relative cursor-pointer">
                {img.instagramUrl ? (
                  <img
                    src={img.instagramUrl}
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
        */}

        {/* Seção de conteúdo do Instagram com URL dinâmica 
        <section id="iframe-section">
          <h2>Conteúdo Externo</h2>
          <input
            type="text"
            placeholder="Cole a URL do post do Instagram"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
          {instagramUrl && (
            <iframe
              src={instagramUrl}
              width="100%"
              height="600px"
              style={{ border: 'none' }}
              title="Conteúdo Externo"
            ></iframe>
          )}
        </section>
        */}
        <section id="contato">
          <Contato />
        </section>

        <section id="agendamento">
          <Agendamento servicos={servicos} />
          <SalonBooking />
        </section>
      </main>

      <footer style={{ backgroundColor: config.cores.secundaria, color: "#000", padding: "10px" }}>
        <p>{config.rodape}</p>
      </footer>
    </div>
  );
}
