// components/ServiceCard.js
import styles from './styles/Service.module.css';

function ServiceCard({ servico }) {
  // Suporta tanto 'imageUrl' (novo) quanto 'imagem' (antigo)
  const imageSrc = servico.imageUrl || servico.imagem || "";

  // Garante toFixed mesmo se preco vier como string ou número
  const price = typeof servico.preco === "number"
    ? servico.preco.toFixed(2)
    : parseFloat(servico.preco || "0").toFixed(2);

  return (
    <div className={styles.card}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={servico.nome}
          className={styles.img}
        />
      )}
      <h2 className={styles.nome}>{servico.nome}</h2>
      <p className={styles.descricao}>{servico.descricao}</p>
      <p>
        <strong>Preço:</strong> R${price}
      </p>
      <p>
        <strong>Tempo:</strong> {servico.tempo} minutos
      </p>
    </div>
  );
}

export default ServiceCard;
