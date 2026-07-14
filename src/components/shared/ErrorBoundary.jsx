import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
          <p className="text-sm text-red-500 font-medium">Something went wrong in this section.</p>
          <button
            className="text-xs px-3 py-1 rounded bg-neutral-200 dark:bg-neutral-700 hover:opacity-80"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
          {this.props.fallback || null}
        </div>
      );
    }
    return this.props.children;
  }
}
