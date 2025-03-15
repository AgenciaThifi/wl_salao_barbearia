import React from 'react';
import Scheduling from './Scheduling';

interface SchedulingProps {
  servicos: any[];
}

const SchedulingSection: React.FC<SchedulingProps> = ({ servicos }) => {
  return (
    <section id="agendamento" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Agendamento</h2>
        <Scheduling servicos={servicos} />
      </div>
    </section>
  );
};

export default SchedulingSection;