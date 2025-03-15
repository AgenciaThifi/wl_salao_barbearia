import { useState } from "react";
import ServiceCard from "../components/ServiceCard";
import { adicionarServico, excluirServico, obterServicos } from "../services/firestoreService";
import { Servico } from "../services/firestoreService"; // Importando a interface Servico

interface CatalogoProps {
  servicos: Servico[];
  setServicos: React.Dispatch<React.SetStateAction<Servico[]>>; // Passar função para atualizar o estado
}

function Catalogo({ servicos, setServicos }: CatalogoProps) {
  const [novoServico, setNovoServico] = useState({
    nome: "",
    descricao: "",
    preco: 0,
    tempo: "",
  });

  // Função para adicionar um novo serviço
  const handleAddServico = async () => {
    // Verificar se os campos são válidos e se preço e tempo são positivos
    if (
      novoServico.nome &&
      novoServico.descricao &&
      novoServico.preco > 0 &&  // Verificando se o preço é positivo
      novoServico.tempo.trim() !== "" // Verificando se o tempo não é vazio
    ) {
      console.log("Adicionando serviço:", novoServico);
      await adicionarServico(novoServico);
      setNovoServico({ nome: "", descricao: "", preco: 0, tempo: "" });
    } else {
      // Exibe um alerta caso os dados sejam inválidos
      alert("Por favor, insira valores válidos para todos os campos. O preço deve ser positivo e o tempo não pode estar vazio.");
    }
  };

  // Função para excluir um serviço
  const handleDeleteServico = async (id: string) => {
    await excluirServico(id);

    // Recarrega os serviços após excluir
    const dados = await obterServicos();
    setServicos(dados); // Atualiza o estado servicos após excluir
  };

  return (
    <div>
      <h1>Catálogo de Serviços</h1>

      <div>
        <h3>Adicionar Novo Serviço</h3>
        <input
          type="text"
          value={novoServico.nome}
          onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
          placeholder="Nome do serviço"
        />
        <input
          type="text"
          value={novoServico.descricao}
          onChange={(e) => setNovoServico({ ...novoServico, descricao: e.target.value })}
          placeholder="Descrição"
        />
        <input
          type="number"
          value={novoServico.preco}
          onChange={(e) => setNovoServico({ ...novoServico, preco: parseFloat(e.target.value) })}
          placeholder="Preço"
        />
        <input
          type="text"
          value={novoServico.tempo}
          onChange={(e) => setNovoServico({ ...novoServico, tempo: e.target.value })}
          placeholder="Tempo"
        />
        <button onClick={handleAddServico}>Adicionar</button>
      </div>

      <div>
        {servicos.map((servico) => (
          <div key={servico.id} className="service-card">
            <ServiceCard servico={servico} />
            <button onClick={() => handleDeleteServico(servico.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
