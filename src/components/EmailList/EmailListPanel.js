import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from '../../AppContext';
import EmailItem from './EmailItem';
import { fetchMessages } from '../../services/api';
import { BACKEND_STATUS, FRONTEND_STATUS } from '../../utils/statusMapper';

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
    pending: { skip: 0, hasMore: true, isLoading: false, statuses: [BACKEND_STATUS.PERSISTED] },
    processed: { skip: 0, hasMore: true, isLoading: false, statuses: [BACKEND_STATUS.PROCESSED] }
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
      if (pagRef.current.pending.skip === 0) loadMore('pending');
    } else if (state.currentView === 'processed') {
      if (pagRef.current.processed.skip === 0) loadMore('processed');
    }
  }, [state.currentView, loadMore]);


  const handleSelectEmail = (emailId) => {
    dispatch({ type: 'SELECT_EMAIL', payload: emailId });
  };

  // Filter emails based on the current view mapping locally
  const allEmails = Object.entries(state.emails);

  const pendingEmails = allEmails
    .filter(([id, email]) => email.status === FRONTEND_STATUS.PENDING || email.status === FRONTEND_STATUS.ANALYZED)
    .sort(([idA, emailA], [idB, emailB]) => {
      const dateA = emailA.date ? new Date(emailA.date).getTime() : 0;
      const dateB = emailB.date ? new Date(emailB.date).getTime() : 0;
      return dateB - dateA;
    });

  const processedEmails = allEmails
    .filter(([id, email]) => email.status === FRONTEND_STATUS.PROCESSED);

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
          <div id="pending-section">
            <div id="email-list" className="email-list-container">
              {pendingEmails.map(([id, email]) => (
                <EmailItem
                  key={id}
                  emailId={id}
                  email={email}
                  onSelect={handleSelectEmail}
                  isSelected={state.selectedEmailId === id}
                />
              ))}
              <Sentinel
                hasMore={pagRef.current.pending.hasMore}
                isLoading={pagRef.current.pending.isLoading}
                onVisible={() => loadMore('pending')}
              />
            </div>
          </div>
        ) : (
          /* Processed View */
          <div id="processed-section">
            <div id="email-list" className="email-list-container">
              {processedEmails
                .sort(([idA, emailA], [idB, emailB]) => {
                  const dateA = emailA.date ? new Date(emailA.date).getTime() : 0;
                  const dateB = emailB.date ? new Date(emailB.date).getTime() : 0;
                  return dateB - dateA;
                })
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