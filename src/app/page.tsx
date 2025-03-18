"use client";

import { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Gallery from "./pages/galeria";
import Catalogo from "./pages/catalogo";
import Agendamento from "./pages/agendamento";
import Contato from "./pages/contato";
import config from "./config.json";
import galeria from "./galeria.json";

import Image from "next/image";
import AgendamentoForm from "./pages/agendamento/AgendamentoForm";
import ListaAgendamentos from "./pages/agendamento/ListaAgendamentos";
import { Servico, obterAgendamentos, obterServicos } from "./services/firestoreService";  // Função para obter serviços do Firestore
import { Imagem, obterGaleria } from "./services/firestoreService";  // Função de upload
import UploadImagem from "./components/UploadImagem";
import styles from './components/styles/scheduling.module.css';

export default function Home() {
  // State
  const [servicos, setServicos] = useState([]);

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

    fetchServicos();
  }, []);

  // Component rendering
  return (
    <div style={{ backgroundColor: config.cores.primaria, color: "#fff" }}>
      {/* Header Component */}
      <Header logo={config.logo} cabecalho={config.cabecalho} />

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
          <div className="gallery">
            {galeria.map((img, index) => (
              <div key={index} className="relative cursor-pointer">
                {img.url ? (
                  <Image
                    src={img.url}
                    alt={img.titulo}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <p>Imagem não disponível</p>
                )}
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