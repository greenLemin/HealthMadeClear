(function () {
  var c = document.cookie.split(";").reduce(function (a, s) {
    var p = s.trim().split("=");
    if (p[0]) a[p[0]] = decodeURIComponent(p[1] || "");
    return a;
  }, {});
  var pathLocale = window.location.pathname.split("/")[1];
  var locale =
    pathLocale === "es" || pathLocale === "en" ? pathLocale : c["hmc-locale"] === "es" ? "es" : "en";
  var theme = c["hmc-theme"];
  if (!theme) theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  if (theme !== "dark") theme = "light";
  var textSize = c["hmc-text-size"] || "standard";
  if (textSize !== "large" && textSize !== "largest") textSize = "standard";
  var simpleMode = c["hmc-simple-mode"] === "true";
  var el = document.documentElement;
  el.lang = locale;
  el.dataset.locale = locale;
  el.dataset.theme = theme;
  el.dataset.textSize = textSize;
  el.dataset.simpleMode = simpleMode ? "true" : "false";
  if (theme === "dark") el.classList.add("dark");
})();
