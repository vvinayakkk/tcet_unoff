
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Download, Loader } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Sidebar from '../components/Sidebar';

const API_BASE_URL = 'http://127.0.0.1:8080';

const analysisPhrases = [
  { text: "🔍 Initializing analysis...", duration: 1250 },
  { text: "📊 Processing data...", duration: 1250 },
  { text: "🤖 Applying AI analysis...", duration: 1250 },
  { text: "✨ Finalizing results...", duration: 1250 }
];

const colors = {
  blue: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    hover: '#2563EB',
    muted: '#EFF6FF'
  },
  white: {
    pure: '#FFFFFF',
    primary: '#F3F4F6',
    secondary: '#E5E7EB'
  }
};

const NotionAIApp = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');

  

  const runLoadingSequence = async (phrases) => {
    for (const phrase of phrases) {
      setCurrentPhrase(phrase.text);
      await new Promise(resolve => setTimeout(resolve, phrase.duration));
    }
  };

  const handleDownloadPDF = () => {
    const tempDiv = document.createElement('div');
    const analyticsReport = document.getElementById('analysis-report').cloneNode(true);
    const insightsDiv = document.createElement('div');
    insightsDiv.className = 'mt-8 p-4';
    insightsDiv.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">AI Insights</h2>
      <div class="text-black prose prose-blue">
        ${analysisData.ai_insights}
      </div>
    `;

    tempDiv.appendChild(analyticsReport);
    tempDiv.appendChild(insightsDiv);

    const opt = {
      margin: 1,
      filename: 'task-analysis-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(tempDiv).save();
  };

  const handleGenerateReport = async () => {
    setAnalysisLoading(true);
    try {
      await runLoadingSequence(analysisPhrases);
      setShowAnalysis(true);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a task description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_body: prompt }),
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      console.log('Task processed:', data);
      setPrompt('');
    } catch (err) {
      setError(`Failed to process task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-blue-200
                shadow-lg"
            >
              <h1 className="text-5xl font-bold text-blue-600 mb-4">
                Notion Integration
              </h1>
              <p className="text-blue-500/80 text-xl">
                Seamlessly manage and analyze your tasks with AI-powered insights
              </p>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 backdrop-blur-xl rounded-xl p-4 border border-red-500/20
                    flex items-center gap-3 text-red-400"
                >
                  <Terminal size={20} />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Task Input Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-blue-200
                shadow-lg hover:border-blue-300 transition-colors group"
            >
              <div className="space-y-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full min-h-[120px] bg-blue-50 rounded-xl p-6 text-blue-900
                    placeholder-blue-400 border-2 border-blue-200 focus:border-blue-400
                    focus:outline-none transition-colors resize-none"
                  placeholder="Describe your task here..."
                />
                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600
                      text-white font-bold rounded-xl shadow-lg hover:shadow-blue-400/20
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Schedule Task'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Analysis Section */}
            <div className="space-y-6">
              {!showAnalysis ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateReport}
                  disabled={analysisLoading}
                  className="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-8 border
                    border-blue-200 text-blue-600 hover:border-blue-300
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg hover:shadow-blue-400/20"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Loader className={`w-5 h-5 ${analysisLoading ? 'animate-spin' : ''}`} />
                    Generate Analysis Report
                  </div>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border
                    border-blue-200 shadow-lg"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-600">Analysis Report</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50
                        hover:bg-blue-100 text-blue-600 rounded-xl border
                        border-blue-200 hover:border-blue-300 transition-all"
                    >
                      <Download size={20} />
                      Download Report
                    </motion.button>
                  </div>
                  <div id="analysis-report" className="bg-blue-50 rounded-xl p-6 border
                    border-blue-200">
                    <AdvancedAnalytics data={analysisData} />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {(loading || analysisLoading) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center
                  justify-center"
              >
                <div className="text-center space-y-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl"
                  >
                    ✨
                  </motion.div>
                  <motion.p
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-blue-600 text-2xl font-bold"
                  >
                    {currentPhrase}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotionAIApp;

