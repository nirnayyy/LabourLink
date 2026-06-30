/* Home page logic */
(async function () {
  // Stats
  try {
    const [{ count: wc }, { data: jobs }, { count: rc }] = await Promise.all([
      db.from("workers").select("*", { count: "exact", head: true }),
      db.from("workers").select("total_jobs"),
      db.from("reviews").select("*", { count: "exact", head: true }),
    ]);
    const totalJobs = (jobs || []).reduce((s, w) => s + (w.total_jobs || 0), 0);
    document.getElementById("stat-workers").textContent = (wc || 0) + "+";
    document.getElementById("stat-jobs").textContent = totalJobs + "+";
    document.getElementById("stat-reviews").textContent = (rc || 0) + "+";
  } catch (e) { console.warn(e); }

  // Featured workers (top rated, available)
  const fw = document.getElementById("featured-workers");
  try {
    const { data, error } = await db.from("workers")
      .select("*").order("rating_avg", { ascending: false })
      .order("total_jobs", { ascending: false }).limit(4);
    if (error) throw error;
    fw.innerHTML = (data || []).map(workerCard).join("") || `<p class="muted">No workers yet.</p>`;
  } catch (e) {
    fw.innerHTML = `<p class="notice err">Could not load workers.</p>`;
  }

  // Wage guidance
  try {
    const { data } = await db.from("wage_guidance").select("*").order("work_type");
    const tb = document.getElementById("wage-body");
    tb.innerHTML = (data || []).map(w =>
      `<tr><td><b>${LL.esc(w.work_type)}</b></td><td>${LL.money(w.min_wage)} – ${LL.money(w.max_wage)}</td></tr>`
    ).join("") || `<tr><td colspan="2" class="muted center">No data.</td></tr>`;
  } catch (e) {}

  function workerCard(w) {
    return `<a class="card worker-card" href="worker.html?id=${w.id}" style="color:inherit">
      <div class="photo"><img src="${w.photo_url || 'assets/worker1.jpeg'}" alt="${LL.esc(w.name)}"></div>
      <div class="body">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <h3>${LL.esc(w.name)}</h3>
          <span class="badge-avail ${w.availability_status}">${w.availability_status}</span>
        </div>
        <div class="area">📍 ${LL.esc(w.area)}</div>
        <div class="rating-row"><span class="stars">${LL.stars(w.rating_avg)}</span>
          <span class="muted">${Number(w.rating_avg).toFixed(1)} · ${w.total_jobs} jobs</span></div>
        <div class="tags">${(w.work_types || []).slice(0,3).map(t => `<span class="tag">${LL.esc(t)}</span>`).join("")}</div>
      </div>
    </a>`;
  }
})();
