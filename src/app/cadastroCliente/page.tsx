"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerConsumerUser } from "../services/firestoreService";
import styles from "./CadastroCliente.module.css";

export default function CadastroCliente() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [retirarNaLoja, setRetirarNaLoja] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [prefEmail, setPrefEmail] = useState(false);
  const [prefWhatsapp, setPrefWhatsapp] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const docId = await registerConsumerUser(
        email,
        senha,
        nome,
        telefone,
        prefEmail,
        prefWhatsapp,
        {
          cpf,
          dataNascimento,
          genero,
          endereco: retirarNaLoja
            ? null
            : { cep, rua, numero, complemento, bairro, cidade, estado },
        }
      );
      alert(`Cliente cadastrado com sucesso! ID: ${docId}`);
      router.push("/");
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      alert(error.message || "Erro ao cadastrar cliente.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de Cliente</h1>
      <form onSubmit={handleCadastro} className={styles.form}>
        <label className={styles.label}>Nome completo</label>
        <input className={styles.input} value={nome} onChange={(e) => setNome(e.target.value)} required />

        <label className={styles.label}>CPF</label>
        <input className={styles.input} value={cpf} onChange={(e) => setCpf(e.target.value)} />

        <label className={styles.label}>Data de Nascimento</label>
        <input type="date" className={styles.input} value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />

        <label className={styles.label}>Gênero</label>
        <select className={styles.select} value={genero} onChange={(e) => setGenero(e.target.value)}>
          <option value="">Selecione</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
        </select>

        <label className={styles.label}>Email</label>
        <input type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className={styles.label}>Telefone</label>
        <input className={styles.input} value={telefone} onChange={(e) => setTelefone(e.target.value)} required />

        <label className={styles.label}>
          <input type="checkbox" className={styles.checkbox} checked={retirarNaLoja} onChange={(e) => setRetirarNaLoja(e.target.checked)} />
          Deseja retirar na loja?
        </label>

        {!retirarNaLoja && (
          <>
            <label className={styles.label}>CEP</label>
            <input className={styles.input} value={cep} onChange={(e) => setCep(e.target.value)} />

            <label className={styles.label}>Rua</label>
            <input className={styles.input} value={rua} onChange={(e) => setRua(e.target.value)} />

            <label className={styles.label}>Número</label>
            <input className={styles.input} value={numero} onChange={(e) => setNumero(e.target.value)} />

            <label className={styles.label}>Complemento</label>
            <input className={styles.input} value={complemento} onChange={(e) => setComplemento(e.target.value)} />

            <label className={styles.label}>Bairro</label>
            <input className={styles.input} value={bairro} onChange={(e) => setBairro(e.target.value)} />

            <label className={styles.label}>Cidade</label>
            <input className={styles.input} value={cidade} onChange={(e) => setCidade(e.target.value)} />

            <label className={styles.label}>Estado</label>
            <input className={styles.input} value={estado} onChange={(e) => setEstado(e.target.value)} />
          </>
        )}

        <label className={styles.label}>Senha</label>
        <input type="password" className={styles.password} value={senha} onChange={(e) => setSenha(e.target.value)} required />

        <label className={styles.label}>Confirmar Senha</label>
        <input type="password" className={styles.password} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />

        <label className={styles.label}>Deseja receber promoções por:</label>
        <div className={styles.promotions}>
          <label>
            <input type="checkbox" checked={prefEmail} onChange={(e) => setPrefEmail(e.target.checked)} /> E-mail
          </label>
          <label>
            <input type="checkbox" checked={prefWhatsapp} onChange={(e) => setPrefWhatsapp(e.target.checked)} /> WhatsApp
          </label>
        </div>

        <button type="submit" className={styles.button}>Cadastrar</button>
      </form>
    </div>
  );
}
