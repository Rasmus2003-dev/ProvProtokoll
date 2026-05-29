import React, { ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // @ts-ignore
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-danger/20">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <CardTitle className="text-danger text-2xl">Något gick fel</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-text-muted">
                Ett oväntat fel uppstod i applikationen. Din data är automatiskt sparad lokalt.
              </p>
              {this.state.error && (
                <div className="bg-danger/5 p-3 rounded-lg text-left text-sm text-danger/80 w-full overflow-auto max-h-32 font-mono">
                  {this.state.error.message}
                </div>
              )}
              <Button onClick={this.handleReset} className="w-full" size="lg">
                Ladda om sidan
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
