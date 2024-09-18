import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/material'

interface ErrorDialogProps {
    open: boolean
    onClose: () => void
    message: string
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    fullWidth?: boolean
}

const ErrorDialog = ({ open, onClose, message, maxWidth = 'sm', fullWidth = true }: ErrorDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="error-dialog-title" aria-describedby="error-dialog-description" maxWidth={maxWidth} fullWidth={fullWidth}>
            <DialogContent>
                <Typography id="error-dialog-description" variant="body1">
                    {message}
                </Typography>
            </DialogContent>
            <Box padding="1rem" paddingTop={0}>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Đóng
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

export default ErrorDialog
