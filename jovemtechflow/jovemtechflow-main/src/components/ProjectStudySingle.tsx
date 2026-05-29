
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, UserPlus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProjectStudySingle() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [progresses, setProgresses] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    
    checkEnrollmentAndFetchProject();
  }, [id]);

  const checkEnrollmentAndFetchProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    // Fetch project data
    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    setProject(projectData);

    if (user) {
      // Check if user is enrolled
      const { data: enrollment } = await supabase
        .from("project_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("project_id", id)
        .maybeSingle();

      setIsEnrolled(!!enrollment);

      if (enrollment) {
        // Fetch modules, contents and progress
        await fetchProjectData(user.id);
      }
    }

    setLoading(false);
  };

  const fetchProjectData = async (userId: string) => {
    // Fetch modules
    const { data: modulesData } = await supabase
      .from("project_modules")
      .select("*")
      .eq("project_id", id)
      .order("order_index", { ascending: true });

    setModules(modulesData || []);

    // Fetch contents
    const { data: contentsData } = await supabase
      .from("project_contents")
      .select("*")
      .eq("project_id", id)
      .order("order_index", { ascending: true });

    setContents(contentsData || []);

    // Fetch user progress
    const { data: progressData } = await supabase
      .from("project_progressions")
      .select("*")
      .eq("project_id", id)
      .eq("user_id", userId);

    setProgresses(progressData || []);
  };

  const handleComplete = async (contentId: string) => {
    if (!user || !id) return;

    await supabase
      .from("project_progressions")
      .upsert(
        [{
          project_id: id,
          user_id: user.id,
          content_id: contentId,
          progress_num: 100,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "project_id,user_id,content_id" }
      );

    // Reload progress
    await fetchProjectData(user.id);
  };

  const getModuleProgress = (moduleId: string) => {
    const moduleContents = contents.filter(c => c.module_id === moduleId);
    if (moduleContents.length === 0) return 0;
    
    const completedContents = moduleContents.filter(c => 
      progresses.some(p => p.content_id === c.id && p.progress_num >= 100)
    );
    
    return Math.round((completedContents.length / moduleContents.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando projeto...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">Login necessário</h2>
          <p className="text-muted-foreground">
            Você precisa estar logado para acessar o conteúdo do projeto.
          </p>
          <Link to="/auth">
            <Button>Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <UserPlus className="h-16 w-16 text-muted-foreground mx-auto" />
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Inscrição necessária</h2>
            <p className="text-muted-foreground">
              Você precisa se inscrever neste projeto para acessar sua trilha de estudos.
            </p>
            {project && (
              <Alert>
                <AlertDescription>
                  <strong>{project.title}</strong><br />
                  {project.description}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex gap-2">
            <Link to="/projects" className="flex-1">
              <Button variant="outline" className="w-full">
                Voltar aos Projetos
              </Button>
            </Link>
            <Link to={`/projects/${id}`} className="flex-1">
              <Button className="w-full">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Projeto não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum módulo foi criado ainda para este projeto.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => {
            const moduleContents = contents.filter(c => c.module_id === module.id);
            const progress = getModuleProgress(module.id);
            
            return (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {module.title}
                    </CardTitle>
                    <Badge variant="outline">{progress}% concluído</Badge>
                  </div>
                  {module.description && (
                    <p className="text-muted-foreground">{module.description}</p>
                  )}
                  <Progress value={progress} className="w-full" />
                </CardHeader>
                <CardContent>
                  {moduleContents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum conteúdo foi adicionado ainda a este módulo.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {moduleContents.map((content, idx) => {
                        const isCompleted = progresses.some(p => 
                          p.content_id === content.id && p.progress_num >= 100
                        );
                        
                        return (
                          <div
                            key={content.id}
                            className={`flex items-center gap-3 border rounded-lg p-4 ${
                              isCompleted 
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                                : "bg-background"
                            }`}
                          >
                            <Badge variant="secondary">{idx + 1}</Badge>
                            <div className="flex-1">
                              <h4 className="font-medium">{content.title}</h4>
                              {content.description && (
                                <p className="text-sm text-muted-foreground">
                                  {content.description}
                                </p>
                              )}
                              <Badge variant="outline" className="mt-1">
                                {content.content_type}
                              </Badge>
                            </div>
                            
                            {content.content_url && (
                              <a 
                                href={content.content_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary text-sm underline"
                              >
                                Acessar
                              </a>
                            )}
                            
                            {isCompleted ? (
                              <Badge variant="default" className="bg-green-600">
                                Concluído
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleComplete(content.id)}
                                variant="outline"
                              >
                                Marcar como feito
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
