import React from 'react';
import { HeartPulse, CheckCircle } from 'lucide-react';

const About = () => {
  const values = [
    { title: "Safe & Authenticated", desc: "All medications are sourced directly from certified manufacturers and checked thoroughly by in-house pharmacy experts." },
    { title: "Customer Centric", desc: "Our patients are at the heart of everything we do. We offer standard support channels to guarantee your safety." },
    { title: "Pristine Standards", desc: "Zero compromise on hygiene, storage temperature, or dispatch controls. We maintain clinical perfection." },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <HeartPulse size={48} className="text-primary mx-auto" />
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">About Pharma.com</h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          Migrated from our legacy platform to a modern, clinical, high-performance portal, 
          we deliver professional pharmaceutical care directly to your device screen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {values.map((v, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 space-y-4">
            <div className="text-primary"><CheckCircle size={28} /></div>
            <h3 className="font-bold text-slate-800 text-lg">{v.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
