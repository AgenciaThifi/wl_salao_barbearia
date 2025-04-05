import styles from './styles/Service.module.css';
function ServiceCard({ servico }) {
    return (
      <div className="service-card">
        <h2>{servico.nome}</h2>
        <p>{servico.descricao}</p>
        <p><strong>Preço:</strong> R${servico.preco}</p>
        <p><strong>Tempo:</strong> {servico.tempo} minutos</p>
      </div>
    );
  }
  
  export default ServiceCard;
  