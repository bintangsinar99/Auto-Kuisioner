import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Code2, MousePointer2, Eye } from "lucide-react";

export function EntryIdGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-sm text-blue-800">Cara mendapatkan Entry ID dari Google Form</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-blue-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-500" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-blue-200 bg-blue-50">
          <div className="flex flex-col gap-4 pt-3">

            {/* Method 1 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-sm text-blue-900 mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Buka form di browser
                </p>
                <p className="text-xs text-blue-700">
                  Buka Google Form Anda menggunakan link <code className="bg-blue-100 px-1 rounded">/viewform</code>
                </p>
              </div>
            </div>

            {/* Method 2 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-sm text-blue-900 mb-1 flex items-center gap-1.5">
                  <MousePointer2 className="w-3.5 h-3.5" />
                  Klik kanan pada field pertanyaan
                </p>
                <p className="text-xs text-blue-700">
                  Klik kanan pada input field jawaban → pilih <strong>"Inspect"</strong> / <strong>"Inspect Element"</strong>
                </p>
              </div>
            </div>

            {/* Method 3 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
              <div>
                <p className="text-sm text-blue-900 mb-1 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Cari atribut <code className="bg-blue-100 px-1 rounded">name</code>
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Di panel DevTools, cari elemen <code className="bg-blue-100 px-1 rounded">&lt;input&gt;</code> dengan atribut <code className="bg-blue-100 px-1 rounded">name</code> yang dimulai dengan <code className="bg-blue-100 px-1 rounded">entry.</code>
                </p>
                <div className="bg-blue-900 rounded-lg p-2.5 font-mono text-xs text-green-300 overflow-x-auto">
                  <p className="text-gray-400">&lt;!-- Contoh elemen di HTML form --&gt;</p>
                  <p>&lt;input</p>
                  <p>&nbsp;&nbsp;<span className="text-yellow-300">type</span>=<span className="text-orange-300">"text"</span></p>
                  <p>&nbsp;&nbsp;<span className="text-yellow-300">name</span>=<span className="text-green-300">"entry.1234567890"</span></p>
                  <p>&gt;</p>
                </div>
              </div>
            </div>

            {/* Method 4 */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">4</div>
              <div>
                <p className="text-sm text-blue-900 mb-1">Alternatif: Lihat sumber halaman</p>
                <p className="text-xs text-blue-700 mb-2">
                  Tekan <kbd className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded text-xs">Ctrl+U</kbd> untuk melihat source halaman, lalu cari semua <code className="bg-blue-100 px-1 rounded">entry.</code> sekaligus
                </p>
                <div className="bg-blue-900 rounded-lg p-2.5 font-mono text-xs overflow-x-auto">
                  <p className="text-blue-400">{/* Contoh URL pengiriman: */}</p>
                  <p className="text-gray-300">https://docs.google.com/forms/d/e/</p>
                  <p className="text-yellow-300">1FAIpQLSf.../formResponse</p>
                  <p className="text-gray-500 mt-1">{/* Body POST: */}</p>
                  <p className="text-green-300">entry.111=jawaban1</p>
                  <p className="text-green-300">&entry.222=jawaban2</p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
              <strong>Tips:</strong> URL submit harus menggunakan format <code className="bg-blue-200 px-1 rounded">/formResponse</code> bukan <code className="bg-blue-200 px-1 rounded">/viewform</code>. Bot akan otomatis mengkonversinya.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
