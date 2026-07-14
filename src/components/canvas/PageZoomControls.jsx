import { ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { Tooltip } from '../shared/Tooltip.jsx';

export function PageZoomControls() {
  const zoom      = useStore(s => s.zoom);
  const zoomIn    = useStore(s => s.zoomIn);
  const zoomOut   = useStore(s => s.zoomOut);
  const resetZoom = useStore(s => s.resetZoom);

  return (
    <div className="flex items-center gap-1">
      <Tooltip label="Zoom out" shortcut="Ctrl -">
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ZoomOut size={14} />
        </button>
      </Tooltip>

      <Tooltip label="Reset zoom" shortcut="Ctrl 0">
        <button
          onClick={resetZoom}
          className="min-w-[44px] px-2 py-1 text-xs font-mono rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-center"
        >
          {Math.round(zoom * 100)}%
        </button>
      </Tooltip>

      <Tooltip label="Zoom in" shortcut="Ctrl +">
        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ZoomIn size={14} />
        </button>
      </Tooltip>
    </div>
  );
}
