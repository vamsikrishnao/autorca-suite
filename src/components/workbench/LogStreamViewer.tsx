import React from 'react';
import { Radio, Wifi } from 'lucide-react';
import { LogEntry } from '../../types';

export interface LogStreamViewerProps {
  logs: LogEntry[];
  isRunning: boolean;
}

export const LogStreamViewer: React.FC<LogStreamViewerProps> = ({ logs, isRunning }) => {
  const getLogTypeColor = (status?: string) => {
    switch (status) {
      case 'PASSED':
      case 'SUCCESS':
        return 'text-emerald-400';
      case 'FAILED':
      case 'ERROR':
        return 'text-rose-400';
      case 'WARN':
        return 'text-amber-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="flex-1 p-4 font-mono text-[11px] text-slate-300 space-y-2 overflow-y-auto max-h-[480px]">
      {/* SSE Streaming Event-Driven Orchestration Banner */}
      <div className="mb-3 p-2 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Server-Sent Events (SSE) Stream Streamer: Connected</span>
        </div>
        <span className="text-emerald-400 font-mono font-bold">Durable Background Execution Active</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-slate-500 italic flex items-center justify-center h-48">
          Click "RUN AUTORCA &amp; FIX" to initiate the autonomous engineering loop...
        </div>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="flex gap-2.5 items-start leading-relaxed">
            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
            <span
              className={`font-bold shrink-0 uppercase text-right ${getLogTypeColor(
                log.action
              )}`}
            >
              {log.action}
            </span>
            <div>
              <div className="flex-1">
                <div className="text-slate-200">{log.message}</div>
              </div>
              <div className="flex-1">
                {log.tokensBurnt && log.tokensBurnt.total > 0 && (
                  <div className="text-[10px] text-amber-400 font-mono">
                    (Burn: +{log.tokensBurnt.total} tok)
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      {isRunning && (
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <span className="animate-pulse">_</span>
          <span>Executing active sub-agent loop...</span>
        </div>
      )}
    </div>
  );
};
