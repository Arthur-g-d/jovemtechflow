
import { Button } from "@/components/ui/button";
import { ArrowDown, Users, Book } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 gradient-bg opacity-10"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="p-4 bg-tech-purple/10 rounded-full">
          <Book className="h-8 w-8 text-tech-purple" />
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="p-4 bg-tech-orange/10 rounded-full">
          <Users className="h-8 w-8 text-tech-orange" />
        </div>
      </div>

      <div className="text-center z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Transforme seu
          <span className="bg-tech-gradient bg-clip-text text-transparent block">
            futuro tech
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Uma plataforma digital que conecta jovens talentos com oportunidades,
          <br />conhecimento e uma comunidade que inspira.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button size="lg" className="gradient-bg text-lg px-8 py-4">
            Começar Jornada
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4">
            Explorar Projetos
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-muted-foreground">Jovens Capacitados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-muted-foreground">Empresas Parceiras</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">1000+</div>
            <div className="text-muted-foreground">Projetos Criados</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
};

export default Hero;
