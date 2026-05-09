import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  title: string;
  description: string;
};

type Content = {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_url?: string;
};

type Progression = {
  id: string;
  content_id: string;
  progress_num: number;
};

export default function ProjectStudy() {
  const [userId, setUserId] = useState<string | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [progresses, setProgresses] = useState<Progression[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // Fetch projects for user
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data: memberRows, error: memberError } = await supabase
        .from<any, any>("project_members")
        .select("project_id")
        .eq("user_id", userId);

      if (memberError || !memberRows) {
        setMyProjects([]);
        setSelectedProject(null);
        return;
      }
      const projectIds = memberRows.map((row: any) => row.project_id);

      if (!projectIds.length) {
        setMyProjects([]);
        setSelectedProject(null);
        return;
      }
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds);
      setMyProjects(projects ?? []);
    })();
  }, [userId]);

  // Helper: Is array Content[]
  function isContentArray(arr: any): arr is Content[] {
    return Array.isArray(arr) && arr.every(
      (item) => item && typeof item.id === "string" && typeof item.title === "string" && typeof item.content_type === "string"
    );
  }
  // Helper: Is array Progression[]
  function isProgressionArray(arr: any): arr is Progression[] {
    return Array.isArray(arr) && arr.every(
      (item) => item && typeof item.id === "string" && typeof item.content_id === "string" && typeof item.progress_num === "number"
    );
  }

  // Quando um projeto é selecionado, buscar conteúdos e progresso
  useEffect(() => {
    if (!selectedProject || !userId) {
      setContents([]);
      setProgresses([]);
      return;
    }
    (async () => {
      const { data: conts, error: contsError } = await supabase
        .from<any, any>("project_contents")
        .select("*")
        .eq("project_id", selectedProject.id)
        .order("created_at", { ascending: true });

      if (!contsError && isContentArray(conts)) {
        setContents(conts);
      } else {
        setContents([]);
      }

      const { data: progs, error: progsError } = await supabase
        .from<any, any>("project_progressions")
        .select("*")
        .eq("project_id", selectedProject.id)
        .eq("user_id", userId);

      if (!progsError && isProgressionArray(progs)) {
        setProgresses(progs);
      } else {
        setProgresses([]);
      }
    })();
  }, [selectedProject, userId]);

  // Marcar etapa como feita
  const handleComplete = async (contentId: string) => {
    if (!userId || !selectedProject) return;
    setLoading(true);

    await supabase
      .from<any, any>("project_progressions")
      .upsert(
        [{
          project_id: selectedProject.id,
          user_id: userId,
          content_id: contentId,
          progress_num: 100,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "project_id,user_id,content_id" }
      );

    // Recarregar progress
    const { data: progs, error: progsError } = await supabase
      .from<any, any>("project_progressions")
      .select("*")
      .eq("project_id", selectedProject.id)
      .eq("user_id", userId);
    if (!progsError && isProgressionArray(progs)) {
      setProgresses(progs);
    } else {
      setProgresses([]);
    }
    setLoading(false);
  };

  // Cálculo da progressão
  const percent =
    contents.length === 0
      ? 0
      : Math.round(
          (progresses.filter((pr) => pr.progress_num >= 100).length /
            contents.length) *
            100
        );

  return (
    <section className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Projetos para Estudo</h2>
      {/* Escolher projeto */}
      <div className="mb-6">
        <label className="font-medium mr-2">Selecione um projeto:</label>
        <select
          value={selectedProject?.id || ""}
          onChange={(e) => {
            const found = myProjects.find((p) => p.id === e.target.value);
            setSelectedProject(found || null);
          }}
          className="p-2 rounded border"
        >
          <option value="">-- Escolha --</option>
          {myProjects.map((project) => (
            <option value={project.id} key={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProject.title}
              <span className="ml-3 text-base font-normal text-gray-400">{percent}% concluído</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">{selectedProject.description}</div>
            <Progress value={percent} className="mb-4" />
            <div className="flex flex-col gap-2">
              {contents.length === 0 && (
                <div className="text-muted-foreground">Nenhum conteúdo foi postado ainda para este projeto.</div>
              )}
              {contents.map((c, idx) => {
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
                    <Badge variant="secondary">{idx + 1}</Badge>
                    <span className="flex-1 font-medium">{c.title}</span>
                    <span className="text-xs text-muted-foreground">{c.content_type}</span>
                    {c.content_type === "link" && c.content_url && (
                      <a href={c.content_url} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-primary text-xs">
                        Link material
                      </a>
                    )}
                    {c.content_type === "video" && c.content_url && (
                      <a href={c.content_url} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-blue-600 text-xs">
                        Assistir vídeo
                      </a>
                    )}
                    <span className="mx-2 text-xs text-muted-foreground">{c.description}</span>
                    {prog?.progress_num >= 100 ? (
                      <span className="text-green-700 text-xs font-semibold">Concluído</span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleComplete(c.id)}
                        disabled={loading}
                        variant="outline"
                      >
                        Marcar como feito
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      {!myProjects.length && (
        <div className="text-muted-foreground py-6 text-center">
          Você ainda não está matriculado em nenhum projeto.
        </div>
      )}
    </section>
  );
}
