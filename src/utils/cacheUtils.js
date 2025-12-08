const createRedisClient = require("../db/keyvalue/redisClient");

async function getCache(key) {
  const client = await createRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCache(key, value, ttl = 60) {
  const client = await createRedisClient();
  await client.set(key, JSON.stringify(value), { EX: ttl });
}

async function deleteCache(key) {
  const client = await createRedisClient();
  await client.del(key);
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
};
