import styles from '../components/styles/Catalogo.module.css';
import ServiceCard from '../components/ServiceCard';
function Catalogo({ servicos, setServicos }: CatalogoProps) {
  return (
    <div className={styles.catalogoContainer}>
        <h1>Catálogo de Serviços</h1>

      <div className={styles.addServiceContainer}>
        <h3>Adicionar Novo Serviço</h3>
        <input type="text" className={styles.input} placeholder="Nome do serviço" />
        <input type="text" className={styles.input} placeholder="Descrição" />
        <input type="number" className={styles.input} placeholder="Preço" />
        <input type="text" className={styles.input} placeholder="Tempo" />
        <button className={styles.button}>Adicionar</button>
      </div>

      <div className={styles.serviceList}>
        {servicos.map((servico) => (
          <div key={servico.id} className={styles.serviceCard}>
            <ServiceCard servico={servico} />
            <button className={styles.button}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
