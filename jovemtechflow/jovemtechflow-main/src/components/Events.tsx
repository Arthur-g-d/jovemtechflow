
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Calendar, Clock, Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
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

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    setEvents(data ?? []);
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      if (!date || !time) return "";
      const isoString = `${date}T${time}`;
      return format(parseISO(isoString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch {
      return `${date} ${time}`;
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !eventDate || !eventTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título, data e horário do evento",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("events")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          event_date: eventDate,
          event_time: eventTime,
          max_attendees: maxAttendees,
          created_by: userId
        });

      if (error) {
        console.error("Erro ao criar evento:", error);
        toast({
          title: "Erro",
          description: "Erro ao criar evento",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Evento criado",
          description: "O evento foi criado com sucesso!"
        });
        
        // Reset form
        setTitle("");
        setDescription("");
        setEventDate("");
        setEventTime("");
        setMaxAttendees(null);
        setShowCreateForm(false);
        
        // Refresh events list
        fetchEvents();
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Eventos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Participe de workshops, palestras e atividades exclusivas da nossa comunidade
        </p>
      </div>

      {/* Admin Controls - Separated Section */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-primary">Área do Administrador</h2>
              <p className="text-sm text-muted-foreground">Gerencie eventos da plataforma</p>
            </div>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Novo Evento
              </Button>
            )}
          </div>
          
          {showCreateForm && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Criar Novo Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Evento *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Workshop de React"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-attendees">Máximo de Participantes</Label>
                      <Input
                        id="max-attendees"
                        type="number"
                        placeholder="Deixe vazio para ilimitado"
                        value={maxAttendees || ""}
                        onChange={(e) => setMaxAttendees(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Data do Evento *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Horário *</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o evento..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Criando..." : "Criar Evento"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Events Grid - Clean Separation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold">Próximos Eventos</h2>
          <Badge variant="outline" className="text-sm">
            {events.length} eventos
          </Badge>
        </div>

        {events.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Calendar className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Nenhum evento agendado</h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                Fique atento! Novos eventos serão anunciados em breve.
              </p>
              {isAdmin && (
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Evento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="group block">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/40 group-hover:scale-[1.03] overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 p-6">
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-primary font-medium">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDateTime(event.event_date, event.event_time)}
                        </span>
                      </div>
                      
                      {event.max_attendees && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Máximo {event.max_attendees} participantes</span>
                        </div>
                      )}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {event.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {event.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
