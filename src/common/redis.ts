export const enum RedisKey {
  VIEWED_PROFILE_IDS = "viewed_profile_ids",
  SWIPE_COUNT = "swipe_count"
}

export function calculateRedisTtl() {
  const redisExpirationTime = process.env.REDIS_EXPIRATION_TIME || "24:00:00"
  const exp = redisExpirationTime.split(":")

  const now = new Date()
  const expirationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(exp[0]), parseInt(exp[1]), parseInt(exp[2]))
  if (expirationTime.getTime() < now.getTime()) {
    expirationTime.setDate(expirationTime.getDate() + 1)
  }
  const ttl = expirationTime.getTime() - now.getTime()
  return ttl
}
