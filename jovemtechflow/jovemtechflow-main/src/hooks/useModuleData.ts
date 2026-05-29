
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Module, ModuleContent } from "@/types/module";

export function useModuleData(projectId: string) {
  const [modules, setModules] = useState<Module[]>([]);
  const [contents, setContents] = useState<{ [moduleId: string]: ModuleContent[] }>({});

  const fetchModules = async () => {
    if (!projectId) return;

    const { data: moduleData, error: moduleError } = await supabase
      .from("project_modules")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });

    if (moduleError) return;

    if (moduleData) {
      setModules(moduleData);

      const contentPromises = moduleData.map(async (module) => {
        const { data: contentData } = await supabase
          .from("project_contents")
          .select("*")
          .eq("module_id", module.id)
          .order("order_index", { ascending: true });

        return { moduleId: module.id, contents: contentData || [] };
      });

      const contentResults = await Promise.allSettled(contentPromises);
      const contentsMap: { [moduleId: string]: ModuleContent[] } = {};

      contentResults.forEach((result) => {
        if (result.status === "fulfilled") {
          contentsMap[result.value.moduleId] = result.value.contents;
        }
      });

      setContents(contentsMap);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [projectId]);

  return {
    modules,
    contents,
    fetchModules
  };
}
