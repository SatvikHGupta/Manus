import { useStore } from '../store/index.js';

export function useOnboarding() {
  const onboardingDone    = useStore(s => s.onboardingDone ?? false);
  const setOnboardingDone = useStore(s => s.setOnboardingDone);

  const dismiss = () => setOnboardingDone(true);

  return { showTour: !onboardingDone, dismiss };
}
