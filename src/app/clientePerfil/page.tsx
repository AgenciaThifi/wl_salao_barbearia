"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { getCurrentUserData, updateConsumerUserData } from "@/app/services/firestoreService";
import { db } from "@/app/config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import styles from "./perfilCliente.module.css";
import useCart from "@/app/components/hooks/userCart";

export default function PerfilCliente() {
  const { user } = useUser();
  const {
    cartItems,
    loading: cartLoading,
    removeItem,
    incrementItem,
    decrementItem,
  } = useCart();

  const [agendamentos, setAgendamentos] = useState<DocumentData[]>([]);
  const [editando, setEditando] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [preferenciaEmail, setPreferenciaEmail] = useState(false);
  const [preferenciaWhatsapp, setPreferenciaWhatsapp] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchUserData() {
      try {
        const dados = await getCurrentUserData();
        setNome(dados.nome || "");
        setTelefone(dados.telefone || "");
        setEmail(user.email || "");
        setPreferenciaEmail(dados.preferencias_notificacao?.email ?? false);
        setPreferenciaWhatsapp(dados.preferencias_notificacao?.whatsapp ?? false);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    }

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;

    async function fetchAgendamentos() {
      const q = query(
        collection(db, "agendamentos"),
        where("userEmail", "==", user.email)
      );
      const snap = await getDocs(q);
      setAgendamentos(snap.docs.map((doc) => doc.data()));
    }

    fetchAgendamentos();
  }, [user]);

  const handleSalvar = async () => {
    try {
      if (!user) return;

      await updateConsumerUserData(user.uid, {
        nome,
        telefone,
        preferencias_notificacao: {
          email: preferenciaEmail,
          whatsapp: preferenciaWhatsapp,
        },
      });

      console.log("Dados atualizados com sucesso.");
      setEditando(false);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  };

  return (
    <div className={`${styles.container} max-w-2xl mx-auto`}>
      <h1 className={`${styles.title} mb-6`}>Perfil do Cliente</h1>

      {user && (
        <Card className="mb-6">
          <CardContent>
            <h2 className={`${styles.subtitle} mb-4`}>Dados da Conta</h2>
            {editando ? (
              <div className="space-y-4">
                <div>
                  <Label className={styles.label}>Nome</Label>
                  <Input
                    type="text"
                    value={nome}
                    className={styles.input}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div>
                  <Label className={styles.label}>Telefone</Label>
                  <Input
                    type="text"
                    value={telefone}
                    className={styles.input}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <Label className={styles.label}>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className={styles.input}
                  />
                </div>
                <div>
                  <Label className={styles.label}>Nova Senha (não implementado)</Label>
                  <Input
                    type="password"
                    value={senha}
                    className={styles.input}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <label className={`${styles.label} flex items-center gap-2`}>
                    <input
                      type="checkbox"
                      checked={preferenciaEmail}
                      onChange={(e) => setPreferenciaEmail(e.target.checked)}
                    />
                    Notificação por e-mail
                  </label>
                  <label className={`${styles.label} flex items-center gap-2`}>
                    <input
                      type="checkbox"
                      checked={preferenciaWhatsapp}
                      onChange={(e) => setPreferenciaWhatsapp(e.target.checked)}
                    />
                    Notificação por WhatsApp
                  </label>
                </div>
                <Button onClick={handleSalvar}>Salvar</Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className={styles.card}><strong>Nome:</strong> {nome}</p>
                <p className={styles.card}><strong>Telefone:</strong> {telefone}</p>
                <p className={styles.card}><strong>Email:</strong> {email}</p>
                <Button onClick={() => setEditando(true)}>Editar Dados</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent>
          <h2 className={`${styles.subtitle} mb-4`}>Seus Agendamentos</h2>
          {agendamentos.length === 0 ? (
            <p className={styles.card}>Você ainda não fez nenhum agendamento.</p>
          ) : (
            <ul className="space-y-2">
              {agendamentos.map((ag, idx) => (
                <li key={idx} className={`${styles.cartItem} border p-2 rounded`}>
                  <p><strong>Serviço:</strong> {ag.serviceName}</p>
                  <p><strong>Data:</strong> {ag.date} às {ag.time}</p>
                  <p><strong>Loja:</strong> {ag.storeName}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className={`${styles.subtitle} mb-4`}>Itens no Carrinho</h2>
          {cartLoading ? (
            <p className={styles.card}>Carregando carrinho...</p>
          ) : cartItems.length === 0 ? (
            <p className={styles.card}>Você ainda não adicionou produtos ao carrinho.</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className={`${styles.cartItem} flex items-center gap-4 rounded`}>
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Preço: R$ {item.price?.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => decrementItem(item.id)} className="px-2 py-1 bg-gray-200">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => incrementItem(item.id)} className="px-2 py-1 bg-gray-200">+</button>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 ml-4">Remover</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
