import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from '../../AppContext';
import EmailItem from './EmailItem';
import { fetchMessages } from '../../services/api';

// Sentinel component that triggers an action when it enters the viewport
function Sentinel({ onVisible, hasMore, isLoading }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onVisible();
      }
    }, { threshold: 0.1 });

    const currentRef = sentinelRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoading, onVisible]);

  if (!hasMore) return null;

  return (
    <div ref={sentinelRef} style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0' }}>
      {isLoading && <i className="fas fa-spinner fa-spin text-gray-500 text-xl"></i>}
    </div>
  );
}

function EmailListPanel() {
  const { state, dispatch } = useAppContext();

  // Pagination cursors mapped by group name
  const pagRef = useRef({
    unread: { skip: 0, hasMore: true, isLoading: false, statuses: ['UNREAD'] },
    read: { skip: 0, hasMore: true, isLoading: false, statuses: ['READ'] },
    processed: { skip: 0, hasMore: true, isLoading: false, statuses: ['PROCESSED'] }
  });

  const [, forceRender] = useState({});

  const loadMore = useCallback(async (group) => {
    const pagState = pagRef.current[group];
    if (pagState.isLoading || !pagState.hasMore) return;

    pagState.isLoading = true;
    forceRender({});

    try {
      const limit = 20;
      const newEmails = await fetchMessages(null, limit, pagState.skip, pagState.statuses);
      const count = Object.keys(newEmails).length;

      dispatch({ type: 'APPEND_EMAILS', payload: newEmails });

      pagState.skip += count;
      pagState.hasMore = count === limit;
    } catch (err) {
      console.error(`Error fetching more emails for ${group}`, err);
    } finally {
      pagState.isLoading = false;
      forceRender({});
    }
  }, [dispatch]);

  // Initial load logic based on view
  useEffect(() => {
    if (state.currentView === 'pending') {
      if (pagRef.current.unread.skip === 0) loadMore('unread');
      if (pagRef.current.read.skip === 0) loadMore('read');
    } else if (state.currentView === 'processed') {
      if (pagRef.current.processed.skip === 0) loadMore('processed');
    }
  }, [state.currentView, loadMore]);


  const handleSelectEmail = (emailId) => {
    dispatch({ type: 'SELECT_EMAIL', payload: emailId });
  };

  const toggleUnread = () => {
    dispatch({ type: 'TOGGLE_UNREAD' });
  };

  // Filter emails based on the current view mapping locally
  const allEmails = Object.entries(state.emails);

  const pendingEmails = allEmails
    .filter(([id, email]) => email.status === 'read' || email.status === 'unread' || email.status === 'analyzed');

  const processedEmails = allEmails
    .filter(([id, email]) => email.status === 'processed');

  // Filter logic for 'Pending' view sections
  const unreadEmails = pendingEmails
    .filter(([id, email]) => email.status === 'unread' || id === state.visuallyUnreadId)
    .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date));

  const readEmails = pendingEmails
    .filter(([id, email]) => (email.status === 'read' || email.status === 'analyzed') && id !== state.visuallyUnreadId)
    .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date));

  const unreadCount = unreadEmails.length;
  // NOTE: This reflects dynamically loaded count, not total backend count.
  const readCount = readEmails.length;

  const subheadText = state.currentView === 'pending' ? 'Da Protocollare' : 'Protocollate';

  return (
    <>
      <div
        key={state.currentView}
        className="email-list-scroll-area scrollbar-styled content-fade-in"
      >
        <div className="list-main-header">
          <h2 className="list-main-title">Posta in arrivo</h2>
          <span className="list-main-subhead">{subheadText}</span>
        </div>

        {state.currentView === 'pending' ? (
          <>
            {/* Unread Section */}
            <div id="unread-section">
              <div className="list-section-header" onClick={toggleUnread} style={{ cursor: 'pointer' }}>
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope"></i></div> Non Lette
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
                  {(unreadEmails.length > 3 || pagRef.current.unread.hasMore) && (
                    <div className="show-more-indicator" onClick={toggleUnread} style={{ cursor: 'pointer', textAlign: 'center', padding: '10px 0', color: '#007bff' }}>
                      <i className="fas fa-chevron-down"></i> Espandi tutte le non lette <i className="fas fa-chevron-down"></i>
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
                  <Sentinel
                    hasMore={pagRef.current.unread.hasMore}
                    isLoading={pagRef.current.unread.isLoading}
                    onVisible={() => loadMore('unread')}
                  />
                </div>
              )}
            </div>

            {/* Read Section */}
            <div id="read-section">
              <div className="list-section-header">
                <div className="list-header-content">
                  <h3 className="flex items-center">
                    <div className="list-icon-bg"><i className="fas fa-envelope-open"></i></div> Lette
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
                <Sentinel
                  hasMore={pagRef.current.read.hasMore}
                  isLoading={pagRef.current.read.isLoading}
                  onVisible={() => loadMore('read')}
                />
              </div>
            </div>
          </>
        ) : (
          /* Processed View */
          <div id="processed-section">
            <div id="email-list" className="email-list-container">
              {processedEmails
                .sort(([idA, emailA], [idB, emailB]) => new Date(emailA.date) - new Date(emailB.date))
                .map(([id, email]) => (
                  <EmailItem
                    key={id}
                    emailId={id}
                    email={email}
                    onSelect={handleSelectEmail}
                    isSelected={state.selectedEmailId === id}
                  />
                ))}
              <Sentinel
                hasMore={pagRef.current.processed.hasMore}
                isLoading={pagRef.current.processed.isLoading}
                onVisible={() => loadMore('processed')}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EmailListPanel;