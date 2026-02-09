import React from 'react';

function AiButton({
    onClick,
    initialText,
    loadingText,
    iconClass = "fa-solid fa-wand-magic-sparkles",
    loadingIconClass = "fas fa-spinner fa-spin",
    buttonType = "ai-button",
    isLoading = false
}) {

  const handleClick = () => {
    if (!isLoading && onClick) {
      onClick();
    }
  };

  const buttonClasses = [
      buttonType,
      isLoading ? 'ai-loading' : ''
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <><i className={loadingIconClass}></i> {loadingText}<span className="loading-dots"></span></>
      ) : (
        <><i className={iconClass}></i> {initialText}</>
      )}
      {isLoading && <span className="ai-wave-animation"></span>}
    </button>
  );
}

export default AiButton;