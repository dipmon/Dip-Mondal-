import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cyber Circuit Runtime Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070814] text-slate-200 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0d0e23] border border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.3)] text-center">
            <div className="inline-flex p-3 rounded-xl bg-rose-500/20 text-rose-400 mb-4 border border-rose-500/40 animate-pulse">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h1 className="cyber-font text-xl font-bold text-white mb-2 tracking-wide">
              SYSTEM MATRIX FAULT
            </h1>
            <p className="text-xs font-mono text-slate-400 mb-4 leading-relaxed">
              An unexpected anomaly occurred within the circuit matrix. 
            </p>
            <div className="p-3 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-rose-400 text-left overflow-x-auto mb-5 max-h-28">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-cyan-500 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REBOOT MATRIX TERMINAL</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
