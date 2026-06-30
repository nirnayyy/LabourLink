/* Reviews page — published reviews joined with worker */
(async function () {
  const grid = document.getElementById("reviews-grid");
  try {
    const { data, error } = await db.from("reviews")
      .select("*, workers(name, area, photo_url)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || !data.length) { grid.innerHTML = `<p class="muted">No reviews yet.</p>`; return; }
    grid.innerHTML = data.map(r => {
      const w = r.workers || {};
      return `<div class="review-card">
        <div class="top">
          <div style="display:flex;align-items:center;gap:12px">
            <img src="${w.photo_url || 'assets/worker1.jpeg'}" alt="${LL.esc(w.name||'')}" style="width:48px;height:48px;border-radius:50%;object-fit:cover">
            <div>
              <a href="worker.html?id=${r.worker_id}" style="font-weight:700;color:var(--ink)">${LL.esc(w.name || "Worker")}</a>
              <div class="muted" style="font-size:.82rem">📍 ${LL.esc(w.area || "")}</div>
            </div>
          </div>
          <span class="stars" style="font-size:1.1rem">${LL.stars(r.rating)}</span>
        </div>
        <p style="margin:10px 0 6px">“${LL.esc(r.comment || "")}”</p>
        <div class="muted" style="font-size:.82rem">— ${LL.esc(r.hirer_name)} · ${LL.fmtDate(r.created_at)}</div>
      </div>`;
    }).join("");
  } catch (e) {
    grid.innerHTML = `<p class="notice err">Could not load reviews.</p>`;
  }
})();
