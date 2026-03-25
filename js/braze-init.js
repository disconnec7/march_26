/**
 * Braze Web SDK initialization (after braze.min.js from CDN).
 * Aligned with Braze docs: initialize → changeUser (external_id) → openSession.
 */
(function () {
  var c = window.__BRAZE_CONFIG__;
  if (!c || !c.apiKey || !c.baseUrl) {
    return;
  }
  if (typeof window.braze === "undefined") {
    return;
  }
  window.braze.initialize(c.apiKey, {
    baseUrl: c.baseUrl,
    enableLogging: !!c.enableLogging,
    allowUserSuppliedJavascript: false,
  });
  window.braze.changeUser("sasheto");
  window.braze.openSession();
})();
