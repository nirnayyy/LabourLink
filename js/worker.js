/* Worker profile + leave review */
(async function () {
  const root = document.getElementById("profile");
  const id = LL.qs("id");
  if (!id) { root.innerHTML = `<p class="notice err">No worker selected.</p>`; return; }

  let w;
  try {
    const { data, error } = await db.from("workers").select("*").eq("id", id).single();
    if (error) throw error; w = data;
  } catch (e) { root.innerHTML = `<p class="notice err">Worker not found.</p>`; return; }

  const { data: reviews } = await db.from("reviews").select("*")
    .eq("worker_id", id).order("created_at", { ascending: false });

  root.innerHTML = `
    <a href="browse.html" class="muted" style="display:inline-block;margin-bottom:18px">← Back to all workers</a>
    <div class="split" style="align-items:start">
      <div class="feature-img"><img src="${w.photo_url || 'assets/worker1.jpeg'}" alt="${LL.esc(w.name)}"></div>
      <div>
        <span class="badge-avail ${w.availability_status}">${w.availability_status}</span>
        <h1 style="margin:.3em 0 .1em">${LL.esc(w.name)}</h1>
        <div class="area" style="font-size:1.05rem">📍 ${LL.esc(w.area)}${w.locality ? ", " + LL.esc(w.locality) : ""}</div>
        <div class="rating-row" style="font-size:1.1rem;margin:14px 0">
          <span class="stars" style="font-size:1.4rem">${LL.stars(w.rating_avg)}</span>
          <b>${Number(w.rating_avg).toFixed(1)}</b>
          <span class="muted">· ${w.total_reviews} reviews · ${w.total_jobs} jobs done</span>
        </div>
        <div class="tags" style="margin-bottom:18px">${(w.work_types||[]).map(t=>`<span class="tag">${LL.esc(t)}</span>`).join("")}</div>
        <div class="card" style="padding:16px 18px;margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px">
            <div><div class="muted" style="font-size:.82rem">Reliability score</div><b style="font-size:1.3rem;color:var(--green-dark)">${w.reliability_score}/100</b></div>
            <div><div class="muted" style="font-size:.82rem">Registered by</div><b>${LL.esc(w.registered_by || "LabourLink team")}</b></div>
          </div>
        </div>
        <a href="post-job.html?work_type=${encodeURIComponent((w.work_types||[])[0]||'')}&area=${encodeURIComponent(w.area)}" class="btn btn-primary btn-block">📋 Request a worker like this</a>
        <p class="hint center" style="margin-top:8px">We confirm the actual worker over a call based on availability.</p>
      </div>
    </div>

    <div style="max-width:760px;margin:50px auto 0">
      <h2>Reviews ${reviews && reviews.length ? `(${reviews.length})` : ""}</h2>
      <div id="review-list">
        ${(reviews && reviews.length) ? reviews.map(r => `
          <div class="review-card" style="margin-bottom:14px">
            <div class="top"><b>${LL.esc(r.hirer_name)}</b><span class="stars">${LL.stars(r.rating)}</span></div>
            <p style="margin:0">${LL.esc(r.comment || "")}</p>
            <div class="muted" style="font-size:.8rem;margin-top:6px">${LL.fmtDate(r.created_at)}</div>
          </div>`).join("") : `<p class="muted">No reviews yet — be the first after you hire.</p>`}
      </div>

      <div class="card" style="padding:24px;margin-top:24px">
        <h3>Hired this worker? Leave a review</h3>
        <p class="hint">Reviews are checked by our team before they appear publicly.</p>
        <div id="rv-msg"></div>
        <form id="rv-form">
          <div class="row-2">
            <div class="field"><label>Your name</label><input name="hirer_name" required></div>
            <div class="field"><label>Rating</label>
              <select name="rating" required>
                <option value="5">★★★★★ Excellent</option>
                <option value="4">★★★★ Good</option>
                <option value="3">★★★ Okay</option>
                <option value="2">★★ Poor</option>
                <option value="1">★ Bad</option>
              </select></div>
          </div>
          <div class="field"><label>Your experience</label><textarea name="comment" placeholder="How was the work?"></textarea></div>
          <button class="btn btn-green" type="submit">Submit review</button>
        </form>
      </div>
    </div>`;

  document.getElementById("rv-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = document.getElementById("rv-msg");
    const btn = f.querySelector("button"); btn.disabled = true; btn.textContent = "Submitting…";
    const { error } = await db.rpc("create_review", {
      p_worker_id: id,
      p_hirer_name: f.hirer_name.value.trim(),
      p_rating: parseInt(f.rating.value, 10),
      p_comment: f.comment.value.trim(),
    });
    if (error) { LL.notice(msg, "err", "Could not submit review. Please try again."); btn.disabled = false; btn.textContent = "Submit review"; }
    else { LL.notice(msg, "ok", "Thank you! Your review was submitted and will appear after a quick check."); f.reset(); btn.textContent = "Submitted ✓"; }
  });
})();
