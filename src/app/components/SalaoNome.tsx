"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";

interface SalaoNomeProps {
  idLoja: string;
}

export default function SalaoNome({ idLoja }: SalaoNomeProps) {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");

  useEffect(() => {
    const fetchLoja = async () => {
      if (!idLoja) return;
      try {
        const docRef = doc(db, "stores", idLoja);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNome(data.name || "Nome não disponível");
          setEndereco(data.address || "Endereço não disponível");
        } else {
          setNome("Loja não encontrada");
          setEndereco("");
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
        setNome("Erro ao carregar loja");
      }
    };

    fetchLoja();
  }, [idLoja]);

  return (
    <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "4px" }}>
      <div><strong>Salão:</strong> {nome}</div>
      <div><strong>Endereço:</strong> {endereco}</div>
    </div>
  );
}
