import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { HERO_SECTION_DATA } from '@/lib/constants';

const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            {HERO_SECTION_DATA.badgeText}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {HERO_SECTION_DATA.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {HERO_SECTION_DATA.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {HERO_SECTION_DATA.buttons.map((button, index) => (
              <Button
                key={index}
                asChild
                size="lg"
                variant={button.variant === 'primary' ? 'default' : 'outline'}
                className="px-8 py-3 text-lg font-semibold"
              >
                <Link to={button.link} className="flex items-center gap-2">
                  {button.text}
                  {button.variant === 'primary' ? (
                    <ArrowRight className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
