import Scheduling from "../components/Scheduling";  // Importando o componente Agendamento

const Contato = ({ servicos }) => {  // Deixe a constante com o nome Contato
  return (
    <div>
      <h1>Agende um horário conosco!</h1>
      <Scheduling servicos={servicos} /> {/* Passando servicos para o componente Scheduling */}
    </div>
  );
};

export default Contato;
