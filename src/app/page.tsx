"use client";
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Catalogo from "./pages/catalogo";
import Contato from "./pages/contato";
import config from "./config.json";
import SalonBooking from "./components/Agenda";
import GaleriaInstagram from "./components/GaleriaInstagram";
import { Servico, obterServicos } from "./services/firestoreService";
import FloatingContact from "./components/FloatingContact";


export default function Home() {
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const data = await obterServicos();
        setServicos(data);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    };
    fetchServicos();
  }, []);

  return (
    <div style={{ backgroundColor: config.cores.primaria, color: "#fff" }}>
      <Header
        logo={config.logo}
        cabecalho={config.cabecalho}
        backgroundImage={config.backgroundImage || "url('default-background.jpg')"}
      />

      <main>
        <section id="catalogo">
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
      <FloatingContact />
      <footer style={{ backgroundColor: config.cores.secundaria, color: "#000", padding: "10px" }}>
        <p>{config.rodape}</p>
      </footer>
    </div>
  );
}
