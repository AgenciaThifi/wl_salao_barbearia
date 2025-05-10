"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import SalaoNome from "../components/SalaoNome";
import styles from "../components/styles/Profissionais.module.css";

 // crie esse CSS conforme o visual do catálogo

interface Profissional {
  id: string;
  nome: string;
  instagram: string;
  atuacao: string;
  imagem: string;
  id_loja: string;
}

export default function ProfissionaisSection() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  useEffect(() => {
    const fetchProfissionais = async () => {
      const querySnapshot = await getDocs(collection(db, "profissionais"));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Profissional[];
      setProfissionais(list);
    };

    fetchProfissionais();
  }, []);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Nossa Equipe</h2>
      <div className={styles.grid}>
        {profissionais.map((p) => (
          <div key={p.id} className={styles.card}>
            <img src={p.imagem} alt={p.nome} className={styles.image} />
            <h3 className={styles.nome}>{p.nome}</h3>
            <p className={styles.atuacao}>{p.atuacao}</p>
            <p className={styles.instagram}>@{p.instagram}</p>
            <div className={styles.salaoInfo}>
              <SalaoNome idLoja={p.id_loja} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
