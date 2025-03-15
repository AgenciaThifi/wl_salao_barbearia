"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar.tsx';

interface HeaderProps {
  logo: string;
  cabecalho: string;
}

const Header: React.FC<HeaderProps> = ({ logo, cabecalho }) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-4">
      <div className="flex items-center mb-4 md:mb-0">
        <img src={logo} alt="Logo" style={{ width: "150px" }} />
        <h1 className="ml-4 text-2xl font-bold">{cabecalho}</h1>
      </div>
      <Navbar />
    </header>
  );
};

export default Header;