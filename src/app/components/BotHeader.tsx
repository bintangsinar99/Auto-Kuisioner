import { Bot, Zap } from "lucide-react";
import { Badge } from "./ui/badge";

interface BotHeaderProps {
  isRunning: boolean;
  totalSubmitted: number;
}

export function BotHeader({ isRunning, totalSubmitted }: BotHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white">FormBot Auto-Filler</h1>
          <p className="text-white/60 text-xs">Otomasi pengisian kuesioner & Google Form</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {totalSubmitted > 0 && (
          <div className="text-right hidden sm:block">
            <p className="text-white/60 text-xs">Total Terkirim</p>
            <p className="text-white text-lg">{totalSubmitted}</p>
          </div>
        )}
        <Badge
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${
            isRunning
              ? "bg-green-500 text-white hover:bg-green-500"
              : "bg-white/10 text-white hover:bg-white/10"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? "bg-white animate-pulse" : "bg-white/40"
            }`}
          />
          {isRunning ? "Berjalan" : "Siap"}
        </Badge>
        <div className="hidden sm:flex items-center gap-1.5 text-white/60 text-xs">
          <Zap className="w-3.5 h-3.5" />
          <span>v2.0</span>
        </div>
      </div>
    </header>
  );
}
