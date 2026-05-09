
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Play, FileText, Image, FileDown, BookOpen } from "lucide-react";
import { ModuleContent } from "@/types/module";

interface ModuleContentListProps {
  contents: ModuleContent[];
  onDelete: (contentId: string) => void;
  loading?: boolean;
}

const getContentIcon = (type: string) => {
  switch (type) {
    case 'video': return Play;
    case 'link': return ExternalLink;
    case 'image': return Image;
    case 'document': return FileDown;
    case 'reading': return BookOpen;
    default: return FileText;
  }
};

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default function ModuleContentList({ contents, onDelete, loading }: ModuleContentListProps) {
  if (contents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhum conteúdo adicionado</h3>
          <p className="text-muted-foreground">
            Adicione materiais, vídeos, links e outros conteúdos para este módulo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Conteúdos do Módulo ({contents.length})
      </CardTitle>
      
      {contents.map((content, index) => {
        const IconComponent = getContentIcon(content.content_type);
        const isYouTubeVideo = content.content_type === 'video' && content.content_url && content.content_url.includes('youtube');
        const youtubeVideoId = isYouTubeVideo ? getYouTubeVideoId(content.content_url!) : null;
        
        return (
          <Card key={content.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">#{index + 1}</Badge>
                  <IconComponent className="h-4 w-4" />
                  <CardTitle className="text-base">{content.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={content.is_required ? "default" : "outline"}>
                    {content.is_required ? "Obrigatório" : "Opcional"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {content.content_type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(content.id)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {content.description && (
                <p className="text-muted-foreground text-sm mt-2">{content.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              {content.content_text && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{content.content_text}</p>
                </div>
              )}
              
              {content.content_url && (
                <div className="space-y-3">
                  {youtubeVideoId ? (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title={content.title}
                        className="w-full h-full rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : content.content_type === 'image' ? (
                    <div className="flex justify-center">
                      <img 
                        src={content.content_url} 
                        alt={content.title}
                        className="max-w-full max-h-96 object-contain rounded-lg border"
                      />
                    </div>
                  ) : (
                    <Button asChild variant="outline" className="gap-2">
                      <a href={content.content_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Acessar {content.content_type === 'document' ? 'Documento' : 'Link'}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
