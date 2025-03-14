"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Gallery from "./pages/galeria";
import Catalogo from "./pages/catalogo";
import Agendamento from "./pages/agendamento";
import Contato from "./pages/contato";
import config from "./config.json"; // Configurações personalizadas
import galeria from "./galeria.json"; 

export default function Home() {
  const [servicos, setServicos] = useState([]);

  // Carregar os serviços dinamicamente
  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await fetch("/servicos.json");
        const data = await response.json();
        setServicos(data); // Armazenar os serviços no estado
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    };

    fetchServicos();
  }, []);

  return (
    <div style={{ backgroundColor: config.cores.primaria, color: "#fff" }}>
      <header>
        <img src={config.logo} alt="Logo" style={{ width: "150px" }} />
        <h1>{config.cabecalho}</h1>
        <nav>
          <ul>
            <li><Link href="#catalogo">Catálogo de Serviços</Link></li>
            <li><Link href="#galeria">Galeria de Imagens</Link></li>
            <li><Link href="#contato">Contato</Link></li>
            <li><Link href="#agendamento">Agendamento</Link></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="catalogo">
          <h2>Nossos Serviços</h2>
          <Catalogo servicos={servicos} /> {/* Passando a propriedade servicos para Catalogo */}
        </section>

        <section id="galeria">
          <h2>Galeria de Imagens</h2>
          <div className="gallery">
            {galeria.map((img, index) => (
              <div key={index} className="relative cursor-pointer">
                <img
                  src={img.url}  // Usando a URL das imagens do JSON
                  alt={img.titulo}
                  style={{ width: "200px", margin: "10px" }}
                />
              </div>
            ))}
          </div>
        </section>

        <section id="contato">
          <Contato />
        </section>

        <section id="agendamento">
          <Agendamento servicos={servicos} /> {/* Passando a propriedade servicos para Agendamento */}
        </section>
      </main>

      <footer style={{ backgroundColor: config.cores.secundaria, color: "#000", padding: "10px" }}>
        <p>{config.rodape}</p>
      </footer>
    </div>
  );
}
