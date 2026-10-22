// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Download, Copy, Check } from 'lucide-react';

interface Props {
  children?: ReactNode;
  key?: React.Key;
}

interface State {
  hasError: boolean;
  error?: Error;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      copied: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  // Rendera om skärmen utan att ladda om sidan – provdatan ligger kvar i minnet
  private handleRetry = () => {
    // @ts-ignore
    this.setState({ hasError: false, error: undefined, copied: false });
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
      // @ts-ignore
      this.setState({ copied: true });
      // @ts-ignore
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(() => {});
  };

  // Nödlägesexport: laddar ner all provdata och historik som JSON så inget förloras
  private handleExportBackup = () => {
    try {
      const backupData: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        url: window.location.href,
        state: null,
        history: null,
        syncQueue: null,
      };

      try {
        const stateRaw = localStorage.getItem('provprotokoll-state');
        if (stateRaw) backupData.state = JSON.parse(stateRaw);
      } catch (_) {}

      try {
        const histRaw = localStorage.getItem('provprotokoll-test-history');
        if (histRaw) backupData.history = JSON.parse(histRaw);
      } catch (_) {}

      try {
        const queueRaw = localStorage.getItem('provprotokoll-sync-queue');
        if (queueRaw) backupData.syncQueue = JSON.parse(queueRaw);
      } catch (_) {}

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ProvProtokoll_nodkopia_${new Date().toLocaleDateString('sv-SE')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Kunde inte skapa säkerhetskopia: ${e?.message || 'okänt fel'}`);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full min-h-[420px] bg-canvas flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-line rounded-card shadow-float overflow-hidden p-6 sm:p-7">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-xl font-bold text-ink tracking-tight">Något gick fel</h2>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">
                Ett oväntat fel uppstod i den här vyn. All din provdata är sparad lokalt och är säker.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full h-11 px-4 rounded-control bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <RefreshCw size={16} />
                Försök igen
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="h-10 px-3 rounded-control border border-line bg-surface hover:bg-surface-2 text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Home size={14} />
                  Startsidan
                </button>
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="h-10 px-3 rounded-control border border-line bg-surface hover:bg-surface-2 text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} />
                  Ladda om
                </button>
              </div>

              <button
                type="button"
                onClick={this.handleExportBackup}
                className="w-full h-10 px-3 rounded-control border border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Ladda ned provdata som en JSON-fil"
              >
                <Download size={14} />
                Spara säkerhetskopia (JSON)
              </button>
            </div>

            {this.state.error && (
              <div className="mt-5 pt-4 border-t border-line">
                <div className="flex items-center justify-between text-xs text-ink-3 mb-2">
                  <span>Teknisk felinformation</span>
                  <button
                    type="button"
                    onClick={this.handleCopyError}
                    className="text-navy dark:text-blue-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {this.state.copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {this.state.copied ? 'Kopierat' : 'Kopiera fel'}
                  </button>
                </div>
                <div className="bg-surface-2 border border-line p-3 rounded-[10px] text-[11px] text-ink-2 font-mono overflow-auto max-h-36 whitespace-pre-wrap select-text">
                  <span className="font-bold text-red-600 dark:text-red-400">{this.state.error.message}</span>
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

