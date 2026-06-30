/* Post a Job logic */
(async function () {
  const typeSel = document.getElementById("type-sel");
  const areaSel = document.getElementById("area-sel");
  // load work types from wage_guidance
  try {
    const { data } = await db.from("wage_guidance").select("work_type").order("work_type");
    [...new Set((data || []).map(d => d.work_type))].forEach(t =>
      typeSel.insertAdjacentHTML("beforeend", `<option>${LL.esc(t)}</option>`));
  } catch (e) {
    ["General Helper","Digger (Beldar)","Loader / Unloader","Cleaning Help","Shifting / Moving"]
      .forEach(t => typeSel.insertAdjacentHTML("beforeend", `<option>${t}</option>`));
  }
  // prefill from query
  const qt = LL.qs("work_type"); if (qt) typeSel.value = qt;
  const qa = LL.qs("area"); if (qa) areaSel.value = qa;
  // min date = today
  document.querySelector('[name=job_date]').min = new Date().toISOString().split("T")[0];

  document.getElementById("job-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = document.getElementById("form-msg");
    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Submitting…";
    msg.innerHTML = "";
    const payload = {
      p_name: f.hirer_name.value.trim(),
      p_phone: f.hirer_phone.value.trim(),
      p_area: f.area.value,
      p_location: f.location.value.trim(),
      p_work_type: f.work_type.value,
      p_num_workers: parseInt(f.num_workers.value, 10) || 1,
      p_job_date: f.job_date.value,
      p_wage: f.wage_offered.value ? parseFloat(f.wage_offered.value) : null,
      p_notes: f.notes.value.trim(),
    };
    const { data, error } = await db.rpc("create_job_request", payload);
    if (error) {
      LL.notice(msg, "err", "Sorry, something went wrong submitting your request. Please try again.");
      btn.disabled = false; btn.textContent = "Submit Request";
      return;
    }
    sessionStorage.setItem("ll_ref", data || "");
    sessionStorage.setItem("ll_name", payload.p_name);
    location.href = "confirmation.html";
  });
})();
