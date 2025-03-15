"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Catalogo from "./pages/catalogo";
import Contato from "./pages/contato";
import config from "./config.json";
import galeria from "./galeria.json";
import AgendamentoForm from "./pages/agendamento/AgendamentoForm";
import ListaAgendamentos from "./pages/agendamento/ListaAgendamentos";
import { Servico, obterAgendamentos, obterServicos } from "./services/firestoreService";  // Função para obter serviços do Firestore

export default function Home() {
  const [servicos, setServicos] = useState<Servico[]>([]); // Tipo de serviço definido
  const [agendamentos, setAgendamentos] = useState<{ id: string; nome: string; telefone: string; horario: string; }[]>([]);

   // Carregar os serviços dinamicamente do Firestore
   useEffect(() => {
    const fetchServicos = async () => {
      try {
        const dados = await obterServicos(); // Busca serviços no Firestore
        console.log("Serviços carregados:", dados); // Adicione este log para verificar
        setServicos(dados);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    };
    fetchServicos();
  }, []);
  
  // Função para carregar os agendamentos
  useEffect(() => {
    async function carregarAgendamentos() {
      const dados = await obterAgendamentos();

      // Define o tipo correto para os agendamentos
      const agendamentosCorrigidos = dados.map((agendamento: { id: string; nome?: string; telefone?: string; horario?: string }) => ({
        id: agendamento.id,
        nome: agendamento.nome || "",
        telefone: agendamento.telefone || "",
        horario: agendamento.horario || ""
      }));

      setAgendamentos(agendamentosCorrigidos);
    }
    carregarAgendamentos();
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
          <Catalogo servicos={servicos} setServicos={setServicos} /> {/* Passando setServicos */}
        </section>

        <section id="galeria">
          <h2>Galeria de Imagens</h2>
          <div className="gallery">
            {galeria.map((img, index) => (
              <div key={index} className="relative cursor-pointer">
                <img src={img.url} alt={img.titulo} style={{ width: "200px", margin: "10px" }} />
              </div>
            ))}
          </div>
        </section>

        <section id="contato">
          <Contato />
        </section>

        <section id="agendamento">
          <h2>Agendamento</h2>
          <AgendamentoForm setAgendamentos={setAgendamentos} />
          <ListaAgendamentos agendamentos={agendamentos} />
        </section>
      </main>

      <footer style={{ backgroundColor: config.cores.secundaria, color: "#000", padding: "10px" }}>
        <p>{config.rodape}</p>
      </footer>
    </div>
  );
}
