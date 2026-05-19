// EventManager.tsx — refatorado para usar eventsService.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirm } from "@/components/ConfirmProvider";
import { eventsService, SupabaseError } from "@/services";

export default function EventManager() {
  const confirm = useConfirm();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => eventsService.fetchAdminEventList(),
  });

  async function handleDelete(id: string, title: string) {
    const ok = await confirm({
      title: "Excluir evento?",
      description: `O evento "${title}" será removido permanentemente. Esta ação não pode ser desfeita.`,
      destructive: true,
      confirmText: "Excluir",
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      const success = await eventsService.deleteEvent(id);
      if (success) {
        toast.success("Evento excluído.");
        qc.invalidateQueries({ queryKey: ["admin-events"] });
      } else {
        toast.error("Você não tem permissão para excluir este evento.");
      }
    } catch (err) {
      if (err instanceof SupabaseError && err.isPermissionDenied) {
        toast.error("Você não tem permissão para excluir este evento.");
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar eventos</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
        ) : (
          <ul className="divide-y">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.starts_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === event.id}
                  onClick={() => handleDelete(event.id, event.title)}
                  aria-label={`Excluir evento ${event.title}`}
                >
                  {deletingId === event.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
