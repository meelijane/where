// Generates feed.xml (RSS 2.0) from history.json.
// history.json is the source of truth: a list of location changes, newest first.
// Run after updating history.json:  node build-feed.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const SITE = "https://ismillyinmelbourne.com";

const LABELS = {
  melbourne: { title: "Milly is in Melbourne", detail: "Milly is currently in Melbourne, business as usual." },
  sydney:    { title: "Milly is in Sydney",    detail: "Milly is currently in Sydney." },
  elsewhere: { title: "Milly is somewhere else", detail: "Milly is currently somewhere else." },
};

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const rfc822 = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? new Date(0).toUTCString() : d.toUTCString();
};

const history = JSON.parse(readFileSync(join(root, "history.json"), "utf8"));
const events = Array.isArray(history.events) ? history.events : [];

const items = events
  .map((e) => {
    const label = LABELS[e.status] || LABELS.elsewhere;
    const desc = e.note ? `${label.detail} (${e.note})` : label.detail;
    return `    <item>
      <title>${esc(label.title)}</title>
      <link>${SITE}/</link>
      <guid isPermaLink="false">${esc(e.status + "@" + e.since)}</guid>
      <pubDate>${rfc822(e.since)}</pubDate>
      <description>${esc(desc)}</description>
    </item>`;
  })
  .join("\n");

const lastBuild = events.length ? rfc822(events[0].since) : new Date(0).toUTCString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Is Milly in Melbourne?</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Whether Milly is currently in Melbourne. A new entry appears whenever her location changes.</description>
    <language>en-au</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

writeFileSync(join(root, "feed.xml"), xml);
console.log(`feed.xml written with ${events.length} item(s)`);
