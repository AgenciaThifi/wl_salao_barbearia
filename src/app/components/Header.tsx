"use client";

import React from "react";
import Link from "next/link";
import Navbar from "./Navbar.tsx";
import styles from "./styles/Header.module.css";
import Image from 'next/image';
import Logo from './logo.png';

interface HeaderProps {
  logo: string;
  cabecalho: string;
  backgroundImage: string;
}

const Header: React.FC<HeaderProps> = ({ cabecalho }) => {
  return (
    <header className={styles.header} style={{ height: "800px" }}>
      <Image src={Logo} alt="Logo" layout="fill" objectFit="cover" className={styles.backgroundImage} />
      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1 className={styles.title}>{cabecalho}</h1>
        </div>
        <Navbar />
      </div>
    </header>
  );
};

export default Header;