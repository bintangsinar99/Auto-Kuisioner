import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

interface StatsPanelProps {
  totalSubmitted: number;
  successCount: number;
  errorCount: number;
  avgTime: number;
}

export function StatsPanel({ totalSubmitted, successCount, errorCount, avgTime }: StatsPanelProps) {
  const successRate = totalSubmitted > 0 ? Math.round((successCount / totalSubmitted) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Total Kirim</span>
        </div>
        <p className="text-2xl text-foreground">{totalSubmitted}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Berhasil</span>
        </div>
        <p className="text-2xl text-green-500">{successCount}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-muted-foreground">Gagal</span>
        </div>
        <p className="text-2xl text-red-500">{errorCount}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">Tingkat Sukses</span>
        </div>
        <p className="text-2xl text-blue-500">{successRate}%</p>
      </div>
    </div>
  );
}
