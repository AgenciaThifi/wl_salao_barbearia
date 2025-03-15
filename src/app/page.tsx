"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Catalogo from "./pages/catalogo";
import Contato from "./pages/contato";
import config from "./config.json";
import galeria from "./galeria.json";
import Image from "next/image";
import AgendamentoForm from "./pages/agendamento/AgendamentoForm";
import ListaAgendamentos from "./pages/agendamento/ListaAgendamentos";
import { Servico, obterAgendamentos, obterServicos } from "./services/firestoreService";  // Função para obter serviços do Firestore
import { Imagem, obterGaleria } from "./services/firestoreService";  // Função de upload

export default function Home() {
  const [servicos, setServicos] = useState<Servico[]>([]); // Tipo de serviço definido
  const [agendamentos, setAgendamentos] = useState<{ id: string; nome: string; telefone: string; horario: string; }[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);  // Variável para armazenar imagens


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

  // Função para carregar as imagens do Firestore (agora com as imagens armazenadas no Firebase)
  useEffect(() => {
    const fetchImagens = async () => {
      try {
        const imagensFromDB = await obterGaleria(); // Alterado para chamar a função correta
        setImagens(imagensFromDB);
      } catch (error) {
        console.error("Erro ao carregar imagens:", error);
      }
    };
    fetchImagens();
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
          <div className="gallery grid grid-cols-2 sm:grid-cols-3 gap-4">
            {imagens.map((img: Imagem, index: number) => (
              <div key={index} className="relative cursor-pointer">
                {img.url ? (
                  <Image
                    src={img.url} // Acessando a propriedade url
                    alt={img.titulo} // Acessando a propriedade titulo
                    width={200} // Ajuste o tamanho conforme necessário
                    height={200} // Ajuste o tamanho conforme necessário
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <p>Imagem não disponível</p> // Opcional: mensagem caso a imagem não esteja disponível
                )}
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
