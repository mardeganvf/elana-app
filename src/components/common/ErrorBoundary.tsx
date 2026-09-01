import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4 text-white">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-2xl shadow-lg">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-white">Ops, algo não carregou como esperado</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Nosso espaço acolhedor teve uma oscilação momentânea. Clique no botão abaixo para tentar novamente.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recarregar Página</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
