import { useBreakpoint }         from '../../hooks/useBreakpoint.js';
import { DesktopLayout }          from './DesktopLayout.jsx';
import { TabletLayout }           from './TabletLayout.jsx';
import { MobileLayout }           from '../mobile/MobileLayout.jsx';

export function MainLayout({ pageRefs }) {
  const { isMobile, isTablet } = useBreakpoint();

  if (isMobile) {
    return <MobileLayout pageRefs={pageRefs} />;
  }

  if (isTablet) {
    return <TabletLayout pageRefs={pageRefs} />;
  }

  return <DesktopLayout pageRefs={pageRefs} />;
}
