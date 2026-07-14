import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useOnboarding } from '../../hooks/useOnboarding.js';
import { useStore } from '../../store/index.js';

// Fix for bug #39: on mobile/tablet, the font picker and sidebar tour
// targets live behind a settings drawer that isn't open by default.
// driver.js resolves `element` (when given as a function) synchronously
// right before it needs the node, so we use that hook to flushSync the
// drawer open first, then query the DOM - by the time querySelector runs,
// React has already re-rendered the correct view. The text-input target no
// longer needs any special handling - the mobile composer keeps it visible
// at all times, unlike the old tab-switching layout.
function buildSteps() {
  const { breakpoint } = useStore.getState();
  const isMobile = breakpoint === 'mobile';

  const showSettings = () => {
    const s = useStore.getState();
    if (isMobile) {
      if (!s.mobileSettingsOpen) flushSync(() => s.setMobileSettingsOpen(true));
    } else if (!s.sidebarOpen) {
      flushSync(() => s.setSidebarOpen(true));
    }
  };

  return [
    {
      element: () => document.querySelector('[data-tour="text-input"]'),
      popover: {
        title: 'Start typing',
        description: 'Type or paste your notes here. They render live as handwriting on the page.',
        side: isMobile ? 'top' : 'left',
      },
    },
    {
      element: () => { showSettings(); return document.querySelector('[data-tour="font-picker"]'); },
      popover: {
        title: 'Pick a font',
        description: 'Choose from 50 handwriting fonts, or upload your own from the same menu.',
        side: 'right',
      },
    },
    {
      element: () => { showSettings(); return document.querySelector('[data-tour="sidebar"]'); },
      popover: {
        title: 'Style your page',
        description: 'Switch tabs to change paper type, line spacing, ink effects, and margins.',
        side: 'right',
      },
    },
    {
      element: () => document.querySelector('[data-tour="color-tags-btn"]'),
      popover: {
        title: 'Color tags',
        description: 'Wrap text in tags like <r>red</r> or <bl>blue</bl> to add inline ink color. Click this icon anytime for the full list.',
        side: 'bottom',
      },
    },
    {
      element: '[data-tour="export-btn"]',
      popover: {
        title: 'Export when ready',
        description: 'Download as PNG, PDF, SVG, or ZIP - or copy straight to your clipboard.',
        side: 'bottom',
      },
    },
  ];
}

export function OnboardingTour() {
  const { showTour, dismiss } = useOnboarding();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!showTour || startedRef.current) return;
    startedRef.current = true;

    // wait one frame so target elements are mounted and painted
    const id = requestAnimationFrame(() => {
      const initial = useStore.getState();
      const isMobile = initial.breakpoint === 'mobile';

      const tour = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.65,
        stagePadding: 6,
        stageRadius: 10,
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Get started',
        steps: buildSteps(),
        onDestroyed: () => {
          // Restore whatever settings-drawer state the user was on before
          // the tour started, so they aren't left stranded with it forced
          // open when they didn't choose that.
          const s = useStore.getState();
          if (isMobile) {
            if (s.mobileSettingsOpen !== initial.mobileSettingsOpen) s.setMobileSettingsOpen(initial.mobileSettingsOpen);
          } else if (s.sidebarOpen !== initial.sidebarOpen) {
            s.setSidebarOpen(initial.sidebarOpen);
          }
          dismiss();
        },
      });
      tour.drive();
    });

    return () => cancelAnimationFrame(id);
  }, [showTour, dismiss]);

  return null;
}
