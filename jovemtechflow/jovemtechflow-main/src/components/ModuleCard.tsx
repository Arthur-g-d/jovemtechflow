
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import ModuleContentForm from "./ModuleContentForm";
import ModuleContentList from "./ModuleContentList";
import { Module, ModuleContent, ModuleContentInput } from "@/types/module";

interface ModuleCardProps {
  module: Module;
  index: number;
  contents: ModuleContent[];
  expanded: boolean;
  loading: boolean;
  onToggleExpansion: (moduleId: string) => void;
  onDelete: (moduleId: string) => void;
  onAddContent: (moduleId: string, content: ModuleContentInput) => void;
  onDeleteContent: (contentId: string) => void;
}

export default function ModuleCard({
  module,
  index,
  contents,
  expanded,
  loading,
  onToggleExpansion,
  onDelete,
  onAddContent,
  onDeleteContent
}: ModuleCardProps) {
  return (
    <Card key={module.id} className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpansion(module.id)}
              className="p-1"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Módulo {index + 1}</Badge>
              <CardTitle className="text-lg">{module.title}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {contents.length} conteúdos
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(module.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {module.description && (
          <p className="text-muted-foreground mt-2">{module.description}</p>
        )}
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-6">
          <ModuleContentForm 
            onAddContent={(contentData) => onAddContent(module.id, contentData)}
            loading={loading}
          />
          
          <ModuleContentList 
            contents={contents}
            onDelete={onDeleteContent}
            loading={loading}
          />
        </CardContent>
      )}
    </Card>
  );
}
