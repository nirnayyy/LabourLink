/* LabourLink — shared client, nav/footer, helpers */
(function () {
  const cfg = window.LL_CONFIG;
  // Supabase JS client (from CDN global `supabase`)
  window.db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  // ---------- Helpers ----------
  window.LL = {
    esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },
    stars(n) {
      n = Math.round(Number(n) || 0);
      return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
    },
    qs(name) {
      return new URLSearchParams(location.search).get(name);
    },
    money(v) { return v == null ? "—" : "₹" + Number(v).toLocaleString("en-IN"); },
    fmtDate(d) {
      if (!d) return "—";
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    },
    notice(el, type, msg) {
      el.innerHTML = `<div class="notice ${type}">${msg}</div>`;
    },
  };

  // ---------- Header ----------
  const page = (document.body.dataset.page || "");
  const links = [
    ["index.html", "Home"],
    ["browse.html", "Find Workers"],
    ["reviews.html", "Reviews"],
    ["about.html", "About & Trust"],
  ];
  const navHtml = `
    <header class="site-header">
      <div class="container nav">
        <a class="brand" href="index.html">
          <img src="assets/logo.jpeg" alt="LabourLink logo">
          <span>Labour<b>Link</b></span>
        </a>
        <nav class="nav-links" id="navLinks">
          ${links.map(([h, t]) => `<a href="${h}" class="${page === h ? "active" : ""}">${t}</a>`).join("")}
          <a class="btn btn-primary btn-sm" href="post-job.html">Post a Job</a>
        </nav>
        <button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>
      </div>
    </header>`;

  const footerHtml = `
    <footer class="site-footer">
      <div class="container">
        <div class="cols">
          <div>
            <h4>LabourLink</h4>
            <p style="color:#cfc7b8;max-width:320px">Digitising the labour chowk — connecting hardworking daily-wage workers with people who need them, across Greater Noida.</p>
            <p style="color:#8d8d8d;font-size:.85rem;margin-top:10px">LabourLink Startup Initiative · Greater Noida</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="browse.html">Find Workers</a>
            <a href="post-job.html">Post a Job</a>
            <a href="reviews.html">Reviews</a>
            <a href="about.html">About & Trust</a>
          </div>
          <div>
            <h4>For the Team</h4>
            <a href="admin.html">Admin Dashboard</a>
            <p style="color:#8d8d8d;font-size:.85rem;margin-top:8px">Request window: post by <b style="color:#FFC93C">8 PM</b>, worker confirmed by <b style="color:#FFC93C">9 PM</b>.</p>
          </div>
        </div>
        <div class="footer-bottom">© 2026 LabourLink · Greater Noida · Built with ❤️ by Nirnay & team</div>
      </div>
    </footer>`;

  document.addEventListener("DOMContentLoaded", () => {
    const h = document.getElementById("header-mount");
    const f = document.getElementById("footer-mount");
    if (h) h.innerHTML = navHtml;
    if (f) f.innerHTML = footerHtml;
    const tog = document.getElementById("navToggle");
    if (tog) tog.addEventListener("click", () =>
      document.getElementById("navLinks").classList.toggle("open"));
  });
})();
