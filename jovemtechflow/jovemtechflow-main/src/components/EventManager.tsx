
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import EventContentForm from "./EventContentForm";
import EventContentList from "./EventContentList";
import ConfirmDialog from "./ConfirmDialog";
import { useEventData } from "@/hooks/useEventData";
import { useEventActions } from "@/hooks/useEventActions";
import { useNavigate } from "react-router-dom";

interface Props {
  eventId: string;
  isAdmin?: boolean;
}

export default function EventManager({ eventId, isAdmin = false }: Props) {
  const [showContentForm, setShowContentForm] = useState(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false);
  const [pendingDeleteContentId, setPendingDeleteContentId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { contents, fetchModules } = useEventData(eventId);
  const { loading, addContentToEvent, deleteContent, deleteEvent } = useEventActions(eventId, fetchModules);

  const handleAddContent = async (contentData: any) => {
    const eventContents = contents[eventId] || [];
    await addContentToEvent(contentData, eventContents.length);
    setShowContentForm(false);
  };

  const handleDeleteEvent = async () => {
    const success = await deleteEvent();
    if (success) {
      navigate("/events");
    }
  };

  if (!isAdmin) return null;

  const eventContents = contents[eventId] || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Gerenciamento do Evento
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/events")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Eventos
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDeleteEvent(true)}
                disabled={loading}
              >
                Deletar Evento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Adicione materiais, vídeos, links e outros conteúdos para enriquecer seu evento.
              Vídeos do YouTube são reproduzidos diretamente na plataforma.
            </p>
          </div>

          {!showContentForm ? (
            <Button
              onClick={() => setShowContentForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Conteúdo
            </Button>
          ) : (
            <div className="space-y-4">
              <EventContentForm
                loading={loading}
                onAddContent={handleAddContent}
              />
              <Button
                variant="outline"
                onClick={() => setShowContentForm(false)}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EventContentList
        contents={eventContents}
        onDelete={(id) => setPendingDeleteContentId(id)}
        loading={loading}
      />

      <ConfirmDialog
        open={confirmDeleteEvent}
        title="Deletar evento"
        description="Tem certeza que deseja deletar este evento? Todos os conteúdos e inscrições serão removidos permanentemente."
        confirmLabel="Deletar"
        onConfirm={() => { setConfirmDeleteEvent(false); handleDeleteEvent(); }}
        onCancel={() => setConfirmDeleteEvent(false)}
      />

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
