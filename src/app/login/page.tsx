"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerConsumerUser, loginUserFirebaseAuth } from "../services/firestoreService";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [prefEmail, setPrefEmail] = useState(false);
  const [prefWhatsapp, setPrefWhatsapp] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1) Faz login no Auth
      await loginUserFirebaseAuth(email, senha);
  
      // 2) Pronto, onAuthStateChanged dispara => UserContext define role
      alert("Login bem-sucedido!");
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Ocorreu um erro ao fazer login.");
    }
  };
  
  

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docId = await registerConsumerUser(
        email,
        senha,
        nome,
        telefone,
        prefEmail,
        prefWhatsapp
      );

      alert(`Usuário registrado com sucesso! ID: ${docId}`);
      router.push("/");
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error);
      alert(error.message || "Ocorreu um erro ao registrar.");
    }
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f7f7f7",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    padding: "24px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    margin: "8px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "16px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "16px" }}>
          {isRegister ? "Registro" : "Login"}
        </h1>

        <form
          onSubmit={isRegister ? handleRegister : handleLogin}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <label style={{ textAlign: "left" }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <label style={{ textAlign: "left" }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={inputStyle}
            required
          />

          {isRegister && (
            <>
              <label style={{ textAlign: "left" }}>Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={inputStyle}
                required
              />

              <label style={{ textAlign: "left" }}>Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                style={inputStyle}
                required
              />

              <label style={{ textAlign: "left" }}>Preferências de Notificação</label>
              <div style={{ textAlign: "left", marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  checked={prefEmail}
                  onChange={(e) => setPrefEmail(e.target.checked)}
                  id="prefEmail"
                />
                <label htmlFor="prefEmail" style={{ marginLeft: "4px" }}>
                  E-mail
                </label>
              </div>
              <div style={{ textAlign: "left", marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  checked={prefWhatsapp}
                  onChange={(e) => setPrefWhatsapp(e.target.checked)}
                  id="prefWhatsapp"
                />
                <label htmlFor="prefWhatsapp" style={{ marginLeft: "4px" }}>
                  WhatsApp
                </label>
              </div>
            </>
          )}

          <button type="submit" style={buttonStyle}>
            {isRegister ? "Registrar" : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: "16px" }}>
          {isRegister ? (
            <span>
              Já tem conta?{" "}
              <a
                href="#"
                style={{ color: "#4CAF50" }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(false);
                }}
              >
                Faça login
              </a>
            </span>
          ) : (
            <span>
              Não tem conta?{" "}
              <a
                href="#"
                style={{ color: "#4CAF50" }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(true);
                }}
              >
                Registre-se
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
