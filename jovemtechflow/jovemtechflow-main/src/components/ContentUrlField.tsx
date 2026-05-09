
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContentUrlFieldProps {
  contentType: string;
  contentUrl: string;
  onContentUrlChange: (url: string) => void;
}

export default function ContentUrlField({ contentType, contentUrl, onContentUrlChange }: ContentUrlFieldProps) {
  const getUrlLabel = () => {
    switch (contentType) {
      case 'video': return 'URL do Vídeo';
      case 'document': return 'URL do Documento';
      case 'image': return 'URL da Imagem';
      default: return 'URL do Link';
    }
  };

  const getUrlPlaceholder = () => {
    switch (contentType) {
      case 'video': return 'https://youtube.com/watch?v=...';
      case 'document': return 'https://drive.google.com/file/...';
      case 'image': return 'https://exemplo.com/imagem.jpg';
      default: return 'https://exemplo.com/recurso';
    }
  };

  return (
    <div>
      <Label htmlFor="content-url">
        {getUrlLabel()} *
      </Label>
      <Input
        id="content-url"
        type="url"
        placeholder={getUrlPlaceholder()}
        value={contentUrl}
        onChange={(e) => onContentUrlChange(e.target.value)}
        required
      />
      {contentType === 'image' && contentUrl && (
        <div className="mt-3">
          <img 
            src={contentUrl} 
            alt="Preview" 
            className="max-w-xs h-32 object-cover rounded border"
            onError={() => onContentUrlChange("")}
          />
        </div>
      )}
    </div>
  );
}
