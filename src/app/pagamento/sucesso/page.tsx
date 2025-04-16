"use client";
import { useEffect } from "react";
import { db } from "@/app/config/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function Sucesso() {
  useEffect(() => {
    const atualizarEstoque = async () => {
      const dados = localStorage.getItem("compraFinalizada");
      if (!dados) return;

      const produtos = JSON.parse(dados);
      for (const item of produtos) {
        const newStock = item.product.stock - item.quantity;
        const ref = doc(db, "produtos", item.product.id);
        await updateDoc(ref, { stock: newStock });
      }

      localStorage.removeItem("compraFinalizada");
    };

    atualizarEstoque();
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", color: "green" }}>✅ Pagamento aprovado!</h1>
      <p>Obrigado pela sua compra. Seu pagamento foi processado com sucesso.</p>
      <a href="/" style={{ color: "blue", textDecoration: "underline" }}>
        Voltar para a loja
      </a>
    </div>
  );
}
