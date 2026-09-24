import React, { Component, ErrorInfo, ReactNode } from 'react';
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

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // Rendera om skärmen utan att ladda om sidan – provdatan ligger kvar i minnet
  private handleRetry = () => {
    // @ts-ignore
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/korprov/start';
  };

  private handleCopyError = () => {
    if (!this.state.error) return;
    const info = `Felmeddelande: ${this.state.error.message}\nPlats: ${window.location.href}\nTidpunkt: ${new Date().toISOString()}\nStack:\n${this.state.error.stack || 'Ingen stack'}`;
    navigator.clipboard.writeText(info).then(() => {
      alert('Felrapport kopierad till urklipp.');
    }).catch(() => {});
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-danger/20">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <CardTitle className="text-danger text-2xl">Något gick fel</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-5">
              <p className="text-text-muted">
                Ett oväntat fel uppstod. Allt du fyllt i är sparat lokalt och kan återupptas från startsidan.
              </p>
              <div className="grid gap-2.5">
                <Button onClick={this.handleRetry} className="w-full" size="lg">
                  Försök igen
                </Button>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                    Till startsidan
                  </Button>
                  <Button onClick={this.handleReload} variant="outline" className="w-full">
                    Ladda om
                  </Button>
                </div>
              </div>
              {this.state.error && (
                <details className="text-left">
                  <div className="flex items-center justify-between">
                    <summary className="text-xs text-text-muted cursor-pointer select-none">Teknisk information</summary>
                    <button
                      type="button"
                      onClick={this.handleCopyError}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Kopiera fel
                    </button>
                  </div>
                  <div className="mt-2 bg-danger/5 p-3 rounded-lg text-xs text-danger/80 w-full overflow-auto max-h-60 font-mono whitespace-pre-wrap">
                    <div className="font-bold text-sm mb-1">{this.state.error.message}</div>
                    <div>{this.state.error.stack}</div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
