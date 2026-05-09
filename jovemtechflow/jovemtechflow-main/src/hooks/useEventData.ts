
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EventModule {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventContent {
  id: string;
  event_id: string;
  module_id?: string;
  title: string;
  description?: string;
  content_type: string;
  content_url?: string;
  content_text?: string;
  is_required: boolean;
  order_index: number;
  author_id?: string;
  created_at: string;
}

export function useEventData(eventId: string) {
  const [modules, setModules] = useState<EventModule[]>([]);
  const [contents, setContents] = useState<{ [moduleId: string]: EventContent[] }>({});

  const fetchModules = async () => {
    if (!eventId) return;
    
    console.log("Fetching modules for event:", eventId);
    
    const { data: contentData, error: contentError } = await supabase
      .from("event_contents")
      .select("*")
      .eq("event_id", eventId)
      .order("order_index", { ascending: true });

    if (contentError) {
      console.error("Error fetching event contents:", contentError);
      return;
    }

    if (contentData) {
      console.log("Found event contents:", contentData);
      
      const contentsMap: { [moduleId: string]: EventContent[] } = {
        [eventId]: contentData.map(item => ({
          id: item.id,
          event_id: item.event_id,
          title: item.title,
          description: item.description || undefined,
          content_type: item.content_type || 'text',
          content_url: item.content_url || undefined,
          content_text: item.content_text || undefined,
          is_required: item.is_required,
          order_index: item.order_index,
          author_id: item.author_id || undefined,
          created_at: item.created_at || new Date().toISOString()
        }))
      };
      
      console.log("Final contents map:", contentsMap);
      setContents(contentsMap);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [eventId]);

  return {
    modules,
    contents,
    fetchModules
  };
}
