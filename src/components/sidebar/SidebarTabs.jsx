import { useStore } from '../../store/index.js';

const TABS = [
  { id: 'font',   label: 'Font'   },
  { id: 'line',   label: 'Line/Letter' },
  { id: 'word',   label: 'Word'   },
  { id: 'paper',  label: 'Paper'  },
  { id: 'ink',    label: 'Ink'    },
];

export function SidebarTabs() {
  const sidebarTab    = useStore(s => s.sidebarTab);
  const setSidebarTab = useStore(s => s.setSidebarTab);

  return (
    <div className="flex border-b border-accent/10 dark:border-neutral-800 shrink-0">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setSidebarTab(tab.id)}
          className={`flex-1 py-2.5 text-[11px] font-medium transition-colors relative ${
            sidebarTab === tab.id
              ? 'text-neutral-900 dark:text-neutral-100'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          {sidebarTab === tab.id && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent dark:bg-white rounded-full" />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
