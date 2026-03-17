import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAppContext } from "../../AppContext";
import EmailItem from "./EmailItem";
import AccountFilter from "./AccountFilter";
import SearchModal from '../SearchModal';
import { useMessages } from "../../hooks/useEmails";
import { BACKEND_STATUS, FRONTEND_STATUS } from "../../services/dtoMappers";

// Sentinel component that triggers an action when it enters the viewport
function Sentinel({ onVisible, hasMore, isLoading }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = sentinelRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoading, onVisible]);

  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      style={{
        height: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "10px 0",
      }}
    >
      {isLoading && (
        <i className="fas fa-spinner fa-spin text-gray-500 text-xl"></i>
      )}
    </div>
  );
}

function EmailListPanel() {
  const { state, dispatch } = useAppContext();
  const limit = 20;

  const isPendingView = state.currentView === 'pending';

  const currentStatuses = useMemo(
    () => isPendingView ? [BACKEND_STATUS.PERSISTED] : [BACKEND_STATUS.PROCESSED],
    [isPendingView]
  );

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch
  } = useMessages(
    limit,
    currentStatuses,
    state.selectedAccountIds,
    state.searchFilters
  );

  useEffect(() => {
    if (infiniteData?.pages) {
      const isFirstPage = infiniteData.pages?.length === 1;
      const emailsMap = {};

      infiniteData.pages.forEach(page => {
        if (page?.result) {
          page.result.forEach(email => {
            emailsMap[email.id] = email;
          });
        }
      });

      if (isFirstPage) {
        dispatch({ type: "SET_EMAILS", payload: emailsMap });
      } else {
        dispatch({ type: "APPEND_EMAILS", payload: emailsMap });
      }
    }
  }, [infiniteData, dispatch]);

  const loadMore = useCallback(() => {
    if (isFetching || isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [isFetching, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleSelectEmail = (emailId) => {
    dispatch({ type: "SELECT_EMAIL", payload: emailId });
  };

  const allEmails = Object.entries(state.emails);

  const pendingEmails = allEmails.filter(
    ([id, email]) =>
      (email.status === FRONTEND_STATUS.PENDING || email.status === FRONTEND_STATUS.ANALYZED) &&
      (state.selectedAccountIds?.length === 0 || state.selectedAccountIds?.some(aid => String(aid) === String(email.account_id)))
  );

  const processedEmails = allEmails.filter(
    ([id, email]) =>
      email.status === FRONTEND_STATUS.PROCESSED &&
      (state.selectedAccountIds?.length === 0 || state.selectedAccountIds?.some(aid => String(aid) === String(email.account_id)))
  );

  const subheadText = state.currentView === "pending" ? "Da Protocollare" : "Protocollate";

  return (
    <>
      <div
        key={state.currentView}
        className="email-list-scroll-area scrollbar-styled content-fade-in"
      >
        <div className="list-main-header">
          <h2 className="list-main-title">Posta in arrivo</h2>
          <span className="list-main-subhead">{subheadText}</span>
          <AccountFilter />
          <div className="header-right-actions">
            <button
              className="header-action-btn"
              title="Cerca"
              onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}
            >
              <i className="fas fa-search"></i>
            </button>
            <button
              className="header-action-btn"
              title="Aggiorna"
              onClick={() => refetch()}
              disabled={isFetching && !isFetchingNextPage}
            >
              <i className={`fas fa-sync-alt ${isFetching && !isFetchingNextPage ? "fa-spin" : ""}`}></i>
            </button>
          </div>
        </div>

        {state.currentView === "pending" ? (
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
              <Sentinel hasMore={hasNextPage} isLoading={isFetchingNextPage} onVisible={loadMore} />
            </div>
          </div>
        ) : (
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
              <Sentinel hasMore={hasNextPage} isLoading={isFetchingNextPage} onVisible={loadMore} />
            </div>
          </div>
        )}
        <SearchModal />
      </div>
    </>
  );
}

export default EmailListPanel;