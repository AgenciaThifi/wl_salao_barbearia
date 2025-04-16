"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles/Navbar.module.css";
import logo from "./logo.png";
import { useUser } from "../context/UserContext"; // Importa o contexto

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { role, loading } = useUser(); // Usa o role

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

          {/* Exibe funcionalidades de admin quando role for admin */}
          {!loading && role === "admin" && (
            <>
              <li className={styles.navItem}>
                <Link href="/admin" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                  Painel Administrativo
                </Link>
              </li>
            </>
          )}

          <li className={styles.navItem}>
            <Link href="/login" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
