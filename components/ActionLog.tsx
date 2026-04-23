'use client';
import { useGameStore } from '../store/gameStore';

export function ActionLog() {
  const { gameState } = useGameStore();
  const actionLog = gameState?.actionLog || [];

  if (actionLog.length === 0) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl overflow-hidden h-full flex flex-col">
        <h2 className="text-xl font-bold mb-2 px-2 tracking-tight">Action Log</h2>
        <div className="flex-1 overflow-y-auto text-slate-400 text-sm px-2">
          Game started... Waiting for moves.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl overflow-hidden h-full flex flex-col">
      <h2 className="text-xl font-bold mb-2 px-2 tracking-tight">Action Log</h2>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar flex flex-col-reverse">
        {actionLog.map((log: { message: string, timestamp: number }, i: number) => (
          <div key={log.timestamp + i} className="text-sm border-l-2 pl-3 py-1 border-slate-600">
            <span className="text-slate-500 text-[10px] block font-mono">
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
