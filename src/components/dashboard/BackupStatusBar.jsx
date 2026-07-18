import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { Spinner } from '../shared/Spinner.jsx';
import { Tooltip } from '../shared/Tooltip.jsx';
import { MANUAL_SYNC_COOLDOWN_MS } from '../../constants/limits.js';

function nextUtcHourLabel() {
  const next = Math.ceil(Date.now() / 3_600_000) * 3_600_000;
  return new Date(next).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeLabel(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function cooldownState(lastSyncAt) {
  const remainingMs = lastSyncAt ? MANUAL_SYNC_COOLDOWN_MS - (Date.now() - lastSyncAt) : 0;
  return {
    active: remainingMs > 0,
    minutesLeft: Math.max(1, Math.ceil(remainingMs / 60_000)),
  };
}

export function BackupStatusBar() {
  const user          = useStore(s => s.user);
  const syncing       = useStore(s => s.syncing);
  const lastSyncAt    = useStore(s => s.lastSyncAt);
  const lastSyncError = useStore(s => s.lastSyncError);
  const syncNow       = useStore(s => s.syncNow);

  // The label below is computed from Date.now() at render time only - without
  // this, it silently falls behind (or shows a past hour) if nothing else
  // causes a re-render while the panel sits open across an hour boundary.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Signed out entirely (or Firebase not configured) - nothing to show,
  // matches AccountButton's own "invisible unless relevant" pattern.
  if (!user) return null;

  const { active: cooldownActive, minutesLeft: cooldownMinutesLeft } = cooldownState(lastSyncAt);

  const syncButton = (
    <button
      onClick={syncNow}
      disabled={syncing || cooldownActive}
      className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-50 transition-colors"
    >
      <RefreshCw size={11} />
      Sync now
    </button>
  );

  return (
    <div className="flex items-center justify-between px-3 py-2 mb-5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-accent/15 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
      <div className="flex items-center gap-1.5">
        {syncing ? (
          <>
            <Spinner size={13} />
            Backing up now...
          </>
        ) : lastSyncError ? (
          <>
            <CloudOff size={13} className="text-red-500" />
            Last backup failed - next attempt at {nextUtcHourLabel()}
          </>
        ) : (
          <>
            <Cloud size={13} />
            {lastSyncAt ? `Last backup ${timeLabel(lastSyncAt)} \u00b7 ` : ''}
            Next backup at {nextUtcHourLabel()}
          </>
        )}
      </div>
      {cooldownActive
        ? <Tooltip label={`Wait ${cooldownMinutesLeft}m before syncing again`} side="top">{syncButton}</Tooltip>
        : syncButton}
    </div>
  );
}
