
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, Calendar, Users, Clock, MapPin, Settings, Trash2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EventManager from "@/components/EventManager";
import EventContentList from "@/components/EventContentList";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorState from "@/components/ErrorState";
import { toast } from "sonner";
import { useEventData } from "@/hooks/useEventData";
import { useEventActions } from "@/hooks/useEventActions";
import { useNavigate } from "react-router-dom";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [pendingDeleteContentId, setPendingDeleteContentId] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const { contents, fetchModules } = useEventData(id || "");
  const { deleteContent } = useEventActions(id || "", fetchModules);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    setLoadingEvent(true);
    setLoadError(false);

    supabase.from("events").select("*").eq("id", id).maybeSingle()
      .then(async ({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setLoadError(true);
          setLoadingEvent(false);
          return;
        }

        setEvent(data);

        if (data?.created_by) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", data.created_by)
            .maybeSingle();
          if (mounted) setCreatorUsername(profile?.username || data.created_by);
        }

        if (mounted) {
          fetchAttendeeCount();
          setLoadingEvent(false);
        }
      });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      if (!user) return setUserId(null);

      setUserId(user.id);

      supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => { if (mounted) setIsRegistered(!!data); });

      supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => { if (mounted) setIsAdmin(!!data); });
    });

    return () => { mounted = false; };
  }, [id]);

  const fetchAttendeeCount = async () => {
    if (!id) return;
    const { count } = await supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id);
    setAttendeeCount(count ?? 0);
  };

  const handleRegister = async () => {
    if (!userId || !id || registering || isRegistered) return;
    setRegistering(true);
    const { error } = await supabase.from("event_registrations").insert({
      event_id: id,
      user_id: userId,
    });
    if (!error) {
      setIsRegistered(true);
      fetchAttendeeCount();
    } else {
      toast.error("Erro ao se inscrever. Tente novamente.");
    }
    setRegistering(false);
  };

  if (loadError) return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorState
        message="Não foi possível carregar o evento. Tente novamente."
        onRetry={() => window.location.reload()}
      />
    </div>
  );

  if (loadingEvent) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Carregando evento...</div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Evento não encontrado.</div>
    </div>
  );

  const formatDateTime = (date: string, time: string) => {
    try {
      if (!date || !time) return "";
      const isoString = `${date}T${time}`;
      return format(parseISO(isoString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch {
      return `${date} ${time}`;
    }
  };

  const haveLimit = !!event.max_attendees;
  const percent = haveLimit && event.max_attendees > 0
    ? Math.min((attendeeCount / event.max_attendees) * 100, 100)
    : 0;
  const isEventFull = haveLimit && attendeeCount >= event.max_attendees;

  const eventContents = contents[id || ""] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/events">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Eventos
            </Button>
          </Link>
        </div>

        {/* Event Header Card */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{event.title}</CardTitle>
                <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                  {event.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {formatDateTime(event.event_date, event.event_time)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Por {creatorUsername || 'Organizador'}</span>
                  </div>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Registration Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {attendeeCount} inscrito{attendeeCount !== 1 ? 's' : ''}
                    {haveLimit && ` de ${event.max_attendees}`}
                  </span>
                </div>
                {isEventFull && (
                  <Badge variant="destructive">Evento Lotado</Badge>
                )}
              </div>
              
              {haveLimit && (
                <Progress value={percent} className="h-2" />
              )}
            </div>

            {/* Registration and Content Access Buttons */}
            <div className="space-y-4">
              {!isRegistered ? (
                <Button 
                  onClick={handleRegister} 
                  disabled={registering || isEventFull}
                  className="w-full h-12 text-base font-semibold"
                >
                  {registering ? "Inscrevendo..." : 
                   isEventFull ? "Evento Lotado" : 
                   "Inscrever-se no Evento"}
                </Button>
              ) : (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-green-700 dark:text-green-200 font-semibold text-lg mb-2">
                    ✅ Você está inscrito neste evento!
                  </div>
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Visualizar Conteúdo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="mb-8">
            <EventManager eventId={id || ""} isAdmin />
          </div>
        )}

        {/* Event Content for Registered Users */}
        {(isRegistered || isAdmin) && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Materiais do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventContents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum material disponível</h3>
                  <p className="text-muted-foreground">
                    Os materiais do evento aparecerão aqui quando forem adicionados pelo organizador.
                  </p>
                </div>
              ) : (
                <EventContentList
                  contents={eventContents}
                  onDelete={(cid) => setPendingDeleteContentId(cid)}
                  loading={false}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Not Registered Message */}
        {!isRegistered && !isAdmin && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conteúdo Exclusivo</h3>
              <p className="text-muted-foreground">
                Inscreva-se no evento para acessar os materiais exclusivos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDeleteContentId}
        title="Deletar conteúdo"
        description="Tem certeza que deseja deletar este conteúdo? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        onConfirm={async () => {
          if (pendingDeleteContentId) await deleteContent(pendingDeleteContentId);
          setPendingDeleteContentId(null);
        }}
        onCancel={() => setPendingDeleteContentId(null)}
      />
    </div>
  );
}
