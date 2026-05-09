
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import AvatarSection from "./EditProfile/AvatarSection";

type ProfileWithAvatar = {
  username: string;
  avatar_url?: string;
};

const EditProfile = () => {
  const [user, setUser] = useState<any | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFilename, setAvatarFilename] = useState<string | undefined>(undefined);
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Novo: estado para adicionar admins
  const [newAdminUUID, setNewAdminUUID] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setEmail(user?.email ?? "");
      setAvatarFilename(undefined);
      // Checa se é admin:
      if (user?.id) {
        supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then((res) => setIsAdmin(!!res.data));
      }
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (error) return;
        if (data) setUsername((data as any).username ?? "");
      }
    };
    fetchProfile();
  }, [user]);

  const handleUsernameBlur = async () => {
    if (!user?.id || !username) return;
    setLoadingUsername(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Nome de usuário atualizado!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar nome de usuário");
    }
    setLoadingUsername(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email && user && email !== user.email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email });
        if (emailErr) throw emailErr;
        toast.success("Email atualizado!");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar perfil");
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error("Erro ao enviar link de redefinição.");
    } else {
      toast.success("Link de redefinição de senha enviado para seu email.");
    }
  };

  // Novo: Função para adicionar admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUUID) return;
    setAddingAdmin(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: newAdminUUID, role: "admin" }])
        .select();
      if (error) throw error;
      toast.success("Administrador adicionado com sucesso!");
      setNewAdminUUID("");
    } catch (e: any) {
      toast.error(e.message || "Erro ao adicionar administrador");
    }
    setAddingAdmin(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSave}>
          <AvatarSection
            user={user}
            avatarFilename={avatarFilename}
            onAvatarUploaded={setAvatarFilename}
          />
          <div>
            <label className="block mb-1 font-medium">Nome de usuário</label>
            <Input
              value={username}
              required
              minLength={3}
              maxLength={32}
              onChange={e => setUsername(e.target.value)}
              onBlur={handleUsernameBlur}
              disabled={loadingUsername}
            />
            {loadingUsername && (
              <div className="text-xs text-muted-foreground mt-1">Salvando...</div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input
              type="email"
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Button type="button" variant="outline" onClick={handlePasswordReset}>
              Redefinir senha por email
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Salvar alterações
          </Button>
        </form>
        {/* Novo bloco para admin */}
        {isAdmin && (
          <div className="mt-8 p-4 bg-muted rounded border space-y-3">
            <h4 className="font-semibold text-base">Adicionar Administrador</h4>
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleAddAdmin}>
              <Input
                placeholder="UUID do usuário"
                value={newAdminUUID}
                onChange={e => setNewAdminUUID(e.target.value)}
                className="w-full"
                required
              />
              <Button type="submit" disabled={addingAdmin}>
                {addingAdmin ? "Adicionando..." : "Adicionar"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">Cole aqui o UUID do usuário que você deseja tornar administrador.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EditProfile;
