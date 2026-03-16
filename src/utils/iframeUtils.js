const BASE_STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
  body {
    font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
  }
</style>
`;

// Script iniettato nel srcDoc: misura l'altezza e la comunica via postMessage.
// Necessario perché sandbox senza allow-same-origin crea origine null → contentDocument bloccato.
const HEIGHT_SCRIPT = `
<script>
(function() {
  function sendHeight() {
    var h = Math.max(
      document.body ? document.body.scrollHeight : 0,
      document.body ? document.body.offsetHeight : 0,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    window.parent.postMessage({ type: 'pec_iframe_height', height: h }, '*');
  }

  sendHeight();
  document.addEventListener('DOMContentLoaded', sendHeight);
  window.addEventListener('load', sendHeight);

  if (window.ResizeObserver) {
    var ro = new ResizeObserver(sendHeight);
    ro.observe(document.documentElement);
  }
})();
</script>
`;

export function buildEmailSrcDoc(html) {
  if (!html) return html;
  let result = /<head>/i.test(html)
    ? html.replace(/<head>/i, '<head>' + BASE_STYLES)
    : BASE_STYLES + html;
  result = /<\/body>/i.test(result)
    ? result.replace(/<\/body>/i, HEIGHT_SCRIPT + '</body>')
    : HEIGHT_SCRIPT + result;
  return result;
}
