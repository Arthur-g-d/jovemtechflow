// EventDetailsPage.tsx — refatorado para usar services.
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useEventData,
  useEventRegistrationCount,
  useIsRegisteredForEvent,
} from "@/hooks/useEventData";
import { authService, eventsService } from "@/services";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: event, isLoading, error } = useEventData(id);
  const { data: registrationCount = 0 } = useEventRegistrationCount(id);
  const { data: isRegistered = false } = useIsRegisteredForEvent(id);

  useEffect(() => {
    if (!isLoading && !event && !error) {
      toast.error("Evento não encontrado.");
      navigate("/eventos", { replace: true });
    }
  }, [event, isLoading, error, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar evento.",
      );
    }
  }, [error]);

  function invalidateEventQueries() {
    qc.invalidateQueries({ queryKey: ["event-registration-count", id] });
    qc.invalidateQueries({ queryKey: ["is-registered-for-event", id] });
  }

  async function handleRegister() {
    const user = await authService.getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await eventsService.register(id!, user.id);
      toast.success("Inscrição confirmada!");
      invalidateEventQueries();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao inscrever-se.",
      );
    }
  }

  async function handleUnregister() {
    const user = await authService.getCurrentUser();
    if (!user) return;
    try {
      await eventsService.unregister(id!, user.id);
      toast.success("Inscrição cancelada.");
      invalidateEventQueries();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao cancelar inscrição.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) return null;

  const startsAt = new Date(event.starts_at);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {event.description && (
            <p className="text-muted-foreground whitespace-pre-line">
              {event.description}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{startsAt.toLocaleString("pt-BR")}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {registrationCount}
                {event.capacity ? ` / ${event.capacity}` : ""} inscritos
              </span>
            </div>
          </div>

          {isRegistered ? (
            <Button variant="outline" onClick={handleUnregister}>
              Cancelar inscrição
            </Button>
          ) : (
            <Button onClick={handleRegister}>Inscrever-se</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
