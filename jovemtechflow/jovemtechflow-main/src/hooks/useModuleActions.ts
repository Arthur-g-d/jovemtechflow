
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModuleContentInput } from "@/types/module";

export function useModuleActions(projectId: string, onDataChange: () => void) {
  const [loading, setLoading] = useState(false);

  const addModule = async (moduleData: { title: string; description: string }, moduleCount: number) => {
    if (!moduleData.title.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("project_modules")
      .insert({
        project_id: projectId,
        title: moduleData.title,
        description: moduleData.description,
        order_index: moduleCount,
        is_required: true
      })
      .select()
      .single();

    if (!error) {
      await onDataChange();
    }
    setLoading(false);
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja deletar este módulo? Todos os conteúdos serão removidos.")) return;

    setLoading(true);

    const { error: contentError } = await supabase
      .from("project_contents")
      .delete()
      .eq("module_id", moduleId);

    if (contentError) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("project_modules").delete().eq("id", moduleId);

    if (!error) {
      await onDataChange();
    }
    setLoading(false);
  };

  const addContentToModule = async (moduleId: string, contentData: ModuleContentInput, moduleContentsLength: number) => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const insertData = {
      title: contentData.title,
      description: contentData.description,
      content_type: contentData.content_type,
      content_url: contentData.content_url || null,
      content_text: contentData.content_text || null,
      is_required: contentData.is_required,
      module_id: moduleId,
      project_id: projectId,
      order_index: moduleContentsLength,
      author_id: user.id,
    };

    const { error } = await supabase
      .from("project_contents")
      .insert(insertData)
      .select()
      .single();

    if (!error) {
      await onDataChange();
    }
    setLoading(false);
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm("Tem certeza que deseja deletar este conteúdo?")) return;

    setLoading(true);

    const { error } = await supabase.from("project_contents").delete().eq("id", contentId);

    if (!error) {
      await onDataChange();
    }
    setLoading(false);
  };

  return {
    loading,
    addModule,
    deleteModule,
    addContentToModule,
    deleteContent
  };
}
