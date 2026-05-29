
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ErrorState from "@/components/ErrorState";

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

async function fetchProgressData(projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

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

  const contents = results[0].status === "fulfilled" ? (results[0].value.data as Content[]) : [];
  const progresses = results[1].status === "fulfilled" ? (results[1].value.data as Progression[]) : [];

  return { userId, contents: contents || [], progresses: progresses || [] };
}

const ProjectProgress = ({ projectId }: Props) => {
  const queryClient = useQueryClient();

  const { data, isError, refetch } = useQuery({
    queryKey: ["project-progress", projectId],
    queryFn: () => fetchProgressData(projectId),
    enabled: !!projectId,
  });

  const userId = data?.userId ?? null;
  const contents = data?.contents ?? [];
  const progresses = data?.progresses ?? [];

  const completeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const { error } = await supabase
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
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
    },
    onError: () => {
      toast.error("Erro ao salvar progresso. Tente novamente.");
    },
  });

  if (isError) {
    return (
      <ErrorState
        message="Não foi possível carregar seu progresso. Tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

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
                <Button
                  size="sm"
                  onClick={() => completeMutation.mutate(c.id)}
                  disabled={completeMutation.isPending}
                >
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
