
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ErrorState from "@/components/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Users, Trophy, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

async function fetchDashboardData() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { user: null, enrolledProjects: [] as any[], upcomingEvents: [] as any[], overallProgress: 0 };
  }

  let enrolledProjects: any[] = [];
  let overallProgress = 0;

  const { data: enrollments, error: enrollError } = await supabase
    .from("project_enrollments")
    .select(`
      *,
      projects:project_id (
        id,
        title,
        description,
        image_url,
        tags
      )
    `)
    .eq("user_id", user.id);

  if (!enrollError && enrollments) {
    const results = await Promise.allSettled(
      enrollments.map(async (enrollment) => {
        const { data: contents } = await supabase
          .from("project_contents")
          .select("*")
          .eq("project_id", enrollment.project_id);

        const { data: progressions } = await supabase
          .from("project_progressions")
          .select("*")
          .eq("user_id", user.id)
          .eq("project_id", enrollment.project_id);

        const totalContents = contents?.length || 0;
        const completedContents = progressions?.filter(p => p.progress_num >= 100).length || 0;
        const progressPercentage = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

        return {
          ...enrollment,
          project: enrollment.projects,
          progress: progressPercentage,
          completedContents,
          totalContents
        };
      })
    );

    enrolledProjects = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map(r => r.value);

    const totalProgress = enrolledProjects.reduce((sum, project) => sum + project.progress, 0);
    overallProgress = enrolledProjects.length > 0 ? Math.round(totalProgress / enrolledProjects.length) : 0;
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString().split('T')[0])
    .order("event_date", { ascending: true })
    .limit(3);

  return { user, enrolledProjects, upcomingEvents: events || [], overallProgress };
}

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  const user = data?.user ?? null;
  const enrolledProjects = data?.enrolledProjects ?? [];
  const upcomingEvents = data?.upcomingEvents ?? [];
  const overallProgress = data?.overallProgress ?? 0;

  const formatDateTime = (date: string, time: string) => {
    try {
      const isoString = `${date}T${time}`;
      return format(parseISO(isoString), "d 'de' MMMM, HH:mm", { locale: ptBR });
    } catch {
      return `${date} ${time}`;
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState
          message="Não foi possível carregar seu dashboard. Verifique sua conexão e tente novamente."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e atividades
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Matriculados</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledProjects.length}</div>
              <p className="text-xs text-muted-foreground">
                projetos em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                eventos agendados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meus Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Meus Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledProjects.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não está matriculado em nenhum projeto
                  </p>
                  <Link to="/projects">
                    <Button>Explorar Projetos</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledProjects.map((enrollment) => (
                    <div key={enrollment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{enrollment.project.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {enrollment.project.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {enrollment.progress}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress value={enrollment.progress} className="h-2" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            {enrollment.completedContents} de {enrollment.totalContents} etapas
                          </span>
                          <Link to={`/projects/${enrollment.project.id}/study`}>
                            <Button size="sm">Continuar</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum evento agendado
                  </p>
                  <Link to="/events">
                    <Button variant="outline">Ver Todos os Eventos</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link 
                      key={event.id} 
                      to={`/events/${event.id}`}
                      className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1 truncate">{event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatDateTime(event.event_date, event.event_time)}</span>
                          </div>
                          {event.max_attendees && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>Máx. {event.max_attendees} participantes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {upcomingEvents.length > 0 && (
                    <div className="pt-2">
                      <Link to="/events">
                        <Button variant="outline" className="w-full">
                          Ver Todos os Eventos
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
