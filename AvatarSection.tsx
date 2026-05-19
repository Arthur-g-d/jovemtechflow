// AvatarSection.tsx — refatorado para usar uploadService.
//
// Mudanças:
//   - Validação MIME + tamanho movida para `uploadService.validateAvatar`.
//   - Upload + persist em profiles encapsulados em `uploadService.uploadAvatar`.
//   - Componente fica como UI pura + tratamento de erros.

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  uploadService,
  FileValidationError,
  AVATAR_ALLOWED_MIME,
} from "@/services";

interface AvatarSectionProps {
  userId: string;
  username: string;
  currentAvatarUrl: string | null;
  onAvatarUpdated?: (newPath: string) => void;
}

export default function AvatarSection({
  userId,
  username,
  currentAvatarUrl,
  onAvatarUpdated,
}: AvatarSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);

  const initials = username
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const publicUrl = avatarUrl ? uploadService.getAvatarPublicUrl(avatarUrl) : null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = await uploadService.uploadAvatar(userId, file);
      setAvatarUrl(path);
      onAvatarUpdated?.(path);
      toast.success("Foto de perfil atualizada!");
      window.dispatchEvent(
        new CustomEvent("profile-updated", { detail: { avatar_url: path } }),
      );
    } catch (err) {
      if (err instanceof FileValidationError) {
        toast.error(err.message);
      } else {
        toast.error(err instanceof Error ? err.message : "Erro no upload.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        {publicUrl && <AvatarImage src={publicUrl} alt={username} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div>
        <label htmlFor="avatar-upload">
          <Button asChild disabled={uploading}>
            <span className="cursor-pointer inline-flex items-center gap-2">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Enviando..." : "Trocar foto"}
            </span>
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept={AVATAR_ALLOWED_MIME.join(",")}
          onChange={handleFile}
          disabled={uploading}
          className="sr-only"
        />
        <p className="text-xs text-muted-foreground mt-2">
          PNG, JPEG, WebP ou GIF. Máximo 5MB.
        </p>
      </div>
    </div>
  );
}
