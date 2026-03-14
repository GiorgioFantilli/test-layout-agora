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
    Tooltip
} from '@mui/material';
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
    const [isAdvanced, setIsAdvanced] = useState(false);

    // Sync with global filters if they exist
    useEffect(() => {
        if (state.searchFilters) {
            setSubject(state.searchFilters.subject || '');
            setSender(state.searchFilters.sender || '');
            if (state.searchFilters.sender) setIsAdvanced(true);
        }
    }, [state.searchFilters]);

    const handleClose = () => {
        dispatch({ type: 'CLOSE_SEARCH' });
    };

    const handleApply = () => {
        const filters = {};
        if (subject.trim()) filters.subject = subject.trim();
        if (sender.trim()) filters.sender = sender.trim();

        dispatch({ type: 'SET_SEARCH_FILTERS', payload: filters });
    };

    const handleReset = () => {
        setSubject('');
        setSender('');
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
                        placeholder="Cerca messaggi..."
                        fullWidth
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="spotlight-input"
                    />
                    {subject && (
                        <IconButton size="small" onClick={() => setSubject('')} className="spotlight-clear-btn">
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    )}
                    <Box className="spotlight-input-divider" />
                    <Tooltip title="Filtri avanzati">
                        <IconButton
                            size="small"
                            onClick={() => setIsAdvanced(!isAdvanced)}
                            className={isAdvanced ? "spotlight-toggle-btn active" : "spotlight-toggle-btn"}
                        >
                            <FilterIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {isAdvanced && (
                    <Box className="spotlight-advanced-container">
                        <Typography variant="overline" className="spotlight-section-label">Mittente</Typography>
                        <Box className="spotlight-field-minimal">
                            <PersonIcon fontSize="small" className="field-icon" />
                            <InputBase
                                placeholder="Esempio: nome@email.it"
                                fullWidth
                                value={sender}
                                onChange={(e) => setSender(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="spotlight-sub-input"
                            />
                            {sender && (
                                <IconButton size="small" onClick={() => setSender('')}>
                                    <ClearIcon fontSize="small" style={{ fontSize: '14px' }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                )}

                <Box className="spotlight-minimal-footer">
                    <Box className="spotlight-shortcuts">
                        <Typography variant="caption" className="shortcut">
                            <span className="key">↵</span> Cercare
                        </Typography>
                        <Typography variant="caption" className="shortcut">
                            <span className="key">esc</span> Chiudere
                        </Typography>
                    </Box>
                    <Box className="spotlight-main-actions">
                        {(subject || sender || Object.keys(state.searchFilters).length > 0) && (
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
