// components/FloatingContact.tsx
"use client";

import { useState } from "react";
import styles from "./styles/FloatingContact.module.css";
import { FaInstagram, FaWhatsapp, FaEnvelope, FaPlus, FaTimes } from "react-icons/fa";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.links}>
          <a
            href="https://www.instagram.com/thifi.agency"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <FaInstagram />
          </a>
          <a
            href="https://wa.me/61994524393"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <FaWhatsapp />
          </a>
          <a
            href="mailto:thifi.contato.oficial@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <FaEnvelope />
          </a>
        </div>
      )}
<button
  className={styles.toggleButton}
  onClick={() => setIsOpen(!isOpen)}
>
  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>@</span>
</button>
    </div>
  );
}
