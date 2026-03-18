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

/**
 * Heuristic to detect if HTML is a complex "web page" (like a marketing email)
 * versus simple text fragments wrapped in HTML tags.
 */
export function isComplexHtml(html) {
  if (!html) return false;

  // 1. Check for layout complexity - newsletters/templates use many tables
  const tableCount = (html.match(/<table/gi) || []).length;
  if (tableCount > 3) return true;

  // 2. Check for extensive styling - templates have long <style> blocks or @media queries
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatches) {
    const totalStyleLength = styleMatches.reduce((acc, m) => acc + m.length, 0);
    if (totalStyleLength > 600 || /@media/i.test(html)) return true;
  }

  // 3. Check for structural complexity - many images often mean a visual template
  const imgCount = (html.match(/<img/gi) || []).length;
  if (imgCount > 5) return true;

  // 4. Check for professional layout markers (MS Office specifics, MJML, etc.)
  if (/mso-|\[if mso\]|mj-column|mj-outlook/i.test(html)) return true;

  // 5. Check for fixed-width layout containers common in newsletter templates
  if (/width\s*[:=]\s*["']?(600|640|650|700|800)/i.test(html)) return true;

  // 6. Check for complex lists like marketing footers or multiple links
  const linkCount = (html.match(/<a/gi) || []).length;
  if (linkCount > 10) return true;

  return false;
}
