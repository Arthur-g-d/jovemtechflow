
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Content {
  id: string;
  title: string;
  description: string | null;
  content_type: string | null;
  content_url: string | null;
}

interface Props {
  eventId: string;
  isAdmin?: boolean;
}

const EventContentManager = ({ eventId, isAdmin = false }: Props) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("text");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // restrict to admin only!
  const [forceIsAdmin, setForceIsAdmin] = useState<boolean>(false);
  useEffect(() => {
    if (!isAdmin) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        const { data } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setForceIsAdmin(!!data);
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!eventId) return;
    (supabase as any)
      .from("event_contents")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: any[] }) => setContents(data ?? []));
  }, [eventId]);

  // Adiciona conteúdo
  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    await (supabase as any)
      .from("event_contents")
      .insert({
        event_id: eventId,
        title,
        description,
        content_type: type,
        content_url: url,
        author_id: user?.id,
      });
    setTitle(""); setDescription(""); setType("text"); setUrl("");
    (supabase as any)
      .from("event_contents")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: any[] }) => setContents(data ?? []));
    setLoading(false);
  };

  // Excluir conteúdo
  const handleDelete = async (contentId: string) => {
    setLoading(true);
    await (supabase as any).from("event_contents").delete().eq("id", contentId);
    (supabase as any)
      .from("event_contents")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: any[] }) => setContents(data ?? []));
    setLoading(false);
  };

  if (!isAdmin && !forceIsAdmin) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Conteúdo do evento</h3>
      <form onSubmit={handleAddContent} className="space-y-2 mb-4">
        <Input
          placeholder="Título do conteúdo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
        <Textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={loading}
        />
        <Input
          placeholder="Tipo (ex: texto, vídeo, link)"
          value={type}
          onChange={e => setType(e.target.value)}
          disabled={loading}
        />
        <Input
          placeholder="URL do conteúdo (opcional)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>{loading ? "Adicionando..." : "Adicionar conteúdo"}</Button>
      </form>
      <div className="flex flex-col gap-2">
        {contents.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2 border rounded px-3 py-2">
            <Badge>{i + 1}</Badge>
            <span className="font-bold">{c.title}</span>
            <span className="text-xs text-muted-foreground">({c.content_type})</span>
            {c.description && <span className="text-xs ml-2">{c.description}</span>}
            <Button
              size="icon"
              variant="outline"
              className="ml-auto"
              onClick={() => handleDelete(c.id)}
              title="Excluir"
              disabled={loading}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventContentManager;
