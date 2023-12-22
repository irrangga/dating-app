export const enum RedisKey {
  VIEWED_PROFILE_IDS = "viewed_profile_ids",
  SWIPE_COUNT = "swipe_count"
}

export function calculateRedisTtl() {
  const now = new Date()
  const expirationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0)
  if (expirationTime.getTime() < now.getTime()) {
    expirationTime.setDate(expirationTime.getDate() + 1)
  }
  const ttl = expirationTime.getTime() - now.getTime()
  return ttl
}
