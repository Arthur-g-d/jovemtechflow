
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import AvatarSection from "./AvatarSection";
import UsernameSection from "./UsernameSection";
import EmailSection from "./EmailSection";
import PasswordSection from "./PasswordSection";

export type ProfileData = {
  username: string;
  // avatar_url?: string; // Não usamos/fetch do banco
};

const EditProfile = () => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [email, setEmail] = useState("");
  const [avatarFilename, setAvatarFilename] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setEmail(user?.email ?? "");
    });
    // avatarFilename continua sempre undefined/local aqui, nunca vem do banco
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (error) {
          setProfile(null);
          return;
        }
        if (data) {
          setProfile({ username: data.username });
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileUpdate = (updatedFields: Partial<ProfileData>) => {
    setProfile(prev => prev ? { ...prev, ...updatedFields } : { ...updatedFields } as ProfileData);
  };

  // Email only (avatar and username são atualizados automaticamente)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email && email !== user.email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email });
        if (emailErr) throw emailErr;
        toast.success("Email atualizado!");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar perfil");
    }
    setLoading(false);
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
          <UsernameSection
            user={user}
            username={profile?.username ?? ""}
            onUsernameUpdated={name => handleProfileUpdate({ username: name })}
          />
          <EmailSection email={email} setEmail={setEmail} />
          <PasswordSection email={email} />
          <button type="submit" className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md" disabled={loading}>
            Salvar alterações
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProfile;
