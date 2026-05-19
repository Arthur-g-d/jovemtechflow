// useEventData.ts — hooks por evento individual.
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services";

export function useEventData(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event", eventId],
    enabled: !!eventId,
    queryFn: () => eventsService.fetchEventById(eventId!),
  });
}

export function useEventRegistrationCount(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-registration-count", eventId],
    enabled: !!eventId,
    queryFn: () => eventsService.countRegistrations(eventId!),
  });
}

export function useIsRegisteredForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["is-registered-for-event", eventId],
    enabled: !!eventId,
    queryFn: () => eventsService.isRegistered(eventId!),
  });
}
