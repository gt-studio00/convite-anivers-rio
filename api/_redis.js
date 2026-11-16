function pick(re) {
  const k = Object.keys(process.env).find((n) => re.test(n) && !/READ_ONLY/.test(n));
  return k ? process.env[k] : undefined;
}

async function redis(cmd) {
  const url = pick(/(KV_REST_API_URL|REDIS_REST_URL)$/);
  const token = pick(/(KV_REST_API_TOKEN|REDIS_REST_TOKEN)$/);
  if (!url || !token) throw new Error("variaveis do banco nao encontradas");
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

module.exports = { redis };
