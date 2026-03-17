const BASE_STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
  body {
    font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    word-break: break-word;
    width: 100%;
  }
  img {
    max-width: 100% !important;
    height: auto !important;
  }
  table {
    max-width: 100% !important;
    table-layout: fixed !important;
    width: 100% !important;
  }
</style>
`;


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
