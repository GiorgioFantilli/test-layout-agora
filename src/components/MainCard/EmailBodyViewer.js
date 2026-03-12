import React, { useEffect, useRef } from 'react';

function EmailBodyViewer({ htmlContent, textContent }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !htmlContent) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          iframe.style.height = doc.documentElement.scrollHeight + 'px';
        }
      } catch (e) {
        console.error("Could not adjust iframe height", e);
      }
    };

    iframe.addEventListener('load', handleLoad);
    const timeout = setTimeout(handleLoad, 500);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      clearTimeout(timeout);
    };
  }, [htmlContent]);

  if (htmlContent) {
    return (
      <iframe
        className='scrollbar-styled'
        ref={iframeRef}
        title="Email Content"
        srcDoc={htmlContent}
        style={{
          width: '100%',
          border: 'none',
          overflow: 'hidden',
          minHeight: '45vh',
          backgroundColor: 'white',
          borderRadius: '10px'
        }}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
      />
    );
  }

  return (
    <div className="email-text-body" style={{ whiteSpace: 'pre-wrap', color: 'var(--c-text-base)' }}>
      {textContent || "Nessun contenuto"}
    </div>
  );
}

export default EmailBodyViewer;
