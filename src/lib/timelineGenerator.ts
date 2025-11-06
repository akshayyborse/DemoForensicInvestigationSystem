import { ForensicEvent } from './supabase';

export interface TimelineEvent extends ForensicEvent {
  narrative: string;
  relatedEvents?: string[];
}

export interface CorrelatedTimeline {
  title: string;
  events: TimelineEvent[];
  narrative: string;
  patterns: string[];
}

export function correlateEvents(events: ForensicEvent[]): CorrelatedTimeline {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const timelineEvents: TimelineEvent[] = sortedEvents.map((event) => ({
    ...event,
    narrative: generateEventNarrative(event),
    relatedEvents: findRelatedEvents(event, sortedEvents),
  }));

  const patterns = detectPatterns(timelineEvents);
  const narrative = generateOverallNarrative(timelineEvents, patterns);

  return {
    title: `Forensic Timeline - ${sortedEvents.length} Events`,
    events: timelineEvents,
    narrative,
    patterns,
  };
}

function generateEventNarrative(event: ForensicEvent): string {
  const time = new Date(event.timestamp).toLocaleString();
  const user = event.user_id || 'Unknown user';
  const location = event.country ? `from ${event.country}` : 'from unknown location';
  const ip = event.ip_address ? ` (${event.ip_address})` : '';

  switch (event.event_type) {
    case 'login':
      return `${time}: ${user} attempted login ${location}${ip} - ${event.status}`;
    case 'file_access':
      return `${time}: ${user} ${event.action} on ${event.resource || 'unknown file'} ${location}${ip} - ${event.status}`;
    case 'network':
      return `${time}: Network activity by ${user} - ${event.action} ${location}${ip}`;
    default:
      return `${time}: ${event.event_type} event by ${user} ${location}${ip}`;
  }
}

function findRelatedEvents(event: ForensicEvent, allEvents: ForensicEvent[]): string[] {
  const related: string[] = [];
  const eventTime = new Date(event.timestamp).getTime();

  for (const other of allEvents) {
    if (other.id === event.id) continue;

    const otherTime = new Date(other.timestamp).getTime();
    const timeDiff = Math.abs(eventTime - otherTime);

    const sameUser = event.user_id && other.user_id === event.user_id;
    const sameIp = event.ip_address && other.ip_address === event.ip_address;
    const withinTimeWindow = timeDiff < 30 * 60 * 1000;

    if ((sameUser || sameIp) && withinTimeWindow) {
      related.push(other.id);
    }
  }

  return related;
}

function detectPatterns(events: TimelineEvent[]): string[] {
  const patterns: string[] = [];

  const foreignLogins = events.filter(
    (e) => e.event_type === 'login' && e.country && e.country !== 'US'
  );
  if (foreignLogins.length > 0) {
    patterns.push(`${foreignLogins.length} login attempt(s) from foreign IP addresses detected`);
  }

  const failedLogins = events.filter((e) => e.event_type === 'login' && e.status === 'failed');
  if (failedLogins.length >= 3) {
    patterns.push(`Multiple failed login attempts detected (${failedLogins.length} attempts)`);
  }

  const nighttimeEvents = events.filter((e) => {
    const hour = new Date(e.timestamp).getHours();
    return hour >= 0 && hour <= 5;
  });
  if (nighttimeEvents.length > 0) {
    patterns.push(`${nighttimeEvents.length} event(s) occurred during off-hours (12 AM - 5 AM)`);
  }

  const downloads = events.filter((e) => e.action === 'file_download');
  if (downloads.length > 0) {
    patterns.push(`${downloads.length} file download(s) detected`);
  }

  const userGroups = new Map<string, ForensicEvent[]>();
  for (const event of events) {
    if (event.user_id) {
      if (!userGroups.has(event.user_id)) {
        userGroups.set(event.user_id, []);
      }
      userGroups.get(event.user_id)!.push(event);
    }
  }

  for (const [userId, userEvents] of userGroups) {
    const loginSuccess = userEvents.find(
      (e) => e.event_type === 'login' && e.status === 'success'
    );
    const fileDownload = userEvents.find((e) => e.action === 'file_download');

    if (loginSuccess && fileDownload) {
      patterns.push(
        `Suspicious pattern: User ${userId} logged in from foreign location and downloaded files`
      );
    }
  }

  return patterns;
}

function generateOverallNarrative(events: TimelineEvent[], patterns: string[]): string {
  let narrative = `# Forensic Timeline Analysis\n\n`;
  narrative += `**Total Events**: ${events.length}\n`;
  narrative += `**Time Range**: ${new Date(events[0]?.timestamp || '').toLocaleString()} to ${new Date(events[events.length - 1]?.timestamp || '').toLocaleString()}\n\n`;

  if (patterns.length > 0) {
    narrative += `## Detected Patterns\n\n`;
    patterns.forEach((pattern, idx) => {
      narrative += `${idx + 1}. ${pattern}\n`;
    });
    narrative += `\n`;
  }

  narrative += `## Event Sequence\n\n`;
  events.forEach((event, idx) => {
    narrative += `**Event ${idx + 1}**: ${event.narrative}\n`;
    if (event.relatedEvents && event.relatedEvents.length > 0) {
      narrative += `   *Related to ${event.relatedEvents.length} other event(s)*\n`;
    }
    narrative += `\n`;
  });

  return narrative;
}
