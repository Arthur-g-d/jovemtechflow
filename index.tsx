// EditProfile/index.tsx — refatorado para usar services.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvatarSection from "@/components/EditProfile/AvatarSection";
import { useConfirm } from "@/components/ConfirmProvider";
import { authService, profileService, SupabaseError } from "@/services";

export default function EditProfile() {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{ username: string; bio: string }>({
    username: "",
    bio: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          navigate("/auth", { replace: true });
          return;
        }
        if (cancelled) return;
        setUserId(user.id);

        const isAdminFlag = await authService.hasRole(user.id, "admin");
        if (cancelled) return;
        setIsAdmin(isAdminFlag);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erro ao carregar sessão.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: () => profileService.fetchById(userId!),
  });

  useEffect(() => {
    if (profile) {
      setForm({ username: profile.username ?? "", bio: profile.bio ?? "" });
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      await profileService.update(userId, {
        username: form.username.trim(),
        bio: form.bio,
      });
      toast.success("Perfil atualizado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddAdmin() {
    const email = adminEmail.trim();
    if (!email) {
      toast.error("Informe o email do usuário.");
      return;
    }

    const ok = await confirm({
      title: "Promover usuário a administrador?",
      description: `${email} ganhará acesso total à plataforma. Continuar?`,
      destructive: true,
    });
    if (!ok) return;

    try {
      const target = await profileService.findByEmail(email);
      if (!target) {
        toast.error("Usuário não encontrado.");
        return;
      }
      await profileService.promoteToAdmin(target.user_id);
      toast.success("Usuário promovido a administrador.");
      setAdminEmail("");
    } catch (err) {
      if (err instanceof SupabaseError && err.isPermissionDenied) {
        toast.error("Apenas administradores podem promover usuários.");
        return;
      }
      toast.error(
        err instanceof Error ? err.message : "Não foi possível promover o usuário.",
      );
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarSection
            userId={profile.id}
            username={profile.username}
            currentAvatarUrl={profile.avatar_url}
          />

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                required
                minLength={3}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                maxLength={280}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </form>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Promover administrador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta ação dá ao usuário acesso total. Use com cautela.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <Button onClick={handleAddAdmin} variant="destructive">
                Promover
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
