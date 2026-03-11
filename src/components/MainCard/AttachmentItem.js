import React, { useState } from 'react';
import { SUPPORTED_FILE_TYPES, getAttachmentVisuals } from '../../utils/uiUtils';
import AiButton from './AiButton';
import { downloadAttachment } from '../../services/api';


function AttachmentItem({ attachment, onAnalyze, analysisResult, isExternallyLoading = false }) {

  const [isAnalyzing, setIsAnalyzing] = useState(false);


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
                <p className="filename" title={attachment.filename}>{attachment.filename}</p>
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

        {analysisResult && (
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

     </div>
  );
}

export default AttachmentItem;