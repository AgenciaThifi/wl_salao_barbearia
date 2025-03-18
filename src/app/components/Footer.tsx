import React from 'react';

interface FooterProps {
  rodape: string;
}

const Footer: React.FC<FooterProps> = ({ rodape }) => {
  return (
    <footer className="bg-black text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p>{rodape}</p>
      </div>
    </footer>
  );
};

export default Footer;