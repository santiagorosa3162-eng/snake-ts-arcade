import { AnalyticsEvent } from "../core/types";
import { getAnalyticsOptIn } from "../persistence/storage";

const eventQueue: AnalyticsEvent[] = [];

export function trackEvent(event: AnalyticsEvent): void {
  if (!getAnalyticsOptIn()) return;
  eventQueue.push(event);
}

export function flushEvents(): AnalyticsEvent[] {
  const events = [...eventQueue];
  eventQueue.length = 0;
  return events;
}

export function getEventCount(): number {
  return eventQueue.length;
}
