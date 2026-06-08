import { useRef, useEffect } from "react";
import { Terminal, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

export type LogLevel = "info" | "success" | "error" | "warning" | "system";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

interface BotConsoleProps {
  logs: LogEntry[];
  isRunning: boolean;
  currentSubmission: number;
  totalSubmissions: number;
}

const levelColors: Record<LogLevel, string> = {
  info: "text-blue-400",
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  system: "text-gray-400",
};

const levelPrefix: Record<LogLevel, string> = {
  info: "[INFO]",
  success: "[OK] ",
  error: "[ERR]",
  warning: "[WARN]",
  system: "[SYS]",
};

export function BotConsole({ logs, isRunning, currentSubmission, totalSubmissions }: BotConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const progress = totalSubmissions > 0 ? (currentSubmission / totalSubmissions) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-700 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">Bot Console</span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Memproses...</span>
            </div>
          )}
          <span className="text-gray-500 text-xs">{logs.length} baris</span>
        </div>
      </div>

      {/* Progress Bar */}
      {totalSubmissions > 0 && (
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>Progress Pengiriman</span>
            <span>{currentSubmission} / {totalSubmissions}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Log Area */}
      <ScrollArea className="flex-1 bg-gray-950 rounded-b-xl">
        <div className="p-4 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-600">
              <Terminal className="w-8 h-8 mb-2 opacity-30" />
              <p>Konsol kosong. Mulai bot untuk melihat log.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 group">
                  <span className="text-gray-600 shrink-0 pt-px">{log.timestamp}</span>
                  <span className={`shrink-0 pt-px ${levelColors[log.level]}`}>
                    {levelPrefix[log.level]}
                  </span>
                  <span className={`flex-1 break-all ${levelColors[log.level]} opacity-90`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
