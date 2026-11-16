const { redis } = require("./_redis");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).json({ error: "auth" });
  try {
    if (req.method === "DELETE") {
      await redis(["HDEL", "rsvps", String(req.query.id || "")]);
      return res.json({ ok: true });
    }
    let a = await redis(["HGETALL", "rsvps"]);
    if (!Array.isArray(a)) a = Object.entries(a || {}).flat();
    const rows = [];
    for (let i = 0; i < a.length; i += 2) {
      try { const o = JSON.parse(a[i + 1]); o.id = a[i]; rows.push(o); } catch (e) {}
    }
    rows.sort((x, y) => (y.at || 0) - (x.at || 0));
    res.json({ rows });
  } catch (e) {
    res.status(500).json({ error: "server", detail: String(e.message || e).slice(0, 120) });
  }
};
