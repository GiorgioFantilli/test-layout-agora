import React, { useState, useMemo } from 'react';
import { SUPPORTED_FILE_TYPES, getAttachmentVisuals } from '../../utils/uiUtils';
import AiButton from './AiButton';
import { downloadAttachment } from '../../services/api';
import { useAttachmentProcessing, useRetryJob } from '../../hooks/useEmails';


// Human-readable labels for known pipeline error codes
const ERROR_CODE_LABELS = {
  PDF_ENCRYPTED: 'PDF protetto da password',
  ZIP_BOMB: 'Archivio ZIP anomalo',
  UNSUPPORTED_FORMAT: 'Formato non supportato',
  FILE_TOO_LARGE: 'File troppo grande',
  EXTRACTION_FAILED: 'Estrazione testo fallita',
  OCR_FAILED: 'OCR fallito',
  PARSE_ERROR: 'Errore di parsing',
};

function AttachmentItem({ attachment, documentUnit, documentAnalysis, onAnalyze, analysisResult, isExternallyLoading = false }) {

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExcerptExpanded, setIsExcerptExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const visibleEntities = useMemo(() => {
    if (!documentAnalysis?.keyEntities?.length) return { shown: [], extra: 0 };
    const shown = documentAnalysis.keyEntities.slice(0, 3);
    const extra = documentAnalysis.keyEntities.length - shown.length;
    return { shown, extra };
  }, [documentAnalysis?.keyEntities]);

  const { data: processingData } = useAttachmentProcessing(attachment?.id);
  const { mutate: retryJob, isPending: isRetrying } = useRetryJob();

  const jobStatus = processingData?.job?.status;
  const jobId = processingData?.job?.id;
  const errorCode = processingData?.job?.error_code;


  const handleAnalyzeClick = async () => {
    setIsAnalyzing(true);
    
    if (onAnalyze) {
      await onAnalyze();
    }
    
    setIsAnalyzing(false);
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadAttachment(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handlePreview = async () => {
    try {
      const blob = await downloadAttachment(attachment.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Note: we don't revoke here because the new window needs the URL
    } catch (error) {
      console.error("Preview failed", error);
    }
  };


  const isSupported = SUPPORTED_FILE_TYPES.has(attachment.fileType);
  const visuals = getAttachmentVisuals(attachment.fileType);

  const fileTypeLabel = (attachment.fileType.split('/').pop() || 'file').toUpperCase();

  return (
     <div className="attachment-item">
        
        <div className="attachment-header">
            
            <div className="file-icon-wrapper">
                <div className={`file-icon-bg ${visuals.bgClass}`}>
                    <i className={visuals.iClass}></i>
                </div>
            </div>

            <div className="attachment-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <p className="filename" title={attachment.filename} style={{ margin: 0 }}>{attachment.filename}</p>
                  {documentUnit?.isPrimaryCandidate && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      padding: '0.1rem 0.45rem', borderRadius: '999px',
                      backgroundColor: '#eff6ff', color: '#1d4ed8',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      <i className="fas fa-star" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>
                      Documento principale
                    </span>
                  )}
                  {documentUnit?.isProtocollable && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      padding: '0.1rem 0.45rem', borderRadius: '999px',
                      backgroundColor: '#f0fdf4', color: '#166534',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      <i className="fas fa-stamp" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>
                      Protocollabile
                    </span>
                  )}
                  {documentUnit?.extractionQuality && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600,
                      padding: '0.1rem 0.45rem', borderRadius: '999px',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      ...(documentUnit.extractionQuality === 'OK'
                        ? { backgroundColor: '#dcfce7', color: '#15803d' }
                        : documentUnit.extractionQuality === 'LOW'
                        ? { backgroundColor: '#fef3c7', color: '#b45309' }
                        : { backgroundColor: 'var(--c-bg-offset-2)', color: 'var(--c-text-muted)' }
                      ),
                    }}>
                      <i className="fas fa-file-lines" style={{ fontSize: '0.55rem', marginRight: '0.25rem' }}></i>
                      {documentUnit.extractionQuality === 'OK' ? 'Testo OK' : documentUnit.extractionQuality === 'LOW' ? 'Testo parziale' : 'Testo vuoto'}
                    </span>
                  )}
                </div>
                <p className="file-meta">{fileTypeLabel} • {attachment.sizeMB}<span className='text-[6px]'> </span>MB</p>
            </div>

            <div className="attachment-actions">
                <button className="link-button mr-[-0.5rem]" onClick={handlePreview}> 
                    <i className="fas fa-eye"></i>Visualizza
                </button>
                <button className="link-button" onClick={handleDownload}> 
                    <i className="fas fa-download"></i>Scarica
                </button>

                {isSupported ? (
                    <AiButton
                        initialText="Sintetizza"
                        loadingText="Analizzo"
                        onClick={handleAnalyzeClick}
                        isLoading={isAnalyzing || isExternallyLoading}
                    />
                ) : (
                    <span className="unsupported-text">
                        <i className="fas fa-times-circle"></i>Non supportato
                    </span>
                )}
            </div>
        </div>

        {/* Processing status badge (QUEUED/IN_PROGRESS/MANUAL_REVIEW/FAILED_FINAL) */}
        {jobStatus && jobStatus !== 'SUCCEEDED' && (
          <div style={{ padding: '0.4rem 0.75rem 0.5rem', borderTop: '1px solid var(--c-border-base)' }}>
            {(jobStatus === 'QUEUED' || jobStatus === 'IN_PROGRESS') && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#1d4ed8' }}>
                <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '0.65rem' }}></i>
                In elaborazione…
              </span>
            )}
            {(jobStatus === 'MANUAL_REVIEW' || jobStatus === 'FAILED_FINAL') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: '0.15rem 0.5rem', borderRadius: '999px',
                  ...(jobStatus === 'MANUAL_REVIEW'
                    ? { backgroundColor: '#fef3c7', color: '#b45309' }
                    : { backgroundColor: '#fee2e2', color: '#b91c1c' }),
                }}>
                  <i className={`fas ${jobStatus === 'MANUAL_REVIEW' ? 'fa-exclamation-triangle' : 'fa-times-circle'}`} style={{ fontSize: '0.6rem' }}></i>
                  {jobStatus === 'MANUAL_REVIEW' ? 'Richiede revisione' : 'Errore estrazione'}
                </span>
                {errorCode && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', fontFamily: 'monospace' }}>
                    {ERROR_CODE_LABELS[errorCode] || errorCode}
                  </span>
                )}
                <button
                  onClick={() => retryJob({ jobId, attachmentId: attachment.id })}
                  disabled={isRetrying}
                  style={{
                    fontSize: '0.72rem', fontWeight: 600,
                    padding: '0.15rem 0.6rem', borderRadius: '6px',
                    border: '1px solid var(--c-border-base)',
                    background: 'var(--c-bg-base)', color: 'var(--c-text-base)',
                    cursor: isRetrying ? 'not-allowed' : 'pointer',
                    opacity: isRetrying ? 0.6 : 1,
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  <i className={`fas ${isRetrying ? 'fa-circle-notch fa-spin' : 'fa-rotate-right'}`} style={{ fontSize: '0.6rem' }}></i>
                  Riprova
                </button>
              </div>
            )}
          </div>
        )}

        {/* Structured AI summary from SCB (documentAnalysis) */}
        {documentAnalysis?.generationStatus === 'completed' && (
          <div className="attachment-synthesis-section">
            <div className="synthesis-label">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>Sintesi AI</span>
            </div>
            {documentAnalysis.summary ? (
              <>
                {documentAnalysis.summary.length > 120 ? (
                  <>
                    <p className="synthesis-text" style={{ marginBottom: '0.25rem' }}>
                      {isSummaryExpanded ? documentAnalysis.summary : `${documentAnalysis.summary.slice(0, 120)}…`}
                    </p>
                    <button
                      onClick={() => setIsSummaryExpanded((v) => !v)}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--c-primary)', marginBottom: '0.4rem',
                      }}
                    >
                      {isSummaryExpanded ? 'Mostra meno' : 'Leggi tutto'}
                    </button>
                  </>
                ) : (
                  <p className="synthesis-text">{documentAnalysis.summary}</p>
                )}
                {(documentAnalysis.documentType || visibleEntities.shown.length > 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                    {documentAnalysis.documentType && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-text-subtle)' }}>Tipo:</span> {documentAnalysis.documentType}
                      </span>
                    )}
                    {documentAnalysis.documentType && visibleEntities.shown.length > 0 && (
                      <span style={{ color: 'var(--c-border-base)', fontSize: '0.7rem' }}>|</span>
                    )}
                    {visibleEntities.shown.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {visibleEntities.shown.map((entity, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.65rem', fontWeight: 600,
                              padding: '0.1rem 0.4rem', borderRadius: '999px',
                              backgroundColor: 'var(--c-bg-offset-2)', color: 'var(--c-text-subtle)',
                            }}
                          >
                            {entity}
                          </span>
                        ))}
                        {visibleEntities.extra > 0 && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>
                            +{visibleEntities.extra}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="synthesis-text" style={{ color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
                Nessuna sintesi disponibile
              </p>
            )}
          </div>
        )}

        {/* Legacy plain-text analysis result (from AI button) — shown only if no structured analysis */}
        {!documentAnalysis && analysisResult && (
            <div className="attachment-synthesis-section">
                <div className="synthesis-label">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Sintesi AI</span>
                </div>
                <p className="synthesis-text">
                    {analysisResult}
                </p>
            </div>
        )}

        {documentUnit?.textExcerpt && (
            <div className="attachment-synthesis-section">
                <button
                    onClick={() => setIsExcerptExpanded((v) => !v)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: 'var(--c-text-muted)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                    }}
                >
                    <i className="fas fa-align-left" style={{ fontSize: '0.65rem' }}></i>
                    Testo estratto
                    <i className={`fas fa-chevron-${isExcerptExpanded ? 'up' : 'down'}`} style={{ fontSize: '0.6rem', marginLeft: '0.1rem' }}></i>
                </button>
                {isExcerptExpanded && (
                    <p style={{
                        margin: '0.4rem 0 0',
                        fontSize: '0.78rem',
                        color: 'var(--c-text-subtle)',
                        lineHeight: '1.55',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}>
                        {documentUnit.textExcerpt}
                    </p>
                )}
            </div>
        )}

     </div>
  );
}

export default AttachmentItem;