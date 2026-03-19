import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { name } = this.props;
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <i className="fas fa-triangle-exclamation text-2xl text-red-400" aria-hidden="true"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              {name ? `Error en ${name}` : "Algo salió mal"}
            </h2>
            <p className="max-w-sm text-sm text-white/60">
              Ocurrió un error inesperado. Puedes intentar recargar el playground o volver al inicio.
            </p>
            {this.state.error && (
              <p className="mt-2 max-w-sm truncate font-mono text-xs text-red-400/80">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              <i className="fas fa-rotate-right mr-2" aria-hidden="true"></i>
              Reintentar
            </button>
            <a
              href="/"
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              <i className="fas fa-house mr-2" aria-hidden="true"></i>
              Inicio
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
