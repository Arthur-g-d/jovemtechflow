
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UsernameSectionProps {
  user: any | null;
  username: string;
  onUsernameUpdated: (name: string) => void;
}

const UsernameSection = ({ user, username, onUsernameUpdated }: UsernameSectionProps) => {
  const [usernameInput, setUsernameInput] = useState(username);
  const [loadingUsername, setLoadingUsername] = useState(false);

  const handleUsernameBlur = async () => {
    if (!user?.id || !usernameInput || usernameInput === username) return;
    setLoadingUsername(true);
    try {
      const { error } = await import("@/integrations/supabase/client")
        .then(({ supabase }) =>
          supabase.from("profiles").update({ username: usernameInput }).eq("id", user.id)
        );
      if (error) throw error;
      onUsernameUpdated(usernameInput);
      toast.success("Nome de usuário atualizado!");
      // Emite evento para atualizar o Navigation
      window.dispatchEvent(new CustomEvent("profile-updated"));
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar nome de usuário");
    }
    setLoadingUsername(false);
  };

  return (
    <div>
      <label className="block mb-1 font-medium">Nome de usuário</label>
      <Input
        value={usernameInput}
        required
        minLength={3}
        maxLength={32}
        onChange={e => setUsernameInput(e.target.value)}
        onBlur={handleUsernameBlur}
        disabled={loadingUsername}
      />
      {loadingUsername && (
        <div className="text-xs text-muted-foreground mt-1">Salvando...</div>
      )}
    </div>
  );
};

export default UsernameSection;
