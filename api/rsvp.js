const { redis } = require("./_redis");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const id = String(req.query.id || "");
      if (!/^[\w-]{8,64}$/.test(id)) return res.status(400).json({});
      const v = await redis(["HGET", "rsvps", id]);
      return res.json({ rsvp: v ? JSON.parse(v) : null });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const id = String(b.id || "");
      if (!/^[\w-]{8,64}$/.test(id)) return res.status(400).json({ error: "id" });
      const name = String(b.name || "").trim().slice(0, 80);
      if (!name) return res.status(400).json({ error: "name" });
      const going = !!b.going;
      const people = going ? Math.max(1, Math.min(12, parseInt(b.people) || 1)) : 0;
      const companions = going && Array.isArray(b.companions)
        ? b.companions.slice(0, 11).map((x) => String(x).trim().slice(0, 80)).filter(Boolean)
        : [];
      await redis(["HSET", "rsvps", id, JSON.stringify({ name, going, people, companions, at: Date.now() })]);
      return res.json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: "server" });
  }
};
