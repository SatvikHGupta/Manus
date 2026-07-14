import { useRef, useCallback } from 'react';
import { useStore, usePages, useCurrentIndex, useSettings } from '../../store/index.js';
import { computeFitZoomForBreakpoint } from '../../utils/layout/breakpoint.js';
import { HandwritingPage } from '../page/HandwritingPage.jsx';
import { PagesManager }   from '../pages-manager/PagesManager.jsx';
import { ErrorBoundary }  from '../shared/ErrorBoundary.jsx';
import { PageZoomControls } from './PageZoomControls.jsx';
import { PagePager } from './PagePager.jsx';

export function CanvasColumn({ pageRefs: externalRefs }) {
  const pages        = usePages();
  const currentIndex = useCurrentIndex();
  const currentSettings = useSettings();
  const zoom          = useStore(s => s.zoom);
  const breakpoint     = useStore(s => s.breakpoint);
  const localRefs    = useRef([]);
  const pageRefs     = externalRefs || localRefs;

  const setRef = useCallback((el, i) => {
    pageRefs.current[i] = el;
  }, [pageRefs]);

  const activePageHeight = currentSettings.pageHeight;
  const activeScaledHeight = activePageHeight * zoom;

  // On mobile/tablet, zoom is auto-fit to the viewport - a scrollbar has no
  // business showing up at that default fit level. Rather than relying on
  // the fit-zoom math being pixel-perfect against unpredictable mobile
  // browser chrome (address bar show/hide, safe-area insets, etc.), only
  // switch this to a scrollable container once the user has genuinely
  // zoomed in past what fits. Desktop has no forced auto-fit, so a page
  // that's simply too big to fit is normal and scrolling should always be
  // available there.
  const fitZoom = breakpoint !== 'desktop'
    ? computeFitZoomForBreakpoint(breakpoint, currentSettings.pageWidth, currentSettings.pageHeight)
    : null;
  const allowScroll = fitZoom == null || zoom > fitZoom * 1.02;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-accent/10 dark:border-neutral-800 shrink-0 no-print">
        <PagePager />
        <PageZoomControls />
      </div>

      <div className="flex flex-1 min-h-0">
        <div className={`flex-1 ${allowScroll ? 'overflow-auto' : 'overflow-hidden'}`}>
          <div className="flex flex-col items-center py-8 px-4">
            {/*
              All pages stay mounted at all times (never conditionally
              rendered) so export refs never go stale - this is the same
              constraint that fixed the mobile export bug previously.
              Only the active page sits in normal document flow; the rest
              are hidden via absolute positioning + opacity so they don't
              take up scroll space or show up visually.
            */}
            <div className="relative" style={{ height: `${activeScaledHeight}px` }}>
              {pages.map((page, i) => {
                const isActive = i === currentIndex;
                return (
                  <div
                    key={page.id}
                    aria-hidden={!isActive}
                    className={isActive ? '' : 'absolute inset-0 overflow-hidden'}
                    style={{
                      opacity: isActive ? 1 : 0,
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  >
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                      <ErrorBoundary>
                        <HandwritingPage
                          ref={el => setRef(el, i)}
                          page={page}
                          isActive={isActive}
                        />
                      </ErrorBoundary>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <PagesManager />
      </div>
    </div>
  );
}
