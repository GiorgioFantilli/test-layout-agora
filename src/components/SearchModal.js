import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    InputBase,
    Box,
    IconButton,
    Typography,
    Button,
    Fade,
    Zoom,
    Paper,
} from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import {
    Search as SearchIcon,
    Close as CloseIcon,
    Tune as FilterIcon,
    Person as PersonIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useAppContext } from '../AppContext';

const SearchModal = () => {
    const { state, dispatch } = useAppContext();
    const [subject, setSubject] = useState('');
    const [sender, setSender] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [hasAttachments, setHasAttachments] = useState(false);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isAdvanced, setIsAdvanced] = useState(false);

    // Sync with global filters if they exist
    useEffect(() => {
        if (state.searchFilters) {
            setSubject(state.searchFilters.subject || '');
            setSender(state.searchFilters.sender || '');
            setDateFrom(state.searchFilters.date_from || '');
            setDateTo(state.searchFilters.date_to || '');
            setHasAttachments(!!state.searchFilters.has_attachments);
            setSortBy(state.searchFilters.sort_by || 'date');
            setSortOrder(state.searchFilters.sort_order || 'desc');

            // Open advanced if any of these are set
            if (state.searchFilters.sender ||
                state.searchFilters.date_from ||
                state.searchFilters.date_to ||
                state.searchFilters.has_attachments ||
                (state.searchFilters.sort_by && state.searchFilters.sort_by !== 'date') ||
                (state.searchFilters.sort_order && state.searchFilters.sort_order !== 'desc')) {
                setIsAdvanced(true);
            }
        }
    }, [state.searchFilters]);

    const handleClose = () => {
        dispatch({ type: 'CLOSE_SEARCH' });
    };

    const handleApply = () => {
        const filters = {};
        if (subject.trim()) filters.subject = subject.trim();
        if (sender.trim()) filters.sender = sender.trim();
        if (dateFrom) filters.date_from = dateFrom;
        if (dateTo) filters.date_to = dateTo;
        if (hasAttachments) filters.has_attachments = true;
        filters.sort_by = sortBy;
        filters.sort_order = sortOrder;

        dispatch({ type: 'SET_SEARCH_FILTERS', payload: filters });
    };

    const handleReset = () => {
        setSubject('');
        setSender('');
        setDateFrom('');
        setDateTo('');
        setHasAttachments(false);
        setSortBy('date');
        setSortOrder('desc');
        dispatch({ type: 'RESET_SEARCH_FILTERS' });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleApply();
        }
    };

    return (
        <Dialog
            open={state.isSearchOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Zoom}
            transitionDuration={250}
            PaperProps={{
                className: "spotlight-modal-paper apple-style",
                elevation: 0
            }}
            slotProps={{
                backdrop: {
                    className: "spotlight-backdrop"
                }
            }}
        >
            <DialogContent className="spotlight-content">
                <Box className="spotlight-main-input-wrapper">
                    <SearchIcon className="spotlight-search-icon" />
                    <InputBase
                        autoFocus
                        placeholder="Cerca"
                        fullWidth
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={(e) => e.target.scrollLeft = 0}
                        className="spotlight-input"
                    />
                    {subject && (
                        <IconButton size="small" onClick={() => setSubject('')} className="spotlight-clear-btn">
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    )}
                    <Box className="spotlight-input-divider" />
                    <Tooltip
                        title="Filtri"
                        slotProps={{
                            popper: {
                                sx: {
                                    [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
                                    {
                                        marginTop: '3.6px',
                                    },
                                },
                            },
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => setIsAdvanced(!isAdvanced)}
                            className={isAdvanced ? "spotlight-toggle-btn active" : "spotlight-toggle-btn"}
                        >
                            <i className="fa-solid fa-sliders"></i>
                        </IconButton>
                    </Tooltip>
                </Box>

                {isAdvanced && (
                    <Box className="spotlight-advanced-container">
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="overline" className="spotlight-section-label">Ordina per</Typography>
                                <Box className="sort-field-selector">
                                    <Tooltip title="Data">
                                        <Box
                                            className={`sort-field-option ${sortBy === 'date' ? 'active' : ''}`}
                                            onClick={() => setSortBy('date')}
                                        >
                                            <i className="fa-solid fa-calendar-days"></i>
                                        </Box>
                                    </Tooltip>
                                    <Tooltip title="Oggetto">
                                        <Box
                                            className={`sort-field-option ${sortBy === 'subject' ? 'active' : ''}`}
                                            onClick={() => setSortBy('subject')}
                                        >
                                            <i className="fa-solid fa-heading"></i>
                                        </Box>
                                    </Tooltip>
                                    <Tooltip title="Mittente">
                                        <Box
                                            className={`sort-field-option ${sortBy === 'sender' ? 'active' : ''}`}
                                            onClick={() => setSortBy('sender')}
                                        >
                                            <i className="fa-solid fa-user"></i>
                                        </Box>
                                    </Tooltip>
                                    <Tooltip title="Stato">
                                        <Box
                                            className={`sort-field-option ${sortBy === 'status' ? 'active' : ''}`}
                                            onClick={() => setSortBy('status')}
                                        >
                                            <i className="fa-solid fa-circle-info"></i>
                                        </Box>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="overline" className="spotlight-section-label">Direzione</Typography>
                                <Box className="spotlight-order-selector">
                                    <Box
                                        className={`order-option ${sortOrder === 'desc' ? 'active' : ''}`}
                                        onClick={() => setSortOrder('desc')}
                                    >
                                        <i className="fa-solid fa-arrow-down-9-1"></i>
                                        Decrescente
                                    </Box>
                                    <Box
                                        className={`order-option ${sortOrder === 'asc' ? 'active' : ''}`}
                                        onClick={() => setSortOrder('asc')}
                                    >
                                        <i className="fa-solid fa-arrow-up-1-9"></i>
                                        Crescente
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Box fle>
                            <Typography variant="overline" className="spotlight-section-label">Filtra per Mittente</Typography>
                            <Box className="spotlight-field-minimal">
                                <PersonIcon fontSize="small" className="field-icon" />
                                <InputBase
                                    placeholder="nome@email.it"
                                    fullWidth
                                    value={sender}
                                    onChange={(e) => setSender(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={(e) => e.target.scrollLeft = 0}
                                    className="spotlight-sub-input"
                                />
                                {sender && (
                                    <IconButton size="small" onClick={() => setSender('')}>
                                        <ClearIcon fontSize="small" style={{ fontSize: '14px' }} />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="overline" className="spotlight-section-label">Dal</Typography>
                                <Box className="spotlight-field-minimal">
                                    <input
                                        type="date"
                                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'inherit', fontSize: '0.9rem' }}
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="overline" className="spotlight-section-label">Al</Typography>
                                <Box className="spotlight-field-minimal">
                                    <input
                                        type="date"
                                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'inherit', fontSize: '0.9rem' }}
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                            <Box
                                className={`ios-switch ${hasAttachments ? 'active' : ''}`}
                                onClick={() => setHasAttachments(!hasAttachments)}
                            >
                                <div className="ios-switch-track" />
                                <Typography variant="overline" className="spotlight-section-label">
                                    Solo con allegati
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                <Box className="spotlight-minimal-footer">
                    <Box className="spotlight-shortcuts">
                        <Typography variant="caption" className="shortcut">
                            <span className="key">↵</span> Cerca
                        </Typography>
                        <Typography variant="caption" className="shortcut">
                            <span className="key">esc</span> Chiudi
                        </Typography>
                    </Box>
                    <Box className="spotlight-main-actions">
                        {(subject || sender || dateFrom || dateTo || hasAttachments || Object.keys(state.searchFilters).length > 0) && (
                            <Button size="small" onClick={handleReset} className="btn-minimal-text">
                                Cancella filtri
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleApply}
                            className="btn-apple-primary"
                            disableElevation
                        >
                            Mostra Risultati
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SearchModal;
