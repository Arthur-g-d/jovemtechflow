
import { useParams, Link } from "react-router-dom";
import ProjectStudySingle from "@/components/ProjectStudySingle";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

export default function ProjectStudySinglePage() {
  const { id } = useParams();
  if (!id) return <div className="p-4">Projeto não encontrado.</div>;
  
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16 max-w-3xl mx-auto px-4">
        <Link to={`/projects/${id}`}>
          <Button variant="outline" className="mb-4">Voltar para detalhes</Button>
        </Link>
        <ProjectStudySingle />
      </div>
    </div>
  );
}
