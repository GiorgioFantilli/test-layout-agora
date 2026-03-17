import { useRef, useEffect } from 'react';
import { buildEmailSrcDoc } from '../../utils/iframeUtils';

function EmailBodyViewer({ htmlContent, textContent }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.data?.type === 'pec_iframe_height' &&
        iframeRef.current &&
        event.source === iframeRef.current.contentWindow
      ) {
        iframeRef.current.style.height = event.data.height + 'px';
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (htmlContent) {
    return (
      <iframe
        ref={iframeRef}
        title="Email Content"
        srcDoc={buildEmailSrcDoc(htmlContent)}
        style={{
          width: '100%',
          border: 'none',
          overflow: 'hidden',
          display: 'block',
        }}
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts"
      />
    );
  }

  return (
    <div
      className='email-body-content'
    >
      {textContent || "Nessun contenuto"}
    </div>
  );
}

export default EmailBodyViewer;
