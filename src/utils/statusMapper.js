
export const BACKEND_STATUS = {
  PERSISTED: 'PERSISTED',
  PROCESSED: 'PROCESSED'
};

export const BACKEND_PARSE_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  PARSED: 'PARSED',
  ANALYZED: 'ANALYZED',
  FAILED: 'FAILED'
};

export const FRONTEND_STATUS = {
  PENDING: 'pending',
  ANALYZED: 'analyzed',
  PROCESSED: 'processed'
};


export const mapBackendStatusToFrontend = (backendStatus, backendParseStatus) => {
  const statusUpper = (backendStatus || '').toUpperCase();
  const parseStatusUpper = (backendParseStatus || '').toUpperCase();

  let frontendStatus = FRONTEND_STATUS.PENDING;

  if (statusUpper === BACKEND_STATUS.PROCESSED) {
    frontendStatus = FRONTEND_STATUS.PROCESSED;
  } else if (statusUpper === BACKEND_STATUS.PERSISTED) {
    if (parseStatusUpper === BACKEND_PARSE_STATUS.PARSED || parseStatusUpper === BACKEND_PARSE_STATUS.ANALYZED) {
      frontendStatus = FRONTEND_STATUS.ANALYZED;
    } else {
      frontendStatus = FRONTEND_STATUS.PENDING;
    }
  }

  return frontendStatus;
};
