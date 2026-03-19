const rateLimitMap = new Map<string, number[]>();

export function isRateLimited(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];
  
  const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  if (recentTimestamps.length >= limit) {
    rateLimitMap.set(identifier, recentTimestamps);
    return true;
  }
  
  recentTimestamps.push(now);
  rateLimitMap.set(identifier, recentTimestamps);
  return false;
}
