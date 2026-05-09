
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface ContentTextFieldProps {
  contentType: string;
  contentText: string;
  onContentTextChange: (text: string) => void;
}

export default function ContentTextField({ contentType, contentText, onContentTextChange }: ContentTextFieldProps) {
  const [showPreview, setShowPreview] = useState(false);

  const getTextLabel = () => {
    return contentType === 'reading' ? 'Conteúdo (Leitura)' : 'Conteúdo (Artigo)';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="content-text">
          {getTextLabel()} *
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? 'Ocultar' : 'Visualizar'}
        </Button>
      </div>
      
      {!showPreview ? (
        <Textarea
          id="content-text"
          placeholder="Digite o conteúdo completo aqui..."
          value={contentText}
          onChange={(e) => onContentTextChange(e.target.value)}
          className="min-h-[200px] font-mono text-sm content-text"
          required
        />
      ) : (
        <div className="p-4 border rounded-md bg-muted/50 min-h-[200px] overflow-hidden">
          <div className="prose prose-sm max-w-none">
            {contentText.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2 last:mb-0 content-text break-words">
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
