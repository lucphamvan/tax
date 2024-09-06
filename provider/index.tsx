'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { viVN } from '@mui/x-date-pickers/locales'
const queryClient = new QueryClient()

interface ProviderProps {
    children: React.ReactNode
}

const Provider = ({ children }: ProviderProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <LocalizationProvider localeText={viVN.components.MuiLocalizationProvider.defaultProps.localeText} dateAdapter={AdapterDayjs}>
                {children}
            </LocalizationProvider>
        </QueryClientProvider>
    )
}
export default Provider
