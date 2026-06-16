// Is Milly in Melbourne?
// Reads status.json (written twice a day by a scheduled Claude agent) and
// renders the one true answer. The page itself is dumb on purpose.

const STATES = {
  melbourne: {
    answer: "YES",
    detail: "Milly is currently in Melbourne, business as usual.",
  },
  sydney: {
    answer: "NO",
    detail: "Milly is currently in Sydney.",
  },
  elsewhere: {
    answer: "NO",
    detail: "Milly is currently somewhere else.",
  },
};

function timeAgo(iso) {
  const then = new Date(iso);
  if (isNaN(then)) return "";
  const mins = Math.round((Date.now() - then.getTime()) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function render(state, updated) {
  const view = STATES[state];
  if (!view) return fail();

  document.body.dataset.status = state;
  document.getElementById("answer").textContent = view.answer;
  document.getElementById("detail").textContent = view.detail;
  document.title = `Is Milly in Melbourne? ${view.answer}`;

  const stamp = document.getElementById("stamp");
  const ago = updated ? timeAgo(updated) : "";
  stamp.textContent = ago ? `Last checked ${ago}` : "";
}

function fail() {
  document.body.dataset.status = "error";
  document.getElementById("answer").textContent = "¯\\_(ツ)_/¯";
  document.getElementById("detail").textContent = "Couldn't reach Milly's whereabouts right now.";
  document.getElementById("stamp").textContent = "";
}

async function load() {
  try {
    // cache-bust so GitHub Pages always serves the freshest status
    const res = await fetch(`./status.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    render(data.status, data.updated);
  } catch (err) {
    console.error("status load failed:", err);
    fail();
  }
}

load();
