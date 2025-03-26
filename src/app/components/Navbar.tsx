"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles/Navbar.module.css';
import logo from './logo.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <div className={styles.logo}>
          <Image src={logo} alt="Logo" width={100} height={50} />
        </div>
        
        {/* Mobile menu button */}
        <button 
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          ☰
        </button>

        {/* Navigation links */}
        <ul className={`${styles.navList} ${isMenuOpen ? styles.open : ''}`}>
          <li className={styles.navItem}>
            <Link 
              href="/pages/catalogo" 
              className={styles.navLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Catálogo de Serviços
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/pages/galeria" 
              className={styles.navLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Galeria de Imagens
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/pages/contato" 
              className={styles.navLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/pages/agendamento" 
              className={styles.navLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Agendamento
            </Link>
          </li>
          <li className={styles.navItem}>
          <Link href="/ProductSale" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
            Produtos à Venda
          </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
