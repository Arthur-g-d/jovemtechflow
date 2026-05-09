
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Link as LinkIcon, Video, Image, BookOpen, FileDown, Upload } from "lucide-react";

interface ContentType {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CONTENT_TYPES: ContentType[] = [
  { 
    value: "article", 
    label: "Artigo", 
    icon: FileText,
    description: "Texto educacional completo"
  },
  { 
    value: "link", 
    label: "Link Externo", 
    icon: LinkIcon,
    description: "Referência para recursos externos"
  },
  { 
    value: "video", 
    label: "Vídeo", 
    icon: Video,
    description: "Conteúdo audiovisual"
  },
  { 
    value: "image", 
    label: "Imagem", 
    icon: Image,
    description: "Material visual ilustrativo"
  },
  { 
    value: "document", 
    label: "Documento", 
    icon: FileDown,
    description: "PDF, apresentações, etc."
  },
  { 
    value: "reading", 
    label: "Leitura Obrigatória", 
    icon: BookOpen,
    description: "Texto fundamental do módulo"
  },
  { 
    value: "file", 
    label: "Upload de Arquivo", 
    icon: Upload,
    description: "Enviar arquivo do computador"
  }
];

interface ContentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function ContentTypeSelector({ value, onValueChange }: ContentTypeSelectorProps) {
  const selectedType = CONTENT_TYPES.find(type => type.value === value);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o tipo de conteúdo">
            {selectedType && (
              <div className="flex items-center gap-2">
                <selectedType.icon className="h-4 w-4" />
                <span>{selectedType.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CONTENT_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex items-center gap-2">
                <type.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedType && (
        <p className="text-sm text-muted-foreground">
          {selectedType.description}
        </p>
      )}
    </div>
  );
}

export { CONTENT_TYPES };
