
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
      event_id: eventId,
      author_id: user.id,
      is_required: contentData.is_required,
      order_index: eventContentsLength,
    };

    const { error } = await supabase
      .from("event_contents")
      .insert(insertData)
      .select()
      .maybeSingle();

    if (!error) {
      await onDataChange();
    }
    setLoading(false);
  };

  const deleteContent = async (contentId: string) => {
    setLoading(true);

    const { error } = await supabase.from("event_contents").delete().eq("id", contentId);

    if (!error) {
      await onDataChange();
    }
    setLoading(false);
  };

  const deleteEvent = async () => {
    setLoading(true);

    const { error: contentError } = await supabase
      .from("event_contents")
      .delete()
      .eq("event_id", eventId);

    if (contentError) {
      setLoading(false);
      return false;
    }

    await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId);

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    setLoading(false);
    return !error;
  };

  return {
    loading,
    addContentToEvent,
    deleteContent,
    deleteEvent
  };
}
