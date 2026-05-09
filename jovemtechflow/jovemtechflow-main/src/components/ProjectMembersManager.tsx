
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  user_id: string;
  role: string;
}
interface Props {
  projectId: string;
}

const ProjectMembersManager = ({ projectId }: Props) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [newUserId, setNewUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // check if admin first
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return setIsAdmin(false);
      supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then((r) => setIsAdmin(!!r.data));
    });
  }, []);

  // Busca os membros do projeto
  const fetchMembers = () => {
    if (!projectId) return;
    (supabase as any)
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .then(({ data }: { data: any[] }) => setMembers(data ?? []));
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Adiciona membro pelo id do usuário
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId || loading) return;
    setLoading(true);

    // Verificação rápida para evitar duplicidade na interface
    if (members.find(m => m.user_id === newUserId)) {
      setLoading(false);
      setNewUserId("");
      return;
    }

    const { error } = await (supabase as any).from("project_members").insert({
      project_id: projectId,
      user_id: newUserId,
    });

    setNewUserId("");
    setLoading(false);

    // Atualiza imediatamente após adicionar, mesmo se houver erro, para manter interface consistente
    fetchMembers();
  };

  // Remove membro
  const handleRemove = async (member: Member) => {
    setLoading(true);
    await (supabase as any)
      .from("project_members")
      .delete()
      .eq("id", member.id);
    fetchMembers();
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="text-muted-foreground italic mb-4">
        Apenas administradores podem gerenciar membros deste projeto.
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Membros do Projeto</h3>
      <form onSubmit={handleAddMember} className="flex gap-2 mb-3">
        <Input
          type="text"
          placeholder="Cole aqui o UUID do usuário"
          value={newUserId}
          onChange={(e) => setNewUserId(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !newUserId}>
          Adicionar membro
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <Badge key={m.id} className="flex items-center gap-2">
            <span className="truncate max-w-[120px]" title={m.user_id}>{m.user_id}</span>
            <span className="text-xs italic">({m.role})</span>
            <Button
              size="icon"
              variant="outline"
              className="ml-1"
              onClick={() => handleRemove(m)}
              title="Remover"
              disabled={loading}
            >
              ×
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProjectMembersManager;
