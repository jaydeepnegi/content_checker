/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion,
  Loader2,
  FileText,
  ExternalLink,
  History,
  Trash2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, AnalysisSchema, Verdict, RiskLevel } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [articleText, setArticleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{text: string, result: AnalysisResult, date: string}[]>([]);

  const analyzeArticle = async () => {
    if (!articleText.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a professional fact-checking AI used in a newsroom. Analyze the following news article for credibility and authenticity.
        
        The article may be in English, Hindi, or any other language. Please analyze the content accurately regardless of the language.
        Provide the final analysis (explanation, tone, etc.) in English for the structured report.
        
        Article Content:
        ${articleText}
        
        Tasks:
        - Classify the article: Real, Misleading, Fake, or Unverified
        - Highlight specific sentences or phrases that raise suspicion
        - Identify tone (neutral, biased, sensational)
        - Check if claims appear verifiable or vague
        - Detect missing sources or weak evidence`,
        config: {
          responseMimeType: "application/json",
          responseSchema: AnalysisSchema,
        },
      });

      const analysis = JSON.parse(response.text) as AnalysisResult;
      setResult(analysis);
      setHistory(prev => [{ text: articleText.slice(0, 100) + '...', result: analysis, date: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze the article. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictIcon = (verdict: Verdict) => {
    switch (verdict) {
      case Verdict.REAL: return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case Verdict.FAKE: return <XCircle className="w-6 h-6 text-rose-500" />;
      case Verdict.MISLEADING: return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case Verdict.UNVERIFIED: return <HelpCircle className="w-6 h-6 text-slate-500" />;
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    const colors = {
      [RiskLevel.LOW]: "bg-emerald-100 text-emerald-700 border-emerald-200",
      [RiskLevel.MEDIUM]: "bg-amber-100 text-amber-700 border-amber-200",
      [RiskLevel.HIGH]: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[level]}`}>
        {level} Risk
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 italic serif">CopyChecker</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">EN</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">HI</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Global</span>
          </div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Fact-Check Engine v1.1</span>
          <div className="h-4 w-px bg-slate-200" />
          <button 
            onClick={() => {setArticleText(''); setResult(null);}}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            NEW ANALYSIS
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Article Content</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{articleText.length} characters</span>
            </div>
            <textarea
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste the news article text here for analysis..."
              className="w-full h-[400px] p-6 text-slate-700 leading-relaxed focus:outline-none resize-none placeholder:text-slate-300"
            />
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={analyzeArticle}
                disabled={isAnalyzing || !articleText.trim()}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all
                  ${isAnalyzing || !articleText.trim() 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Run Fact-Check
                  </>
                )}
              </button>
            </div>
          </section>

          {/* History / Quick Tips */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Checks</h3>
              </div>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No recent activity</p>
                ) : (
                  history.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-600 truncate w-40">{item.text}</span>
                        <span className="text-[10px] text-slate-400">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${
                          item.result.verdict === Verdict.REAL ? 'text-emerald-500' : 
                          item.result.verdict === Verdict.FAKE ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          {item.result.verdict}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Fact-Check Tips</h3>
              </div>
              <ul className="text-xs text-blue-700/80 space-y-2 list-disc list-inside">
                <li>Check the source URL for legitimacy</li>
                <li>Look for multiple independent reports</li>
                <li>Be wary of highly emotional language</li>
                <li>Verify quotes from primary sources</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[500px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <ShieldCheck className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Scanning Article</h3>
                  <p className="text-sm text-slate-500 max-w-[250px]">Cross-referencing claims and analyzing linguistic patterns...</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Verdict Card */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getVerdictIcon(result.verdict)}
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
                          {result.verdict}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Final Verdict</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-mono font-bold text-slate-900">{result.confidenceScore}%</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidence</div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Risk Level</span>
                        {getRiskBadge(result.riskLevel)}
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tone</span>
                        <span className="text-sm font-semibold text-slate-700 capitalize">{result.toneAnalysis}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analysis Summary</h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                        {result.explanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verifiability</h4>
                      <p className="text-sm text-slate-600 italic">
                        "{result.verifiability}"
                      </p>
                    </div>
                  </div>
                </section>

                {/* Details Card */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Suspicious Statements
                    </h4>
                    <div className="space-y-2">
                      {result.suspiciousStatements.map((s, i) => (
                        <div key={i} className="text-xs text-slate-600 p-3 rounded-lg border-l-2 border-amber-400 bg-amber-50/30">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      <ShieldQuestion className="w-3.5 h-3.5 text-slate-400" />
                      Missing Information
                    </h4>
                    <ul className="space-y-2">
                      {result.missingInformation.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                          <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[500px]">
                <div className="bg-slate-50 p-4 rounded-full">
                  <ShieldQuestion className="w-12 h-12 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-400">Awaiting Analysis</h3>
                  <p className="text-sm text-slate-400 max-w-[250px]">Paste an article on the left to begin the fact-checking process.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto p-6 mt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
        <div>© 2026 CopyChecker Fact-Checking Systems</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-900 transition-colors">Methodology</a>
          <a href="#" className="hover:text-slate-900 transition-colors">API Documentation</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
