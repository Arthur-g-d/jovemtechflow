
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Settings } from "lucide-react";
import ModuleManager from "./ModuleManager";

interface Props {
  projectId: string;
  isAdmin?: boolean;
}

const ProjectContentManager = ({ projectId, isAdmin = false }: Props) => {
  const [forceIsAdmin, setForceIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (!isAdmin) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        const { data } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setForceIsAdmin(!!data);
      });
    }
  }, [isAdmin]);

  if (!isAdmin && !forceIsAdmin) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Plataforma Educacional Profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Sistema Completo de Gestão de Cursos
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Crie módulos estruturados com progressão hierárquica. Organize conteúdos em sequência lógica, 
                  defina obrigatoriedade e acompanhe o progresso dos alunos por módulo.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModuleManager projectId={projectId} isAdmin={isAdmin || forceIsAdmin} />
    </div>
  );
};

export default ProjectContentManager;
