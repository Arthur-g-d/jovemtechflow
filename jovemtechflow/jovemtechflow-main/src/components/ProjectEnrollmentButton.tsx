
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Lock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectEnrollmentButtonProps {
  projectId: string;
  onEnrollmentChange?: () => void;
}

export default function ProjectEnrollmentButton({ projectId, onEnrollmentChange }: ProjectEnrollmentButtonProps) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkEnrollmentStatus();
    fetchProjectData();
  }, [projectId]);

  const checkEnrollmentStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (!user) return;

    const { data } = await supabase
      .from("project_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .maybeSingle();

    setIsEnrolled(!!data);
  };

  const fetchProjectData = async () => {
    // Buscar dados do projeto
    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    // Buscar contagem atual de inscrições
    const { data: enrollments, count } = await supabase
      .from("project_enrollments")
      .select("*", { count: 'exact' })
      .eq("project_id", projectId);

    setProject(projectData);
    setEnrollmentCount(count || 0);
  };

  const handleEnrollment = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para se inscrever",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Verificar se projeto existe e não está fechado
    if (!project) {
      toast({
        title: "Erro",
        description: "Projeto não encontrado",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    if (project.enrollment_status === 'closed') {
      toast({
        title: "Inscrições encerradas",
        description: "As inscrições para este projeto foram encerradas",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Verificar limite de vagas
    if (project.max_enrollments && enrollmentCount >= project.max_enrollments) {
      toast({
        title: "Projeto lotado",
        description: "Este projeto atingiu o número máximo de inscrições",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Verificar se já está inscrito (dupla verificação)
    const { data: existingEnrollment } = await supabase
      .from("project_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (existingEnrollment) {
      setIsEnrolled(true);
      toast({
        title: "Já inscrito",
        description: "Você já está inscrito neste projeto",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Inscrever
    const { error } = await supabase
      .from("project_enrollments")
      .insert({
        user_id: user.id,
        project_id: projectId,
        enrolled_by_admin: false
      });

    if (error) {
      console.error("Erro ao se inscrever:", error);
      toast({
        title: "Erro",
        description: "Erro ao se inscrever no projeto",
        variant: "destructive"
      });
    } else {
      setIsEnrolled(true);
      setEnrollmentCount(prev => prev + 1);
      toast({
        title: "Inscrição realizada",
        description: "Você foi inscrito no projeto com sucesso!"
      });
      onEnrollmentChange?.();
    }
    setLoading(false);
  };

  if (!user) {
    return null;
  }

  const isEnrollmentClosed = project?.enrollment_status === 'closed';
  const isProjectFull = project?.max_enrollments && enrollmentCount >= project.max_enrollments;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          {enrollmentCount} inscritos
          {project?.max_enrollments && ` de ${project.max_enrollments}`}
        </span>
      </div>

      {isEnrolled ? (
        <Link to={`/projects/${projectId}/study`}>
          <Button className="w-full gap-2">
            <BookOpen className="h-4 w-4" />
            Visualizar Conteúdo
          </Button>
        </Link>
      ) : (
        <Button
          onClick={handleEnrollment}
          disabled={loading || (isEnrollmentClosed || isProjectFull)}
          variant="default"
          className="w-full gap-2"
        >
          {isEnrollmentClosed ? (
            <>
              <Lock className="h-4 w-4" />
              Inscrições Encerradas
            </>
          ) : isProjectFull ? (
            <>
              <Users className="h-4 w-4" />
              Projeto Lotado
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Inscrever-se
            </>
          )}
        </Button>
      )}
    </div>
  );
}
