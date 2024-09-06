'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()

interface ProviderProps {
    children: React.ReactNode
}

const Provider = ({ children }: ProviderProps) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
export default Provider
