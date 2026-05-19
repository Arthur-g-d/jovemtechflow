// HomePage.tsx — refatorado para usar authService.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Calendar, MessagesSquare } from "lucide-react";
import { authService } from "@/services";

export default function HomePage() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    authService.getSession().then((session) => {
      if (!cancelled) setHasSession(!!session);
    });
    const { data: sub } = authService.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />

        <section className="container mx-auto px-4 py-16 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            O que você encontra aqui
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Projetos guiados"
              description="Trilhas de aprendizado com módulos, vídeos e materiais."
              href="/projetos"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Eventos ao vivo"
              description="Workshops, hackathons e palestras com especialistas."
              href="/eventos"
            />
            <FeatureCard
              icon={<MessagesSquare className="h-6 w-6" />}
              title="Comunidade ativa"
              description="Fórum para tirar dúvidas e compartilhar projetos."
              href="/forum"
            />
          </div>
        </section>

        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
            <h2 className="text-3xl font-bold">Pronto pra começar?</h2>
            <p className="text-muted-foreground">
              Crie sua conta gratuita e tenha acesso a todos os projetos e
              eventos da plataforma.
            </p>
            {hasSession === false && (
              <Button size="lg" onClick={() => navigate("/auth")}>
                Criar conta grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {hasSession === true && (
              <Button size="lg" onClick={() => navigate("/dashboard")}>
                Ir para o painel <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link to={href}>
            Explorar <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
