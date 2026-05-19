// ModuleContentList.tsx — refatorado para usar projectService.
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { getSafeEmbedUrl } from "@/lib/urlSafety";
import { projectService, type ModuleContentRow } from "@/services";

interface Props {
  projectId: string;
}

export default function ModuleContentList({ projectId }: Props) {
  const {
    data: modules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project-modules", projectId],
    queryFn: () => projectService.fetchModulesWithContents(projectId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive py-8">
        Erro ao carregar módulos.
      </p>
    );
  }

  if (modules.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Este projeto ainda não tem módulos disponíveis.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map((mod) => (
        <Card key={mod.id}>
          <CardHeader>
            <CardTitle>{mod.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mod.contents
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((content) => (
                <ContentItem key={content.id} content={content} />
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ContentItem({ content }: { content: ModuleContentRow }) {
  const safeUrl = getSafeEmbedUrl(content.content_url);

  return (
    <div className="border rounded-md p-4 space-y-3">
      <h4 className="font-medium">{content.title}</h4>

      {safeUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded">
          <iframe
            src={safeUrl}
            title={content.title}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ) : content.content_url ? (
        <Button asChild variant="outline" size="sm">
          <a
            href={content.content_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir conteúdo externo
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Sem mídia anexada.</p>
      )}
    </div>
  );
}
