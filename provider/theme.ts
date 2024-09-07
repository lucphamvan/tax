'use client'
import { Inter } from 'next/font/google'
import { createTheme } from '@mui/material/styles'
import { viVN } from '@mui/x-date-pickers/locales'

const roboto = Inter({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
})

const theme = createTheme(
    {
        palette: {
            mode: 'light',
        },
        typography: {
            fontFamily: roboto.style.fontFamily,
        },
        defaultColorScheme: 'light',
        components: {
            MuiAlert: {
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.severity === 'info' && {
                            backgroundColor: '#60a5fa',
                        }),
                    }),
                },
            },
        },
    }
    // viVN
)

export default theme
