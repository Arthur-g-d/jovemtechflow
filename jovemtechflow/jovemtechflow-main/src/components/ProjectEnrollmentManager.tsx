
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, UserPlus, UserMinus } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface ProjectEnrollmentManagerProps {
  projectId: string;
}

export default function ProjectEnrollmentManager({ projectId }: ProjectEnrollmentManagerProps) {
  const [project, setProject] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [maxEnrollments, setMaxEnrollments] = useState<number | null>(null);
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; username: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjectData();
    fetchEnrollments();
  }, [projectId]);

  const fetchProjectData = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (data) {
      setProject(data);
      setMaxEnrollments(data.max_enrollments);
      setEnrollmentOpen(data.enrollment_status === 'open');
    }
  };

  const fetchEnrollments = async () => {
    const { data } = await supabase
      .from("project_enrollments")
      .select(`
        *,
        profiles (
          username,
          email
        )
      `)
      .eq("project_id", projectId)
      .order("enrolled_at", { ascending: false });
    
    setEnrollments(data || []);
  };

  const updateProjectSettings = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("projects")
      .update({
        max_enrollments: maxEnrollments,
        enrollment_status: enrollmentOpen ? 'open' : 'closed'
      })
      .eq("id", projectId);

    if (error) {
      console.error("Erro ao atualizar projeto:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações do projeto",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do projeto foram salvas com sucesso"
      });
      fetchProjectData();
    }
    setLoading(false);
  };

  const enrollUserByEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira um email válido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Buscar usuário por email na tabela profiles
      const { data: profiles, error: searchError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", email.trim())
        .maybeSingle();

      if (searchError || !profiles) {
        toast({
          title: "Usuário não encontrado",
          description: "Não foi encontrado nenhum usuário com este email",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Verificar se já está inscrito
      const { data: existing } = await supabase
        .from("project_enrollments")
        .select("*")
        .eq("user_id", profiles.id)
        .eq("project_id", projectId)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Usuário já inscrito",
          description: "Este usuário já está inscrito neste projeto",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Inscrever usuário
      const { error } = await supabase
        .from("project_enrollments")
        .insert({
          user_id: profiles.id,
          project_id: projectId,
          enrolled_by_admin: true
        });

      if (error) {
        console.error("Erro ao inscrever usuário:", error);
        toast({
          title: "Erro ao inscrever",
          description: "Ocorreu um erro ao inscrever o usuário",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Usuário inscrito",
          description: `${profiles.username} foi inscrito no projeto com sucesso`
        });
        setEmail("");
        fetchEnrollments();
      }
    } catch (error) {
      console.error("Erro na inscrição:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const removeEnrollment = async (enrollmentId: string, username: string) => {
    const { error } = await supabase
      .from("project_enrollments")
      .delete()
      .eq("id", enrollmentId);

    if (error) {
      console.error("Erro ao remover usuário:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover usuário",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Usuário removido",
        description: `${username} foi removido do projeto`
      });
      fetchEnrollments();
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Inscrição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configurações de Inscrição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enrollment-status">Inscrições Abertas</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que usuários se inscrevam no projeto
              </p>
            </div>
            <Switch
              id="enrollment-status"
              checked={enrollmentOpen}
              onCheckedChange={setEnrollmentOpen}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-enrollments">Máximo de Inscrições</Label>
            <Input
              id="max-enrollments"
              type="number"
              placeholder="Deixe vazio para ilimitado"
              value={maxEnrollments || ""}
              onChange={(e) => setMaxEnrollments(e.target.value ? parseInt(e.target.value) : null)}
            />
            <p className="text-sm text-muted-foreground">
              Deixe vazio para permitir inscrições ilimitadas
            </p>
          </div>

          <Button onClick={updateProjectSettings} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>

      {/* Inscrever por Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Inscrever Usuário por Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enrollUserByEmail()}
            />
            <Button onClick={enrollUserByEmail} disabled={loading || !email.trim()}>
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? "Inscrevendo..." : "Inscrever"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Inscritos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Inscritos ({enrollments.length})
            </span>
            {maxEnrollments && (
              <Badge variant="outline">
                {enrollments.length}/{maxEnrollments}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum usuário inscrito ainda
            </p>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{enrollment.profiles?.username || "Usuário"}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.profiles?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={enrollment.enrolled_by_admin ? "secondary" : "outline"} className="text-xs">
                        {enrollment.enrolled_by_admin ? "Inscrito por Admin" : "Auto-inscrição"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingRemove({ id: enrollment.id, username: enrollment.profiles?.username || "Usuário" })}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!pendingRemove}
        title="Remover usuário"
        description={`Tem certeza que deseja remover ${pendingRemove?.username} do projeto?`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (pendingRemove) removeEnrollment(pendingRemove.id, pendingRemove.username);
          setPendingRemove(null);
        }}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
