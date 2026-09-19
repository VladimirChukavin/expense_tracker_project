import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Expense Tracker
              </h1>
              <p className="text-muted-foreground">
                Приложение инициализировано успешно
              </p>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
