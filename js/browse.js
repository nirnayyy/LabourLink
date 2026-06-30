/* Browse page logic */
(async function () {
  const grid = document.getElementById("worker-grid");
  const countEl = document.getElementById("result-count");
  const fArea = document.getElementById("f-area");
  const fType = document.getElementById("f-type");
  let all = [];

  try {
    const { data, error } = await db.from("workers").select("*")
      .order("rating_avg", { ascending: false });
    if (error) throw error;
    all = data || [];
  } catch (e) {
    grid.innerHTML = `<p class="notice err">Could not load workers. Please try again.</p>`;
    return;
  }

  // Populate filters
  const areas = [...new Set(all.map(w => w.area).filter(Boolean))].sort();
  areas.forEach(a => fArea.insertAdjacentHTML("beforeend", `<option>${LL.esc(a)}</option>`));
  const types = [...new Set(all.flatMap(w => w.work_types || []))].sort();
  types.forEach(t => fType.insertAdjacentHTML("beforeend", `<option>${LL.esc(t)}</option>`));

  // Preselect from query (?type=)
  const qType = LL.qs("type"); if (qType) fType.value = qType;

  function render() {
    let list = all;
    if (fArea.value) list = list.filter(w => w.area === fArea.value);
    if (fType.value) list = list.filter(w => (w.work_types || []).includes(fType.value));
    countEl.textContent = `${list.length} worker${list.length === 1 ? "" : "s"} found`;
    grid.innerHTML = list.length ? list.map(card).join("")
      : `<p class="muted">No workers match these filters. Try widening your search.</p>`;
  }
  fArea.addEventListener("change", render);
  fType.addEventListener("change", render);
  render();

  function card(w) {
    return `<a class="card worker-card" href="worker.html?id=${w.id}" style="color:inherit">
      <div class="photo"><img src="${w.photo_url || 'assets/worker1.jpeg'}" alt="${LL.esc(w.name)}"></div>
      <div class="body">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
          <h3>${LL.esc(w.name)}</h3>
          <span class="badge-avail ${w.availability_status}">${w.availability_status}</span>
        </div>
        <div class="area">📍 ${LL.esc(w.area)}</div>
        <div class="rating-row"><span class="stars">${LL.stars(w.rating_avg)}</span>
          <span class="muted">${Number(w.rating_avg).toFixed(1)} · ${w.total_jobs} jobs · ${w.total_reviews} reviews</span></div>
        <div class="tags">${(w.work_types || []).map(t => `<span class="tag">${LL.esc(t)}</span>`).join("")}</div>
      </div>
    </a>`;
  }
})();
