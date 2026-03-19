import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useAppContext } from "../../AppContext";
import EmailItem from "./EmailItem";
import AccountFilter from "./AccountFilter";
import SearchModal from "../SearchModal";
import { useMessages, useEmailAccounts } from "../../hooks/useEmails";

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

  // Filtri per ogni vista:
  // ready      → generation_status COMPLETED|MANUAL_REVIEW, escludi errori
  // processing → generation_status non terminale (NULL = pipeline AI non ancora avviata), escludi errori
  // error      → has_errors=true
  const viewFilters = useMemo(() => {
    switch (state.currentView) {
      case "ready":
        return {
          generationStatuses: ["COMPLETED", "MANUAL_REVIEW"],
          hasErrors: false,
        };
      case "processing":
        return {
          generationStatuses: [
            "NULL",
            "PENDING",
            "CONTEXT_READY",
            "LLM_GENERATION",
          ],
          hasErrors: false,
        };
      case "error":
        return { generationStatuses: [], hasErrors: true };
      default:
        return { generationStatuses: [], hasErrors: null };
    }
  }, [state.currentView]);

  const { data: accounts = [] } = useEmailAccounts();
  const disabledAccountIds = useMemo(
    () => new Set(accounts.filter((a) => !a.enabled).map((a) => String(a.id))),
    [accounts],
  );

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useMessages(
    limit,
    [],
    state.selectedAccountIds,
    state.searchFilters,
    {},
    [],
    viewFilters.generationStatuses,
    viewFilters.hasErrors,
  );

  useEffect(() => {
    if (infiniteData?.pages) {
      const isFirstPage = infiniteData.pages?.length === 1;
      const emailsMap = {};

      infiniteData.pages.forEach((page) => {
        if (page?.result) {
          page.result.forEach((email) => {
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

  const currentEmails = Object.entries(state.emails).filter(
    ([, email]) =>
      state.selectedAccountIds?.length === 0 ||
      state.selectedAccountIds?.some(
        (aid) => String(aid) === String(email.account_id),
      ),
  );
  const visibleDisabledAccounts = useMemo(() => {
    const visibleDisabledIds = new Set(
      currentEmails
        .filter(([, email]) => disabledAccountIds.has(String(email.account_id)))
        .map(([, email]) => String(email.account_id)),
    );
    return accounts.filter((a) => visibleDisabledIds.has(String(a.id)));
  }, [currentEmails, disabledAccountIds, accounts]);

  const subheadTextMap = {
    ready: "Da lavorare",
    processing: "In elaborazione",
    error: "In errore",
  };
  const subheadText = subheadTextMap[state.currentView] ?? "";

  return (
    <>
      <div
        className={`email-list-scroll-area fade-in scrollbar-styled ${state.currentView !== state.previousView ? "content-fade-in" : ""}`}
      >
        <div className="list-main-header">
          <div className="title-subhead-stack">
            <h2 className="list-main-title">Posta in arrivo</h2>
            <span className="list-main-subhead">{subheadText}</span>
          </div>
          <AccountFilter />
          <div className="header-right-actions">
            <button
              className="header-action-btn"
              title="Cerca"
              onClick={() => dispatch({ type: "TOGGLE_SEARCH" })}
            >
              <i className="fas fa-search"></i>
            </button>
            <button
              className="header-action-btn"
              title="Aggiorna"
              onClick={() => refetch()}
              disabled={isFetching && !isFetchingNextPage}
            >
              <i
                className={`fas fa-sync-alt ${isFetching && !isFetchingNextPage ? "fa-spin" : ""}`}
              ></i>
            </button>
          </div>
        </div>

        {visibleDisabledAccounts.length > 0 && (
          <div className="disabled-accounts-banner">
            <i className="fas fa-pause-circle"></i>
            <span>
              {visibleDisabledAccounts.length === 1 ? (
                <>
                  <strong>{visibleDisabledAccounts[0].address}</strong> è
                  inattiva — non riceverà nuovi messaggi
                </>
              ) : (
                <>
                  Alcune caselle visibili sono inattive — non riceveranno nuovi
                  messaggi
                </>
              )}
            </span>
            <button
              className="disabled-accounts-banner-cta"
              onClick={() =>
                dispatch({ type: "SWITCH_VIEW", payload: "dashboard" })
              }
            >
              Gestisci <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}

        <div id="email-list" className="email-list-container">
          {currentEmails.map(([id, email]) => (
            <EmailItem
              key={id}
              emailId={id}
              email={email}
              onSelect={handleSelectEmail}
              isSelected={state.selectedEmailId === id}
              isAccountDisabled={disabledAccountIds.has(
                String(email.account_id),
              )}
            />
          ))}
          <Sentinel
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            onVisible={loadMore}
          />
        </div>
        <SearchModal />
      </div>
    </>
  );
}

export default EmailListPanel;
