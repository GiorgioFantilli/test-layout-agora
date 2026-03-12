import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from '../../AppContext';
import EmailItem from './EmailItem';
import { useMessages } from '../../hooks/useEmails';
import { BACKEND_STATUS, FRONTEND_STATUS } from '../../services/dtoMappers';

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
  const limit = 20;

  const [skipPending, setSkipPending] = useState(0);
  const [skipProcessed, setSkipProcessed] = useState(0);
  const [hasMorePending, setHasMorePending] = useState(true);
  const [hasMoreProcessed, setHasMoreProcessed] = useState(true);

  const isPendingView = state.currentView === 'pending';
  const currentSkip = isPendingView ? skipPending : skipProcessed;
  const currentStatuses = isPendingView
    ? [BACKEND_STATUS.PERSISTED]
    : [BACKEND_STATUS.PROCESSED];

  const { data: fetchedEmails, isFetching } = useMessages(limit, currentSkip, currentStatuses);

  useEffect(() => {
    if (fetchedEmails && Object.keys(fetchedEmails).length > 0) {
      const count = Object.keys(fetchedEmails).length;

      if (isPendingView) {
        setHasMorePending(count === limit);
      } else {
        setHasMoreProcessed(count === limit);
      }

      dispatch({ type: 'APPEND_EMAILS', payload: fetchedEmails });
    }
  }, [fetchedEmails, isPendingView, dispatch, limit]);

  const loadMore = useCallback(() => {
    if (isFetching) return;

    if (isPendingView && hasMorePending) {
      setSkipPending((prev) => prev + limit);
    } else if (!isPendingView && hasMoreProcessed) {
      setSkipProcessed((prev) => prev + limit);
    }
  }, [isFetching, isPendingView, hasMorePending, hasMoreProcessed]);

  const handleSelectEmail = (emailId) => {
    dispatch({ type: 'SELECT_EMAIL', payload: emailId });
  };



  const allEmails = Object.entries(state.emails);

  const pendingEmails = allEmails
    .filter(([id, email]) => email.status === FRONTEND_STATUS.PENDING || email.status === FRONTEND_STATUS.ANALYZED);

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
              <Sentinel hasMore={hasMorePending} isLoading={isFetching} onVisible={loadMore} />
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
              <Sentinel hasMore={hasMoreProcessed} isLoading={isFetching} onVisible={loadMore} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EmailListPanel;