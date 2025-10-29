import React from 'react';
import { useAppContext } from '../../AppContext';
import EmailItem from './EmailItem';

function EmailListPanel() {
  const { state, dispatch } = useAppContext();

  const handleViewChange = (view) => {
    dispatch({ type: 'SWITCH_VIEW', payload: view });
  };

  const handleSelectEmail = (emailId) => {
    dispatch({ type: 'SELECT_EMAIL', payload: emailId });
  };

  const toggleUnread = () => {
    dispatch({ type: 'TOGGLE_UNREAD' });
  };

  // Filter emails based on the current view
  const allEmails = Object.entries(state.emails);

  // "Pending" View
  const pendingEmails = allEmails
    .filter(([id, email]) => email.status === 'read' || email.status === 'unread' || email.status === 'analyzed');

  // "Processed" View
  const processedEmails = allEmails
    .filter(([id, email]) => email.status === 'processed');

  // Filter logic for 'Pending' view sections
  const unreadEmails = pendingEmails
    .filter(([id, email]) => email.status === 'unread' || id === state.visuallyUnreadId)
    .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date));

  const readEmails = pendingEmails
    .filter(([id, email]) => (email.status === 'read' || email.status === 'analyzed') && id !== state.visuallyUnreadId)
    .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date));

  const pendingCount = pendingEmails.length;
  const processedCount = processedEmails.length;
  const unreadCount = unreadEmails.length;
  const readCount = readEmails.length;

  return (
    <>
      {/* Filter Bar */}
      <div className="filter-bar flex-shrink-0">
        <div className="filter-bar-header">
          <div className="sliding-pill-toggle">
            <input
              type="radio"
              name="view-toggle"
              id="pill-input-1"
              className="sliding-pill-input"
              checked={state.currentView === 'pending'}
              onChange={() => handleViewChange('pending')}
            />
            <label htmlFor="pill-input-1" className="sliding-pill-label" id="filter-pending-label">
              <i className="fas fa-clock"></i>Da Protocollare <span className="pill-badge">{pendingCount}</span>
            </label>
            <input
              type="radio"
              name="view-toggle"
              id="pill-input-2"
              className="sliding-pill-input"
              checked={state.currentView === 'processed'}
              onChange={() => handleViewChange('processed')}
            />
            <label htmlFor="pill-input-2" className="sliding-pill-label" id="filter-processed-label">
              <i className="fas fa-check"></i>Protocollate <span className="pill-badge">{processedCount}</span>
            </label>
            <div className="sliding-pill-bg"></div>
          </div>
        </div>
      </div>

      {/* Email List Scroll Area */}
      <div 
        key={state.currentView} 
        className="email-list-scroll-area scrollbar-styled content-fade-in"
      >
        {state.currentView === 'pending' ? (
          <>
            {/* Unread Section */}
            <div id="unread-section">
              <div className="list-section-header" onClick={toggleUnread}>
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope"></i></div> Non Lette (<span>{unreadCount}</span>)
                  </h3>
                  <button id="expand-unread" className="expand-unread-button">
                    <i
                      className="fas fa-chevron-down transform transition-transform"
                      style={{ transform: state.unreadExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    ></i>
                  </button>
                </div>
              </div>

              {!state.unreadExpanded && unreadCount > 0 ? (
                 <div id="unread-preview" className="unread-preview">
                    {unreadEmails.slice(0, 3).map(([id, email]) => (
                        <EmailItem
                            key={id}
                            emailId={id}
                            email={email}
                            onSelect={handleSelectEmail}
                            isSelected={state.selectedEmailId === id}
                        />
                    ))}
                    {unreadEmails.length > 3 && (
                      <div className="show-more-indicator" onClick={toggleUnread}>
                        <i className="fas fa-chevron-down"></i> Mostra altre {unreadEmails.length - 3}<i className="fas fa-chevron-down"></i>
                      </div>
                    )}
                 </div>
              ) : (
                <div id="unread-emails" style={{ display: state.unreadExpanded ? 'block' : 'none' }}>
                  {unreadEmails.map(([id, email]) => (
                    <EmailItem
                        key={id}
                        emailId={id}
                        email={email}
                        onSelect={handleSelectEmail}
                        isSelected={state.selectedEmailId === id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Read Section */}
            <div id="read-section">
              <div className="list-section-header">
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope-open"></i></div> Lette (<span>{readCount}</span>)
                  </h3>
                </div>
              </div>
              <div id="email-list" className="email-list-container">
                {readEmails.map(([id, email]) => (
                  <EmailItem
                    key={id}
                    emailId={id}
                    email={email}
                    onSelect={handleSelectEmail}
                    isSelected={state.selectedEmailId === id}
                    />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Processed View */
          <div id="processed-section">
            <div id="email-list" className="email-list-container">
              {processedEmails
                .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date)) // Oldest first
                .map(([id, email]) => (
                <EmailItem
                  key={id}
                  emailId={id}
                  email={email}
                  onSelect={handleSelectEmail}
                  isSelected={state.selectedEmailId === id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EmailListPanel;