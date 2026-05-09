
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Module, ModuleContent } from "@/types/module";

export function useModuleData(projectId: string) {
  const [modules, setModules] = useState<Module[]>([]);
  const [contents, setContents] = useState<{ [moduleId: string]: ModuleContent[] }>({});

  const fetchModules = async () => {
    if (!projectId) return;
    
    console.log("Fetching modules for project:", projectId);
    
    const { data: moduleData, error: moduleError } = await supabase
      .from("project_modules")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });

    if (moduleError) {
      console.error("Error fetching modules:", moduleError);
      return;
    }

    if (moduleData) {
      console.log("Found modules:", moduleData);
      setModules(moduleData);
      
      // Fetch contents for each module
      const contentPromises = moduleData.map(async (module) => {
        console.log(`Fetching contents for module ${module.id}`);
        const { data: contentData, error: contentError } = await supabase
          .from("project_contents")
          .select("*")
          .eq("module_id", module.id)
          .order("order_index", { ascending: true });
        
        if (contentError) {
          console.error("Error fetching contents for module", module.id, ":", contentError);
          return { moduleId: module.id, contents: [] };
        }
        
        console.log(`Contents for module ${module.title}:`, contentData);
        return { moduleId: module.id, contents: contentData || [] };
      });
      
      const contentResults = await Promise.all(contentPromises);
      const contentsMap: { [moduleId: string]: ModuleContent[] } = {};
      
      contentResults.forEach(({ moduleId, contents }) => {
        contentsMap[moduleId] = contents;
      });
      
      console.log("Final contents map:", contentsMap);
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
