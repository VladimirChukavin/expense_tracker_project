import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-gray-600 mb-6">
              Произошла ошибка при загрузке приложения
            </p>
            {this.state.error && (
              <pre className="text-left bg-gray-100 p-4 rounded-lg text-sm mb-6 overflow-auto max-w-2xl">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
