
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { processBrief } from './services/geminiService';
import { HistoryItem } from './types';
import { SAMPLE_BRIEF } from './constants';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const formatText = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      let line = lines[i];

      // Handle Tables
      if (line.trim().startsWith('|')) {
        const tableRows: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableRows.push(lines[i]);
          i++;
        }
        
        const rows = tableRows.filter(r => !r.includes('---')); // Filter out separator row
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-rose-100 rounded-xl overflow-hidden">
              <tbody className="bg-white">
                {rows.map((row, rowIndex) => {
                  const filteredCells = row.split('|').map(s => s.trim()).filter((s, idx, arr) => {
                    if (idx === 0 && s === '') return false;
                    if (idx === arr.length - 1 && s === '') return false;
                    return true;
                  });

                  if (filteredCells.length === 0) return null;

                  return (
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-rose-50/50 font-bold text-rose-800" : "border-t border-rose-50"}>
                      {filteredCells.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-3 text-xs sm:text-sm border-r border-rose-50 last:border-r-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Standard Line Rendering
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-rose-800 border-b-2 border-rose-50 pb-2">{line.replace('# ', '')}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-6 mb-3 text-rose-700">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('---')) {
        elements.push(<hr key={i} className="my-8 border-rose-100" />);
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-rose-300 pl-4 italic my-4 text-stone-600 bg-rose-50/40 py-3 rounded-r-lg">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('✅ ') || line.startsWith('❌ ')) {
        elements.push(<li key={i} className="ml-2 mb-1 text-stone-700 list-none flex gap-2"><span>{line.startsWith('- ') || line.startsWith('* ') ? '•' : ''}</span>{line.replace(/^[-*]\s/, '')}</li>);
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(<li key={i} className="ml-2 mb-1 text-stone-700 list-none flex gap-2"><span>{line.split('.')[0]}.</span>{line.replace(/^\d+\.\s/, '')}</li>);
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        // Bold and simple formatting
        let processedLine: React.ReactNode = line;
        if (line.includes('**')) {
          const parts = line.split('**');
          processedLine = parts.map((part, j) => (
            j % 2 === 1 ? <strong key={j} className="text-stone-900 font-bold">{part}</strong> : part
          ));
        }
        elements.push(<p key={i} className="mb-3 text-stone-700 leading-relaxed text-[15px]">{processedLine}</p>);
      }
      i++;
    }
    return elements;
  };

  return <div className="markdown-content">{formatText(content)}</div>;
};

const App: React.FC = () => {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('brief_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const output = await processBrief(brief);
      setResult(output);
      
      const brandMatch = output.match(/\*\*Brand:\*\*\s*(.*)/);
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        brand: brandMatch ? brandMatch[1].trim() : 'New Strategy',
        date: new Date().toLocaleDateString(),
        content: output
      };
      
      const newHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('brief_history', JSON.stringify(newHistory));
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert('Strategist suggestions copied to clipboard! 💖');
    }
  };

  const startNew = () => {
    setBrief('');
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const useSample = () => {
    setBrief(SAMPLE_BRIEF);
    setResult(null);
    setError(null);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <span className="bg-rose-100 p-1.5 rounded-lg text-lg">📝</span> The Brief
              </h2>
              <div className="flex gap-2">
                {!brief && (
                  <button 
                    onClick={useSample}
                    className="text-xs font-bold text-stone-500 hover:text-rose-500 px-3 py-1 bg-stone-50 rounded-full transition-colors border border-transparent hover:border-rose-100"
                  >
                    Try Kion Sample
                  </button>
                )}
                {result && (
                  <button 
                    onClick={startNew}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1 bg-rose-50 rounded-full transition-colors"
                  >
                    Start New +
                  </button>
                )}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Paste the chaotic brand brief here..."
                className="w-full h-[450px] p-5 bg-stone-50/50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all text-stone-700 placeholder:text-stone-300 resize-none text-sm leading-relaxed"
              />
              <button
                type="submit"
                disabled={loading || !brief.trim()}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-[0.98] shadow-lg shadow-rose-200 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? "Analyzing..." : "Create Magic ✨"}
              </button>
            </form>
          </div>

          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">History</h3>
              <div className="space-y-2">
                {history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setResult(item.content)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                      result === item.content ? 'bg-rose-50 border-rose-200' : 'bg-white border-transparent hover:bg-rose-50/50'
                    }`}
                  >
                    <div className="truncate">
                      <div className={`font-bold text-sm ${result === item.content ? 'text-rose-700' : 'text-stone-700'}`}>{item.brand}</div>
                      <div className="text-[10px] text-stone-400">{item.date}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {!result && !loading && !error && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border-2 border-dashed border-rose-100">
              <span className="text-5xl mb-6">👩‍💻</span>
              <h2 className="text-2xl font-bold text-stone-800 mb-3 italic">"Ready to shine, sis?"</h2>
              <p className="text-stone-400 max-w-sm text-sm">
                Paste your brief. I'll make sure it's FDA & FTC safe and write your content for you!
              </p>
              {!brief && (
                <button 
                  onClick={useSample}
                  className="mt-6 text-rose-500 font-bold text-sm hover:underline"
                >
                  Don't have a brief yet? Try the Kion sample.
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-8 rounded-[32px] text-rose-800 flex flex-col items-center gap-4 text-center">
              <p className="font-bold">Deep breaths... something went wrong.</p>
              <button onClick={handleSubmit} className="bg-rose-500 text-white px-6 py-2 rounded-full font-bold">Try Again</button>
            </div>
          )}

          {loading && (
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-rose-100 animate-pulse">
              <div className="h-8 bg-rose-50 rounded w-1/3 mb-10" />
              <div className="space-y-4">
                <div className="h-4 bg-rose-50 rounded w-full" />
                <div className="h-4 bg-rose-50 rounded w-5/6" />
                <div className="h-4 bg-rose-50 rounded w-4/6" />
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-rose-100/50 border border-rose-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-pink-300 to-rose-400" />
              <div className="flex justify-between items-center mb-8">
                <span className="text-rose-500 text-xs font-black uppercase tracking-widest">Strategy Ready ⚡️</span>
                <button onClick={copyToClipboard} className="bg-stone-900 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg">📋 Copy Content</button>
              </div>
              <MarkdownRenderer content={result} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
