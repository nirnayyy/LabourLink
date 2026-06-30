/* LabourLink Admin Dashboard */
(function () {
  const $ = (id) => document.getElementById(id);
  const show = (el, on = true) => el.classList.toggle("hidden", !on);
  let workersCache = [];

  // ---------- Auth bootstrap ----------
  document.addEventListener("DOMContentLoaded", init);
  async function init() {
    const { data } = await db.auth.getSession();
    show($("boot"), false);
    if (data.session) enterDash(data.session); else show($("login-view"), true);

    $("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, msg = $("login-msg");
      const btn = f.querySelector("button"); btn.disabled = true; btn.textContent = "Logging in…";
      const { data, error } = await db.auth.signInWithPassword({
        email: f.email.value.trim(), password: f.password.value });
      if (error || !data.session) { LL.notice(msg, "err", "Login failed. Check your email and password.");
        btn.disabled = false; btn.textContent = "Log in"; return; }
      show($("login-view"), false); enterDash(data.session);
    });
    $("logout").addEventListener("click", async () => { await db.auth.signOut(); location.reload(); });
    document.querySelectorAll(".admin-tabs button").forEach(b =>
      b.addEventListener("click", () => switchTab(b.dataset.tab, b)));
  }

  function enterDash(session) {
    show($("dash-view"), true);
    $("who").textContent = session.user.email;
    loadAll();
  }

  function switchTab(tab, btn) {
    document.querySelectorAll(".admin-tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-panel").forEach(p => show(p, false));
    show($("tab-" + tab), true);
  }

  // ---------- Load everything ----------
  async function loadAll() {
    await Promise.all([loadRequests(), loadWorkers(), loadBookings(), loadReviews()]);
  }

  function chip(s) { return `<span class="status-chip ${s}">${s.replace("_", " ")}</span>`; }

  // ---------- Requests ----------
  async function loadRequests() {
    const { data: reqs, error } = await db.from("job_requests").select("*").order("created_at", { ascending: false });
    if (error) return ($("tab-requests").innerHTML = `<p class="notice err">Error loading requests.</p>`);
    $("kpi-pending").textContent = reqs.filter(r => r.status === "pending").length;
    const rows = reqs.map(r => `
      <tr>
        <td><b>${LL.esc(r.ref_code)}</b><br><span class="muted" style="font-size:.8rem">${LL.fmtDate(r.created_at)}</span></td>
        <td>${LL.esc(r.hirer_name)}<br><span class="muted">${LL.esc(r.hirer_phone)}</span></td>
        <td>${LL.esc(r.work_type)}<br><span class="muted">${LL.esc(r.area)} · ${r.num_workers}👤 · ${LL.money(r.wage_offered)}</span><br><span class="muted" style="font-size:.8rem">📅 ${LL.fmtDate(r.job_date)}</span></td>
        <td>${chip(r.status)}</td>
        <td>
          ${r.status === "pending" ? `<button class="btn btn-green btn-sm" data-assign="${r.id}">Confirm worker</button>` : ""}
          ${r.status === "confirmed" ? `<button class="btn btn-green btn-sm" data-done="${r.id}">Mark completed</button>` : ""}
          ${r.status !== "completed" && r.status !== "cancelled" ? `<button class="btn btn-ghost btn-sm" data-cancel="${r.id}">Cancel</button>` : ""}
        </td>
      </tr>
      <tr id="assign-${r.id}" class="hidden"><td colspan="5" style="background:#fffdf8"></td></tr>`).join("");
    $("tab-requests").innerHTML = `<div class="table-wrapper"><table class="data">
      <thead><tr><th>Ref</th><th>Hirer</th><th>Job</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="5" class="muted">No requests yet.</td></tr>`}</tbody></table></div>`;

    $("tab-requests").querySelectorAll("[data-assign]").forEach(b =>
      b.addEventListener("click", () => openAssign(b.dataset.assign)));
    $("tab-requests").querySelectorAll("[data-done]").forEach(b =>
      b.addEventListener("click", () => setRequestStatus(b.dataset.done, "completed")));
    $("tab-requests").querySelectorAll("[data-cancel]").forEach(b =>
      b.addEventListener("click", () => setRequestStatus(b.dataset.cancel, "cancelled")));
  }

  function openAssign(reqId) {
    const row = $("assign-" + reqId);
    const willShow = row.classList.contains("hidden");
    show(row, willShow);
    if (!willShow) return;
    const avail = workersCache.filter(w => !w.is_blacklisted);
    row.querySelector("td").innerHTML = `
      <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">
        <div class="field" style="margin:0;min-width:240px"><label>Assign worker</label>
          <select id="sel-${reqId}">${avail.map(w => `<option value="${w.id}">${LL.esc(w.name)} — ${LL.esc(w.area)} (${w.availability_status})</option>`).join("")}</select></div>
        <button class="btn btn-green btn-sm" data-confirm="${reqId}">Confirm & create booking</button>
      </div>`;
    row.querySelector("[data-confirm]").addEventListener("click", () => confirmWorker(reqId));
  }

  async function confirmWorker(reqId) {
    const wid = $("sel-" + reqId).value;
    const { error: be } = await db.from("bookings").insert({ job_request_id: reqId, worker_id: wid, status: "confirmed", confirmed_at: new Date().toISOString() });
    if (be) return LL.notice($("tab-msg"), "err", "Could not create booking: " + be.message);
    await db.from("job_requests").update({ status: "confirmed" }).eq("id", reqId);
    LL.notice($("tab-msg"), "ok", "Worker confirmed and booking created. Remember to WhatsApp the hirer the worker's details.");
    loadRequests(); loadBookings();
  }

  async function setRequestStatus(id, status) {
    const { error } = await db.from("job_requests").update({ status }).eq("id", id);
    if (error) return LL.notice($("tab-msg"), "err", error.message);
    if (status === "completed") await db.from("bookings").update({ status: "completed", completed_at: new Date().toISOString() }).eq("job_request_id", id);
    loadRequests(); loadBookings();
  }

  // ---------- Workers ----------
  async function loadWorkers() {
    const { data, error } = await db.from("workers").select("*").order("created_at", { ascending: false });
    if (error) return;
    workersCache = data;
    $("kpi-workers").textContent = data.length;
    const rows = data.map(w => `
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px"><img src="${w.photo_url || 'assets/worker1.jpeg'}" style="width:40px;height:40px;border-radius:50%;object-fit:cover"><div><b>${LL.esc(w.name)}</b><br><span class="muted" style="font-size:.8rem">${LL.esc(w.phone)}</span></div></div></td>
        <td>${LL.esc(w.area)}</td>
        <td>${(w.work_types || []).map(t => `<span class="tag">${LL.esc(t)}</span>`).join(" ")}</td>
        <td>★ ${Number(w.rating_avg).toFixed(1)} · ${w.total_jobs} jobs</td>
        <td>
          <select data-avail="${w.id}">
            ${["available","working","unavailable"].map(s => `<option ${w.availability_status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td><button class="btn btn-sm ${w.is_blacklisted ? 'btn-green' : 'btn-ghost'}" data-black="${w.id}" data-state="${w.is_blacklisted}">${w.is_blacklisted ? "Un-blacklist" : "Blacklist"}</button></td>
      </tr>`).join("");
    $("tab-workers").innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
        <p class="muted" style="margin:0">${data.length} registered workers</p>
        <button class="btn btn-primary btn-sm" id="add-worker-btn">+ Register new worker</button>
      </div>
      <div id="add-worker-form" class="card hidden" style="padding:20px;margin-bottom:18px">
        <h3>Register a worker (at the chowk)</h3>
        <div class="row-2">
          <div class="field"><label>Name *</label><input id="nw-name"></div>
          <div class="field"><label>Phone *</label><input id="nw-phone"></div>
        </div>
        <div class="row-2">
          <div class="field"><label>Area *</label><select id="nw-area"><option>Knowledge Park</option><option>Kasna</option><option>Greater Noida West</option><option>Sector 62</option></select></div>
          <div class="field"><label>Photo URL</label><input id="nw-photo" placeholder="assets/worker1.jpeg or https://..."><div class="hint">Use a hosted photo URL (or a Supabase Storage link).</div></div>
        </div>
        <div class="field"><label>Work types (comma separated) *</label><input id="nw-types" placeholder="General Helper, Loader / Unloader"></div>
        <button class="btn btn-green" id="nw-save">Save worker</button>
      </div>
      <div class="table-wrapper"><table class="data">
        <thead><tr><th>Worker</th><th>Area</th><th>Work types</th><th>Rating</th><th>Availability</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="muted">No workers yet.</td></tr>`}</tbody></table></div>`;

    $("add-worker-btn").addEventListener("click", () => show($("add-worker-form")));
    $("nw-save").addEventListener("click", addWorker);
    $("tab-workers").querySelectorAll("[data-avail]").forEach(s =>
      s.addEventListener("change", async () => {
        await db.from("workers").update({ availability_status: s.value }).eq("id", s.dataset.avail);
        LL.notice($("tab-msg"), "ok", "Availability updated.");
      }));
    $("tab-workers").querySelectorAll("[data-black]").forEach(b =>
      b.addEventListener("click", async () => {
        const next = b.dataset.state !== "true";
        await db.from("workers").update({ is_blacklisted: next, is_published: !next }).eq("id", b.dataset.black);
        loadWorkers();
      }));
  }

  async function addWorker() {
    const types = $("nw-types").value.split(",").map(s => s.trim()).filter(Boolean);
    const payload = {
      name: $("nw-name").value.trim(), phone: $("nw-phone").value.trim(),
      area: $("nw-area").value, photo_url: $("nw-photo").value.trim() || null,
      work_types: types, registered_by: ($("who").textContent || "team"),
    };
    if (!payload.name || !payload.phone || !types.length) return LL.notice($("tab-msg"), "err", "Name, phone and work types are required.");
    const { error } = await db.from("workers").insert(payload);
    if (error) return LL.notice($("tab-msg"), "err", error.message);
    LL.notice($("tab-msg"), "ok", "Worker registered.");
    loadWorkers();
  }

  // ---------- Bookings ----------
  async function loadBookings() {
    const { data, error } = await db.from("bookings")
      .select("*, job_requests(ref_code,hirer_name,work_type,job_date), workers(name,phone)")
      .order("created_at", { ascending: false });
    if (error) return;
    $("kpi-bookings").textContent = data.length;
    const rows = data.map(b => {
      const jr = b.job_requests || {}, w = b.workers || {};
      return `<tr>
        <td><b>${LL.esc(jr.ref_code || "")}</b><br><span class="muted">${LL.esc(jr.work_type || "")} · ${LL.fmtDate(jr.job_date)}</span></td>
        <td>${LL.esc(w.name || "")}<br><span class="muted">${LL.esc(w.phone || "")}</span></td>
        <td>${LL.esc(jr.hirer_name || "")}</td>
        <td>${chip(b.status)}</td>
        <td><select data-bk="${b.id}">${["proposed","confirmed","completed","no_show","cancelled"].map(s => `<option ${b.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></td>
      </tr>`; }).join("");
    $("tab-bookings").innerHTML = `<div class="table-wrapper"><table class="data">
      <thead><tr><th>Request</th><th>Worker</th><th>Hirer</th><th>Status</th><th>Update</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="5" class="muted">No bookings yet.</td></tr>`}</tbody></table></div>`;
    $("tab-bookings").querySelectorAll("[data-bk]").forEach(s =>
      s.addEventListener("change", async () => {
        const patch = { status: s.value };
        if (s.value === "completed") patch.completed_at = new Date().toISOString();
        await db.from("bookings").update(patch).eq("id", s.dataset.bk);
        LL.notice($("tab-msg"), "ok", "Booking updated.");
      }));
  }

  // ---------- Reviews ----------
  async function loadReviews() {
    const { data, error } = await db.from("reviews")
      .select("*, workers(name)").order("created_at", { ascending: false });
    if (error) return;
    $("kpi-revpending").textContent = data.filter(r => r.status === "pending").length;
    const rows = data.map(r => `
      <tr>
        <td>${LL.esc((r.workers || {}).name || "")}</td>
        <td>${LL.esc(r.hirer_name)}</td>
        <td><span class="stars">${LL.stars(r.rating)}</span></td>
        <td>${LL.esc(r.comment || "")}</td>
        <td>${chip(r.status)}</td>
        <td>
          ${r.status !== "published" ? `<button class="btn btn-green btn-sm" data-pub="${r.id}">Publish</button>` : ""}
          ${r.status !== "rejected" ? `<button class="btn btn-ghost btn-sm" data-rej="${r.id}">Reject</button>` : ""}
        </td>
      </tr>`).join("");
    $("tab-reviews").innerHTML = `<div class="table-wrapper"><table class="data">
      <thead><tr><th>Worker</th><th>Hirer</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="6" class="muted">No reviews yet.</td></tr>`}</tbody></table></div>`;
    $("tab-reviews").querySelectorAll("[data-pub]").forEach(b =>
      b.addEventListener("click", () => setReview(b.dataset.pub, "published")));
    $("tab-reviews").querySelectorAll("[data-rej]").forEach(b =>
      b.addEventListener("click", () => setReview(b.dataset.rej, "rejected")));
  }
  async function setReview(id, status) {
    const { error } = await db.from("reviews").update({ status }).eq("id", id);
    if (error) return LL.notice($("tab-msg"), "err", error.message);
    LL.notice($("tab-msg"), "ok", "Review " + status + ".");
    loadReviews();
  }
})();
