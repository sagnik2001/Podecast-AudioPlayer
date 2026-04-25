import {useCallback, useSyncExternalStore} from 'react';

import {
  getAutoplayEnabled,
  subscribeToAutoplay,
  toggleAutoplayEnabled,
} from '../services/trackPlayer';

export function useAutoplay() {
  const enabled = useSyncExternalStore(
    subscribeToAutoplay,
    getAutoplayEnabled,
    getAutoplayEnabled,
  );
  const toggle = useCallback(() => {
    toggleAutoplayEnabled();
  }, []);

  return {enabled, toggle};
}
