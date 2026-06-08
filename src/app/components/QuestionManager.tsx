import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

export type QuestionType = "text" | "radio" | "checkbox" | "dropdown" | "scale" | "date";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  answer: string;
  options?: string[];
  required: boolean;
  useRandom: boolean;
  entryId: string; // e.g. "entry.1234567890"
}

interface QuestionManagerProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
  disabled: boolean;
}

const typeLabels: Record<QuestionType, string> = {
  text: "Teks Pendek",
  radio: "Pilihan Ganda",
  checkbox: "Kotak Centang",
  dropdown: "Dropdown",
  scale: "Skala Linear",
  date: "Tanggal",
};

const typeBadgeColors: Record<QuestionType, string> = {
  text: "bg-blue-100 text-blue-700",
  radio: "bg-purple-100 text-purple-700",
  checkbox: "bg-orange-100 text-orange-700",
  dropdown: "bg-teal-100 text-teal-700",
  scale: "bg-pink-100 text-pink-700",
  date: "bg-indigo-100 text-indigo-700",
};

export function QuestionManager({ questions, onChange, disabled }: QuestionManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      label: `Pertanyaan ${questions.length + 1}`,
      type: "text",
      answer: "",
      required: false,
      useRandom: false,
      entryId: "",
    };
    onChange([...questions, newQ]);
    setExpandedId(newQ.id);
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  return (
    <div className="flex flex-col gap-3">
      {questions.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Belum ada pertanyaan. Tambahkan pertanyaan untuk memulai.</p>
        </div>
      )}

      {questions.map((q, index) => (
        <div
          key={q.id}
          className="border border-border rounded-xl overflow-hidden bg-card"
        >
          {/* Question Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
              {index + 1}
            </span>
            <p className="flex-1 text-sm truncate">{q.label || "Pertanyaan tanpa judul"}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColors[q.type]} hidden sm:block`}>
              {typeLabels[q.type]}
            </span>
            {q.useRandom && (
              <Badge className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-100 hidden sm:flex">
                Acak
              </Badge>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeQuestion(q.id);
              }}
              disabled={disabled}
              className="p-1 hover:bg-destructive/10 rounded text-destructive/60 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {expandedId === q.id ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          {/* Expanded Editor */}
          {expandedId === q.id && (
            <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Label Pertanyaan</Label>
                  <Input
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                    placeholder="Masukkan label pertanyaan"
                    disabled={disabled}
                    className="text-sm h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Tipe Pertanyaan</Label>
                  <Select
                    value={q.type}
                    onValueChange={(val) => updateQuestion(q.id, { type: val as QuestionType, answer: "" })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Entry ID */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Entry ID Google Form
                  <span className="ml-1 text-red-400">*</span>
                </Label>
                <Input
                  value={q.entryId}
                  onChange={(e) => updateQuestion(q.id, { entryId: e.target.value })}
                  placeholder="entry.1234567890"
                  disabled={disabled}
                  className={`text-sm h-9 font-mono ${!q.entryId && "border-orange-300"}`}
                />
                {!q.entryId && (
                  <p className="text-xs text-orange-500 mt-1">Wajib diisi agar form terkirim ke Google</p>
                )}
              </div>

              {/* Answer Input based on type */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-muted-foreground">Jawaban</Label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.useRandom}
                      onChange={(e) => updateQuestion(q.id, { useRandom: e.target.checked })}
                      disabled={disabled}
                      className="w-3 h-3"
                    />
                    Jawaban Acak
                  </label>
                </div>

                {!q.useRandom && (
                  <>
                    {q.type === "text" && (
                      <Textarea
                        value={q.answer}
                        onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                        placeholder="Masukkan jawaban teks..."
                        disabled={disabled}
                        className="text-sm resize-none"
                        rows={2}
                      />
                    )}
                    {(q.type === "radio" || q.type === "dropdown" || q.type === "checkbox") && (
                      <div className="flex flex-col gap-2">
                        <Input
                          value={q.answer}
                          onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                          placeholder="Masukkan pilihan jawaban (pisahkan dengan koma untuk beberapa)"
                          disabled={disabled}
                          className="text-sm h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                          Contoh: "Opsi A" atau "Opsi A, Opsi B" untuk beberapa
                        </p>
                      </div>
                    )}
                    {q.type === "scale" && (
                      <div className="flex flex-col gap-2">
                        <Input
                          type="number"
                          value={q.answer}
                          onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                          placeholder="Nilai (mis: 1-10)"
                          disabled={disabled}
                          className="text-sm h-9"
                        />
                      </div>
                    )}
                    {q.type === "date" && (
                      <Input
                        type="date"
                        value={q.answer}
                        onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                        disabled={disabled}
                        className="text-sm h-9"
                      />
                    )}
                  </>
                )}

                {q.useRandom && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
                    Bot akan memilih/mengisi jawaban secara acak untuk pertanyaan ini
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <Button
        onClick={addQuestion}
        disabled={disabled}
        variant="outline"
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Tambah Pertanyaan
      </Button>
    </div>
  );
}