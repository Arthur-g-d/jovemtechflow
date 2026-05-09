
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, Users, MapPin, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    max_attendees?: number;
    tags?: string[];
    created_by: string;
  };
  creatorName?: string;
  attendeeCount?: number;
  isAdmin?: boolean;
  onDelete?: (eventId: string) => void;
}

const EventCard = ({ event, creatorName, attendeeCount = 0, isAdmin, onDelete }: EventCardProps) => {
  const formatEventDateTime = (date: string, time: string) => {
    try {
      const isoString = `${date}T${time}`;
      return format(parseISO(isoString), "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch {
      return `${date} às ${time}`;
    }
  };

  const isEventFull = event.max_attendees && attendeeCount >= event.max_attendees;
  const registrationPercent = event.max_attendees && event.max_attendees > 0
    ? Math.min((attendeeCount / event.max_attendees) * 100, 100)
    : 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-gradient-to-br from-background to-muted/20 relative">
      {isAdmin && onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(event.id)}
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      <div className="h-3 bg-gradient-to-r from-primary to-primary/60"></div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </CardTitle>
          {isEventFull && (
            <Badge variant="destructive" className="shrink-0">
              Lotado
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {event.tags?.filter(tag => tag.trim()).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {formatEventDateTime(event.event_date, event.event_time)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Por {creatorName || 'Organizador'}
            </span>
          </div>
        </div>

        {/* Registration Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>
                {attendeeCount} inscrito{attendeeCount !== 1 ? 's' : ''}
                {event.max_attendees && ` de ${event.max_attendees}`}
              </span>
            </div>
            {event.max_attendees && (
              <span className="text-muted-foreground">
                {Math.round(registrationPercent)}%
              </span>
            )}
          </div>
          
          {event.max_attendees && (
            <Progress value={registrationPercent} className="h-2" />
          )}
        </div>

        <div className="pt-4 border-t">
          <Link to={`/events/${event.id}`}>
            <Button className="w-full group-hover:scale-[1.02] transition-transform">
              Ver Detalhes do Evento
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
