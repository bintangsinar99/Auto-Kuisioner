export default async function handler(request, response) {
  const sourceUrl = request.query?.url;

  if (!sourceUrl || typeof sourceUrl !== "string") {
    return response.status(400).json({ error: "Parameter url wajib diisi." });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    return response.status(400).json({ error: "URL tidak valid." });
  }

  const isGoogleForm =
    parsedUrl.hostname === "docs.google.com" &&
    parsedUrl.pathname.startsWith("/forms/d/e/");

  if (!isGoogleForm) {
    return response.status(400).json({ error: "Hanya link Google Forms publik yang didukung." });
  }

  try {
    const upstream = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!upstream.ok) {
      return response.status(upstream.status).json({ error: "Gagal membaca Google Form." });
    }

    const html = await upstream.text();
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    return response.status(200).send(html);
  } catch {
    return response.status(502).json({ error: "Gagal menghubungi Google Forms." });
  }
}
