"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles/Navbar.module.css";
import logo from "./logo.png";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { logoutUserFirebaseAuth } from "../services/firestoreService"; // <-- Importa função de logout
import CadastroCliente from "../cadastroCliente/page"
const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { role, loading } = useUser();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUserFirebaseAuth(); // Chama função de logout
      alert("Logout realizado com sucesso!");
      router.push("/login"); // Redireciona para login
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao sair da conta.");
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Image src={logo} alt="Logo" width={100} height={50} style={{ objectFit: "cover" }} />
        </div>

        <button className={styles.menuButton} onClick={toggleMenu} aria-label="Menu">
          ☰
        </button>

        <ul className={`${styles.navList} ${isMenuOpen ? styles.open : ""}`}>
          <li className={styles.navItem}>
            <Link href="#catalogo" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              Catálogo de Serviços
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="#galeria" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              Galeria de Imagens
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="#contato" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              Contato
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="#agendamento" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              Agendamento
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/store" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              Loja
            </Link>
          </li>

          {!loading && role === "admin" && (
            <li className={styles.navItem}>
              <Link href="/admin" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Painel Administrativo
              </Link>
            </li>
          )}

          {!loading && !role && (
            <li className={styles.navItem}>
                 <Link
                  href="/cadastroCliente"
                  className={styles.navLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                Cadastro do Cliente
              </Link>
            </li>
          )}

          {!loading && role && (
            <li className={styles.navItem}>
                 <Link
                  href="/clientePerfil"
                  className={styles.navLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                Perfil
              </Link>
            </li>
          )}

          {!loading && role ? (
            <li className={styles.navItem}>
              <button className={styles.navLink} onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer" }}>
                Logout
              </button>
            </li>
          ) : (
            <li className={styles.navItem}>
              <Link href="/login" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </li>

          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
