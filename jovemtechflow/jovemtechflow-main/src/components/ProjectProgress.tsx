
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Content {
  id: string;
  title: string;
  description: string;
}

interface Progression {
  id: string;
  project_id: string;
  user_id: string;
  content_id: string;
  progress_num: number;
}

interface Props {
  projectId: string;
}

const ProjectProgress = ({ projectId }: Props) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [progresses, setProgresses] = useState<Progression[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Obtem usuário
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // Busca conteúdos e progresso
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.allSettled([
          supabase
            .from("project_contents")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: true }),
          userId
            ? supabase
                .from("project_progressions")
                .select("*")
                .eq("project_id", projectId)
                .eq("user_id", userId)
            : Promise.resolve({ data: [] }),
        ]);
        if (cancelled) return;
        const c = results[0].status === "fulfilled" ? results[0].value.data : [];
        const p = results[1].status === "fulfilled" ? results[1].value.data : [];
        setContents((c as Content[]) || []);
        setProgresses((p as Progression[]) || []);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, userId]);

  // Marca atividade como concluída
  const handleComplete = async (contentId: string) => {
    if (!userId) return;
    const { error: upsertError } = await supabase
      .from("project_progressions")
      .upsert(
        {
          project_id: projectId,
          user_id: userId,
          content_id: contentId,
          progress_num: 100,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id,user_id,content_id" }
      );
    if (upsertError) {
      toast.error("Erro ao salvar progresso. Tente novamente.");
      return;
    }
    const { data: p, error: fetchError } = await supabase
      .from("project_progressions")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId);
    if (!fetchError) {
      setProgresses((p as Progression[]) || []);
    }
  };

  // Calcula porcentagem global
  const percent =
    contents.length === 0
      ? 0
      : Math.round(
          (progresses.filter((pr) => pr.progress_num >= 100).length / contents.length) * 100
        );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">
        Sua Jornada (Progresso: {percent}%)
      </h3>
      <Progress value={percent} className="mb-4" />
      <div className="flex flex-col gap-2">
        {contents.map((c, i) => {
          const prog = progresses.find((pr) => pr.content_id === c.id);
          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 border rounded px-3 py-2 ${
                prog?.progress_num >= 100
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-background"
              }`}
            >
              <span className="mr-2 font-semibold">{i + 1}.</span>
              <span className="flex-1">{c.title}</span>
              {prog?.progress_num >= 100 ? (
                <span className="text-green-700 text-xs font-semibold">Concluído</span>
              ) : (
                <Button size="sm" onClick={() => handleComplete(c.id)}>
                  Marcar como feito
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectProgress;
