
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Eye, Trash2 } from "lucide-react";
import CreateProjectDialog from "./CreateProjectDialog";
import ProjectEnrollmentButton from "./ProjectEnrollmentButton";
import ConfirmDialog from "./ConfirmDialog";

export default function ProjectLibrary() {
  const [projects, setProjects] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (user?.id) {
        supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data }) => setIsAdmin(!!data));
      }
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects(data ?? []);
      });
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (!error) {
      fetchProjects();
    }
  };

  if (projects.length === 0 && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Nenhum projeto disponível</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Os projetos aparecerão aqui quando forem criados pelos administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Biblioteca de Projetos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore projetos práticos, desenvolva suas habilidades e acompanhe seu progresso através de trilhas de aprendizado estruturadas.
          </p>
        </div>

        {isAdmin && (
          <div className="mb-8 flex justify-center">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="gap-2 text-lg px-8 py-3 h-auto"
            >
              <Plus className="h-5 w-5" />
              Criar Novo Projeto
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-t-lg">
                {project.image_url ? (
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="text-4xl font-bold text-primary/30">
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                  {project.description}
                </p>
                
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Enrollment Button for Users */}
                {userId && !isAdmin && (
                  <ProjectEnrollmentButton 
                    projectId={project.id}
                    onEnrollmentChange={fetchProjects}
                  />
                )}

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="flex gap-2 pt-2">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Settings className="h-4 w-4" />
                        Gerenciar
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingDeleteId(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onProjectCreated={fetchProjects}
        />

        <ConfirmDialog
          open={!!pendingDeleteId}
          title="Deletar projeto"
          description="Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita."
          confirmLabel="Deletar"
          onConfirm={() => {
            if (pendingDeleteId) handleDeleteProject(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      </div>
    </div>
  );
}
