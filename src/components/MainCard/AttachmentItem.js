import React from 'react';
import { SUPPORTED_FILE_TYPES, getAttachmentVisuals } from '../../utils/uiUtils';
import AiButton from './AiButton';

/**
 * Renders a single attachment item, including icon, details,
 * actions, and analysis results.
 */
function AttachmentItem({ attachment, onAnalyze, analysisResult, isExternallyLoading = false }) {

  const handleAnalysisComplete = () => {
    if (onAnalyze) onAnalyze();
  };

  const isSupported = SUPPORTED_FILE_TYPES.has(attachment.fileType);
  const visuals = getAttachmentVisuals(attachment.fileType);

  const fileTypeLabel = (attachment.fileType.split('/').pop() || 'file').toUpperCase();
  const meta = `${fileTypeLabel} • ${attachment.sizeMB} MB`;

  return (
     <div className="attachment-item">
       <div className="attachment-content">
          <div className="file-icon-wrapper"><div className={`file-icon-bg ${visuals.bgClass}`}><i className={visuals.iClass}></i></div></div>

          <div className="attachment-details">
            <div className="attachment-main-line">
              <div className="attachment-info">
                <p className="filename" title={attachment.filename}>{attachment.filename}</p>
                <p className="file-meta">{meta}</p>
              </div>
              <div className="attachment-actions">
                 <button className="link-button"> <i className="fas fa-eye"></i><span className="button-text">Visualizza</span> </button>
                 <button className="link-button"> <i className="fas fa-download"></i><span className="button-text">Scarica</span> </button>

                 {isSupported ? (
                    <AiButton
                      initialText="Sintetizza"
                      loadingText="Analizzo"
                      timeout={1500}
                      onComplete={handleAnalysisComplete}
                      isExternallyLoading={isExternallyLoading}
                    />
                 ) : (
                    <span className="unsupported-text"><i className="fas fa-times-circle"></i> Non supportato</span>
                 )}
              </div>
            </div>
            {analysisResult && (
              <div className="analysis-result ai-result-box">
                <h4><i className="fa-solid fa-wand-magic-sparkles"></i> <strong>Sintesi</strong></h4>
                <p>{analysisResult}</p>
              </div>
            )}
          </div>
        </div>
     </div>
  );
}

export default AttachmentItem;