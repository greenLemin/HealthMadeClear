(function () {
  var s = document.currentScript;
  if (!s || !s.src) return;
  var id = new URL(s.src).searchParams.get("id");
  if (!id || !/^G-[A-Za-z0-9_-]+$/.test(id)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());

  gtag("config", id, {
    page_path: window.location.pathname,
    page_location: window.location.origin + window.location.pathname,
  });
})();
