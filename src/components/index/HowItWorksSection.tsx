import React from 'react';
import { HOW_IT_WORKS_STEPS } from '@/lib/constants';

const HowItWorksSection = () => {
  return (
    <section id="how-it-works">
      {HOW_IT_WORKS_STEPS.map((step, index) => (
        <div key={index} className="step">
          <h2>{step.title}</h2>
          <p>{step.description}</p>
        </div>
      ))}
    </section>
  );
};

export default HowItWorksSection;