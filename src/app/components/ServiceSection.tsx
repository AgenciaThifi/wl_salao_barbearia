import React from 'react';
import Catalogo from "../pages/catalogo";
import ServiceCard from '../ServiceCard';

interface ServicesProps {
  servicos: any[];
}

const ServicesSection: React.FC<ServicesProps> = ({ servicos }) => {
  return (
    <section id="catalogo" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Nossos Serviços</h2>
        <Catalogo servicos={servicos} />
      </div>
    </section>
  );
};

export default ServicesSection;