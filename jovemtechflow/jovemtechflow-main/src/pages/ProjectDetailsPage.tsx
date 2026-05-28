
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProjectContentManager from "@/components/ProjectContentManager";
import ProjectEnrollmentManager from "@/components/ProjectEnrollmentManager";
import ProjectProgress from "@/components/ProjectProgress";
import ProjectEnrollmentButton from "@/components/ProjectEnrollmentButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Users, BarChart3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

async function fetchProjectAndUserData(id: string) {
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (projectError || !projectData) {
    return { project: null, user: null, isAdmin: false, isEnrolled: false };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { project: projectData, user: null, isAdmin: false, isEnrolled: false };
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  const { data: enrollmentData } = await supabase
    .from("project_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("project_id", id)
    .maybeSingle();

  return {
    project: projectData,
    user,
    isAdmin: !!roleData,
    isEnrolled: !!enrollmentData,
  };
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["project-details", id],
    queryFn: () => fetchProjectAndUserData(id as string),
    enabled: !!id,
  });

  const project = data?.project ?? null;
  const user = data?.user ?? null;
  const isAdmin = data?.isAdmin ?? false;
  const isEnrolled = data?.isEnrolled ?? false;

  const handleDeleteProject = async () => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      navigate("/projects");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Carregando projeto...</div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Projeto não encontrado.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/projects">
            <Button variant="outline" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Projetos
            </Button>
          </Link>
        </div>

        {/* Project Header Card */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="relative">
            {project.image_url && (
              <img 
                src={project.image_url} 
                alt={project.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            )}
            <CardHeader className={project.image_url ? "bg-gradient-to-t from-black/50 to-transparent text-white absolute bottom-0 left-0 right-0" : ""}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-3">{project.title}</CardTitle>
                  <p className={`text-lg leading-relaxed ${project.image_url ? "text-gray-200" : "text-muted-foreground"}`}>
                    {project.description}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Deletar Projeto
                  </Button>
                )}
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag: string) => (
                    <Badge key={tag} variant={project.image_url ? "secondary" : "outline"}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </div>
          
          {!project.image_url && (
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {user && isEnrolled && (
                  <Link to={`/projects/${project.id}/study`} className="flex-1">
                    <Button className="w-full gap-2 h-12 text-base">
                      <BookOpen className="h-5 w-5" />
                      Acessar Trilha de Estudos
                    </Button>
                  </Link>
                )}
                {user && !isAdmin && !isEnrolled && (
                  <div className="flex-1">
                    <ProjectEnrollmentButton 
                      projectId={project.id}
                      onEnrollmentChange={() => refetch()}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {project.image_url && (
          <div className="mb-8 flex justify-center">
            {user && isEnrolled ? (
              <Link to={`/projects/${project.id}/study`}>
                <Button className="gap-2 h-12 text-base px-8">
                  <BookOpen className="h-5 w-5" />
                  Acessar Trilha de Estudos
                </Button>
              </Link>
            ) : user && !isAdmin ? (
              <ProjectEnrollmentButton
                projectId={project.id}
                onEnrollmentChange={() => refetch()}
              />
            ) : null}
          </div>
        )}

        {/* Admin Panel */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gerenciar Trilha de Progressão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectContentManager projectId={project.id} isAdmin />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciar Inscrições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectEnrollmentManager projectId={project.id} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Progress - Only show if enrolled */}
        {user && isEnrolled && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Seu Progresso Individual</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectProgress projectId={project.id} />
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Deletar projeto"
        description="Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        onConfirm={() => { setConfirmDelete(false); handleDeleteProject(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
