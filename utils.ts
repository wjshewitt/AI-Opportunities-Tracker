export function formatDeliveryTimeline(timeline: string): string {
  if (!timeline) return 'TBD';
  return timeline;
}

export function isLongTermGoal(timeline: string): boolean {
  if (!timeline) return false;
  // Check if timeline contains years 2028 or later
  const longTermYears = ['2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
  return longTermYears.some(year => timeline.includes(year));
}
