
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";

interface FileUploadFieldProps {
  onFileUploaded: (url: string, fileName: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUploadField({ 
  onFileUploaded, 
  accept = "*/*", 
  maxSizeMB = 10 
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error("Você precisa estar logado para fazer upload de arquivos");
        return;
      }

      // Gerar nome único para o arquivo
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('content-files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        toast.error("Erro ao fazer upload do arquivo: " + error.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('content-files')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        toast.error("Erro ao obter URL do arquivo enviado.");
        return;
      }

      setUploadProgress(100);
      onFileUploaded(urlData.publicUrl, selectedFile.name);
      
      // Resetar estado
      setSelectedFile(null);
      setUploadProgress(0);
      
    } catch {
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-3">
      <Label>Upload de Arquivo</Label>
      
      {!selectedFile ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Clique para selecionar um arquivo (máx. {maxSizeMB}MB)
            </p>
            <Input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <File className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground">
                Fazendo upload... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={uploadFile}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? "Enviando..." : "Fazer Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
