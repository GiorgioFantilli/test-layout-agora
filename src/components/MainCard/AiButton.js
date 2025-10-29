import React, { useState, useEffect } from 'react';

/**
 * Reusable button for async actions with loading/success states.
 * Handles both internal click-driven loading and external loading props.
 */
function AiButton({
    onClick,
    initialText,
    loadingText,
    iconClass = "fa-solid fa-wand-magic-sparkles",
    loadingIconClass = "fas fa-spinner fa-spin",
    timeout = 2000,
    onComplete,
    buttonType = "ai-button",
    isExternallyLoading = false
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const actualLoading = isLoading || isExternallyLoading;

  useEffect(() => {
    if (!isExternallyLoading) {
        setIsLoading(false);
        setIsDone(false);
    }
  }, [initialText, isExternallyLoading]);

  const handleClick = async () => {
    setIsLoading(true);
    if (onClick) {
      const shouldProceed = await onClick();
      if (shouldProceed === false) {
          setIsLoading(false);
          return;
      }
    }

    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      setIsDone(true);
      if (onComplete) onComplete();

      setTimeout(() => setIsDone(false), 2000);
    }, timeout);
  };

  const buttonClasses = [
      buttonType,
      actualLoading ? 'ai-loading' : ''
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} onClick={handleClick} disabled={actualLoading || isDone}>
      {isDone ? (
        <><i className="fas fa-check"></i> Completato</>
      ) : actualLoading ? (
        <><i className={loadingIconClass}></i> {loadingText}<span className="loading-dots"></span></>
      ) : (
        <><i className={iconClass}></i> {initialText}</>
      )}
      {/* Loading wave animation */}
      {actualLoading && <span className="ai-wave-animation"></span>}
    </button>
  );
}

export default AiButton;