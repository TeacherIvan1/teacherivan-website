import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary caught fatal render error]:', error, errorInfo);
  }

  handleClearCacheAndReload = async (): Promise<void> => {
    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // 2. Clear all cache storage
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // 3. Clear non-essential localStorage caches
      try {
        localStorage.removeItem('teacher-ivan-cache-v1');
        localStorage.removeItem('ti_custom_resources_guest');
      } catch {}

      // 4. Force reload from server
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-fallback"
          className="min-h-screen bg-[#091326] text-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center font-inter"
        >
          <div className="max-w-md w-full bg-[#132642] border-2 border-[#E09B30]/50 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center mx-auto text-[#E09B30]">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/15 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Teacher Ivan • Auto-Recuperación</span>
              </div>
              <h1 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA]">
                Actualización de Versión Requerida
              </h1>
              <p className="text-xs sm:text-sm text-[#A7C7E7] leading-relaxed">
                Detectamos datos en caché de una versión previa. Haz clic abajo para limpiar la memoria caché y cargar la versión estable más reciente.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                id="error-boundary-reload-btn"
                onClick={this.handleClearCacheAndReload}
                className="w-full py-4 px-6 rounded-full font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] transition-all shadow-xl shadow-[#E09B30]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={16} />
                <span>Limpiar Caché y Recargar / Reset Cache & Reload</span>
              </button>
            </div>

            {this.state.error && (
              <details className="text-left text-[11px] text-[#A7C7E7]/60 pt-2 border-t border-[#A7C7E7]/20">
                <summary className="cursor-pointer hover:text-[#FAFAFA]">Detalles técnicos</summary>
                <pre className="mt-2 p-2 rounded bg-[#091326] overflow-x-auto font-mono text-[10px]">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
