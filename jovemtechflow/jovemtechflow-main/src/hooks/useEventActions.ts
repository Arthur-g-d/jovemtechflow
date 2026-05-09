
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EventContentInput {
  title: string;
  description?: string;
  content_type: string;
  content_url?: string;
  content_text?: string;
  is_required: boolean;
}

export function useEventActions(eventId: string, onDataChange: () => void) {
  const [loading, setLoading] = useState(false);

  const addContentToEvent = async (contentData: EventContentInput, eventContentsLength: number) => {
    setLoading(true);
    console.log("Adding content to event:", eventId, contentData);
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      console.error("User not authenticated");
      setLoading(false);
      return;
    }
    
    const insertData = {
      title: contentData.title,
      description: contentData.description,
      content_type: contentData.content_type,
      content_url: contentData.content_url || null,
      content_text: contentData.content_text || null,
      event_id: eventId,
      author_id: user.id,
      is_required: contentData.is_required,
      order_index: eventContentsLength,
    };

    console.log("Inserting event content data:", insertData);

    const { data, error } = await supabase
      .from("event_contents")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error adding event content:", error);
      console.error("Error details:", error.message, error.details);
    } else {
      console.log("Event content added successfully:", data);
      await onDataChange();
    }
    setLoading(false);
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm("Tem certeza que deseja deletar este conteúdo?")) return;
    
    setLoading(true);
    console.log("Deleting event content:", contentId);
    
    const { error } = await supabase.from("event_contents").delete().eq("id", contentId);
    
    if (error) {
      console.error("Error deleting event content:", error);
    } else {
      console.log("Event content deleted successfully");
      await onDataChange();
    }
    setLoading(false);
  };

  const deleteEvent = async () => {
    if (!confirm("Tem certeza que deseja deletar este evento? Todos os conteúdos serão removidos.")) return;
    
    setLoading(true);
    console.log("Deleting event:", eventId);
    
    // First delete all contents in this event
    const { error: contentError } = await supabase
      .from("event_contents")
      .delete()
      .eq("event_id", eventId);
    
    if (contentError) {
      console.error("Error deleting event contents:", contentError);
    }
    
    // Delete event registrations
    const { error: registrationError } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId);
    
    if (registrationError) {
      console.error("Error deleting event registrations:", registrationError);
    }
    
    // Then delete the event
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    
    if (error) {
      console.error("Error deleting event:", error);
    } else {
      console.log("Event deleted successfully");
      return true;
    }
    setLoading(false);
    return false;
  };

  return {
    loading,
    addContentToEvent,
    deleteContent,
    deleteEvent
  };
}
