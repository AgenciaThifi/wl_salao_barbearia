"use client";
import { useState } from "react";

// Tipo para os dados do serviço
const Scheduling = ({ servicos = [] }) => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [servico, setServico] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const mensagem = `Olá, gostaria de agendar o serviço ${servico} para o dia ${data} às ${hora}. Meu nome é ${nome} e meu telefone é ${telefone}.`;

    const numeroWhatsApp = "+5561982541672";
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    window.open(urlWhatsApp, "_blank");
    alert(`Agendamento para ${nome}, ${servico} em ${data} às ${hora}.`);
  };

  return (
    <div className="agendamento">
      <h2>Preencha os campos abaixo</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Telefone:</label>
          <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        </div>
        <div>
          <label>Data:</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        </div>
        <div>
          <label>Hora:</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
        </div>
        <div>
          <label>Serviço:</label>
          <select value={servico} onChange={(e) => setServico(e.target.value)} required>
            <option value="">Selecione um serviço</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.nome}>
                {s.nome} - R$ {s.preco.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Agendar</button>
      </form>
    </div>
  );
};

export default Scheduling;
