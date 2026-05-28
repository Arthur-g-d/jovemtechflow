
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import ModuleCard from "./ModuleCard";
import NewModuleForm from "./NewModuleForm";
import ConfirmDialog from "./ConfirmDialog";
import { useModuleData } from "@/hooks/useModuleData";
import { useModuleActions } from "@/hooks/useModuleActions";

interface Props {
  projectId: string;
  isAdmin?: boolean;
}

export default function ModuleManager({ projectId, isAdmin = false }: Props) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showNewModuleForm, setShowNewModuleForm] = useState(false);
  const [pendingDeleteModule, setPendingDeleteModule] = useState<string | null>(null);
  const [pendingDeleteContent, setPendingDeleteContent] = useState<string | null>(null);

  const { modules, contents, fetchModules } = useModuleData(projectId);
  const { loading, addModule, deleteModule, addContentToModule, deleteContent } = useModuleActions(projectId, fetchModules);

  const handleAddModule = async (moduleData: { title: string; description: string }) => {
    await addModule(moduleData, modules.length);
    setShowNewModuleForm(false);
  };

  const handleAddContentToModule = async (moduleId: string, contentData: any) => {
    const moduleContents = contents[moduleId] || [];
    await addContentToModule(moduleId, contentData, moduleContents.length);
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Gerenciamento de Módulos Educacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Organize seu curso em módulos sequenciais. Cada módulo pode conter múltiplos conteúdos como artigos, vídeos, links e documentos.
            </p>
          </div>

          {!showNewModuleForm ? (
            <Button
              onClick={() => setShowNewModuleForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Novo Módulo
            </Button>
          ) : (
            <NewModuleForm
              loading={loading}
              onSubmit={handleAddModule}
              onCancel={() => setShowNewModuleForm(false)}
            />
          )}
        </CardContent>
      </Card>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum módulo criado</h3>
            <p className="text-muted-foreground">
              Comece criando o primeiro módulo do seu curso.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              contents={contents[module.id] || []}
              expanded={expandedModules.has(module.id)}
              loading={loading}
              onToggleExpansion={toggleModuleExpansion}
              onDelete={(id) => setPendingDeleteModule(id)}
              onAddContent={handleAddContentToModule}
              onDeleteContent={(id) => setPendingDeleteContent(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteModule}
        title="Deletar módulo"
        description="Tem certeza que deseja deletar este módulo? Todos os conteúdos serão removidos permanentemente."
        confirmLabel="Deletar"
        onConfirm={async () => {
          if (pendingDeleteModule) await deleteModule(pendingDeleteModule);
          setPendingDeleteModule(null);
        }}
        onCancel={() => setPendingDeleteModule(null)}
      />

      <ConfirmDialog
        open={!!pendingDeleteContent}
        title="Deletar conteúdo"
        description="Tem certeza que deseja deletar este conteúdo? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        onConfirm={async () => {
          if (pendingDeleteContent) await deleteContent(pendingDeleteContent);
          setPendingDeleteContent(null);
        }}
        onCancel={() => setPendingDeleteContent(null)}
      />
    </div>
  );
}
