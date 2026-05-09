
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AvatarSectionProps {
  user: any | null;
  avatarFilename?: string;
  onAvatarUploaded: (filename: string) => void;
}

const AvatarSection = ({ user, avatarFilename, onAvatarUploaded }: AvatarSectionProps) => {
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Função para buscar uma URL assinada temporariamente
  const fetchAvatarUrl = async (filename: string) => {
    if (!user?.id) return;
    const { data, error } = await supabase.storage
      .from("private-avatars")
      .createSignedUrl(`${user.id}/${filename}`, 60 * 60); // 1h
    if (error) {
      setAvatarUrl(null);
    } else {
      setAvatarUrl(data.signedUrl);
    }
  };

  useEffect(() => {
    if (avatarFilename) fetchAvatarUrl(avatarFilename);
    else setAvatarUrl(null);
    // eslint-disable-next-line
  }, [avatarFilename, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setLoadingAvatar(true);
    try {
      const filePath = `${user.id}/${file.name}`;
      // Faz upload para bucket privado
      const { error } = await supabase.storage
        .from("private-avatars")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      toast.success("Avatar atualizado!");

      // Atualiza URL assinada temporária
      const { data } = await supabase.storage
        .from("private-avatars")
        .createSignedUrl(filePath, 60 * 60); // 1h

      setAvatarUrl(data?.signedUrl ?? null);
      // Passa o nome do arquivo para o componente pai armazenar
      onAvatarUploaded(file.name);
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar avatar");
    }
    setLoadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className={`w-16 h-16 rounded-full object-cover border ${loadingAvatar ? "opacity-60" : ""}`}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-full">
          <UserIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={loadingAvatar}
        >
          {loadingAvatar ? "Atualizando..." : "Trocar foto"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  );
};

export default AvatarSection;
