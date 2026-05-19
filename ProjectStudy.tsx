// ProjectStudy.tsx — refatorado para usar services.
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ModuleContentList from "@/components/ModuleContentList";
import { authService, enrollmentService, projectService } from "@/services";

export default function ProjectStudy() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await authService.getCurrentUser();
      if (cancelled) return;
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    enabled: authChecked && !!projectId,
    queryFn: () => projectService.fetchById(projectId!),
  });

  const { data: isEnrolled, isLoading: loadingEnrollment } = useQuery({
    queryKey: ["is-enrolled", projectId],
    enabled: authChecked && !!projectId,
    queryFn: () => enrollmentService.isEnrolledInProject(projectId!),
  });

  useEffect(() => {
    if (!loadingProject && project === null) {
      toast.error("Projeto não encontrado.");
      navigate("/projetos", { replace: true });
    }
  }, [project, loadingProject, navigate]);

  useEffect(() => {
    if (
      authChecked &&
      !loadingEnrollment &&
      isEnrolled === false &&
      project &&
      projectId
    ) {
      toast.error("Você precisa se inscrever para estudar este projeto.");
      navigate(`/projetos/${projectId}`, { replace: true });
    }
  }, [
    authChecked,
    isEnrolled,
    loadingEnrollment,
    navigate,
    project,
    projectId,
  ]);

  if (loadingProject || loadingEnrollment || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          <ModuleContentList projectId={project.id} />
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/projetos/${project.id}`)}
            >
              Voltar aos detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
