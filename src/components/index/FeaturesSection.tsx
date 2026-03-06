import React from 'react';
import { Vote, Users, BarChart3, Shield, Lock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { FEATURES_DATA } from '@/lib/constants';

const iconMap = {
  Vote,
  Users,
  BarChart3,
  Shield,
  Lock,
  FileText
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Infraestrutura Eleitoral Digital de Alta Confiabilidade
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Cada módulo foi desenhado para garantir segurança, conformidade legal e autonomia total em processos eleitorais internos.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES_DATA.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
            
            return (
              <motion.div
                key={index}
                className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.015] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  {IconComponent && <IconComponent className="w-6 h-6 text-blue-600" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
