"use client";
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Gallery from "./pages/galeria";
import Catalogo from "./pages/catalogo";
import Agendamento from "./pages/agendamento";
import Contato from "./pages/contato";
import config from "./config.json";
import galeria from "./galeria.json";
import SalonBooking from "./components/Agenda";
import { obterGaleria, adicionarImagemManual } from "./services/firestoreService";
import { Imagem } from "./services/firestoreService";
import Image from "next/image";
import styles from './components/styles/scheduling.module.css';
import { Timestamp } from 'firebase/firestore';
import GaleriaInstagram from "./components/GaleriaInstagram";
import { Servico, obterServicos } from "./services/firestoreService";



export default function Home() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [galeria, setGaleria] = useState<Imagem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [url, setUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState(""); // Novo estado para armazenar URL do Instagrammmmmmmmmm

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const data = await obterServicos();
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
          <Catalogo servicos={servicos} setServicos={setServicos} />
        </section>

        <section id="instagram">
          <GaleriaInstagram />
        </section>
        
        <section id="contato">
          <Contato />
        </section>

        <section id="agendamento">
        <SalonBooking servicos={servicos} />
        </section>
      </main>

      <footer style={{ backgroundColor: config.cores.secundaria, color: "#000", padding: "10px" }}>
        <p>{config.rodape}</p>
      </footer>
    </div>
  );
}
