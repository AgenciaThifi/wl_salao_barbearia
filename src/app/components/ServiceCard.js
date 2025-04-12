import styles from './styles/Service.module.css';

function ServiceCard({ servico }) {
  return (
    <div className={styles.card}>
      {servico.imagem && (
        <img
          src={servico.imagem}
          alt={servico.nome}
          className={styles.img}
        />
      )}
      <h2 className={styles.nome}>{servico.nome}</h2>
      <p className={styles.descricao}>{servico.descricao}</p>
      <p><strong>Preço:</strong> R${parseFloat(servico.preco).toFixed(2)}</p>
      <p><strong>Tempo:</strong> {servico.tempo} minutos</p>
    </div>
  );
}

export default ServiceCard;
