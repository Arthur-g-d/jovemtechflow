
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentTypeSelector from "./ContentTypeSelector";
import ContentUrlField from "./ContentUrlField";
import ContentTextField from "./ContentTextField";
import ContentRequiredToggle from "./ContentRequiredToggle";
import FileUploadField from "./FileUploadField";
import { Plus } from "lucide-react";

interface ModuleContentFormProps {
  onAddContent: (content: any) => void;
  loading?: boolean;
}

export default function ModuleContentForm({ onAddContent, loading }: ModuleContentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("article");
  const [contentUrl, setContentUrl] = useState("");
  const [contentText, setContentText] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Por favor, insira um título para o conteúdo.");
      return;
    }

    // Validar se campos obrigatórios estão preenchidos
    const needsUrl = ['link', 'video', 'document', 'image', 'file'].includes(contentType);
    const needsText = ['article', 'reading'].includes(contentType);

    if (needsUrl && !contentUrl.trim()) {
      alert("Por favor, insira a URL ou faça upload do arquivo.");
      return;
    }

    if (needsText && !contentText.trim()) {
      alert("Por favor, insira o conteúdo de texto.");
      return;
    }

    console.log("Submitting module content:", {
      title,
      description,
      content_type: contentType,
      content_url: contentUrl || undefined,
      content_text: contentText || undefined,
      is_required: isRequired,
    });

    const content = {
      title: title.trim(),
      description: description.trim() || undefined,
      content_type: contentType,
      content_url: contentUrl.trim() || undefined,
      content_text: contentText.trim() || undefined,
      is_required: isRequired,
    };

    onAddContent(content);
    
    // Reset form
    setTitle("");
    setDescription("");
    setContentType("article");
    setContentUrl("");
    setContentText("");
    setIsRequired(true);
  };

  const handleFileUploaded = (url: string, fileName: string) => {
    setContentUrl(url);
    if (!title.trim()) {
      setTitle(fileName);
    }
  };

  const needsUrl = ['link', 'video', 'document', 'image'].includes(contentType);
  const needsText = ['article', 'reading'].includes(contentType);
  const needsFile = contentType === 'file';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Conteúdo ao Módulo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module-content-title">Título do Conteúdo *</Label>
              <Input
                id="module-content-title"
                placeholder="Ex: Introdução ao módulo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Conteúdo</Label>
              <ContentTypeSelector 
                value={contentType} 
                onValueChange={setContentType} 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="module-content-description">Descrição</Label>
            <Textarea
              id="module-content-description"
              placeholder="Descreva brevemente este conteúdo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {needsFile && (
            <FileUploadField
              onFileUploaded={handleFileUploaded}
              accept="*/*"
              maxSizeMB={50}
            />
          )}

          {needsUrl && (
            <ContentUrlField
              contentType={contentType}
              contentUrl={contentUrl}
              onContentUrlChange={setContentUrl}
            />
          )}

          {needsText && (
            <ContentTextField
              contentType={contentType}
              contentText={contentText}
              onContentTextChange={setContentText}
            />
          )}

          <ContentRequiredToggle
            isRequired={isRequired}
            onIsRequiredChange={setIsRequired}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adicionando..." : "Adicionar Conteúdo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
