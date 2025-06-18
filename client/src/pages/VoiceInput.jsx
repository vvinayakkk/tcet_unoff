
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, Check, ArrowRight, Languages, Volume2, MessageSquare, Settings, User, BarChart2, Globe, Zap, Layers, Pencil, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const LANGUAGES = {
  "English": "en",
  "Hindi": "hi",
  "Bengali": "bn",
  "Tamil": "ta",
  "Telugu": "te",
  "Marathi": "mr",
  "Gujarati": "gu",
  "Kannada": "kn",
  "Malayalam": "ml",
  "Punjabi": "pa",
  "Urdu": "ur",
  "Assamese": "as",
  "Bodo": "brx",
  "Dogri": "doi",
  "Kashmiri": "ks",
  "Konkani": "gom",
  "Maithili": "mai",
  "Manipuri": "mni",
  "Nepali": "ne",
  "Odia": "or",
  "Sanskrit": "sa",
  "Santali": "sat",
  "Sindhi": "sd",
};

const TaskDetailsView = ({ isOpen, onClose, approvedTask }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Task Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-green-600 font-medium">Task Approved</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Task Description</h3>
            <p className="text-gray-600">{approvedTask.task_description}</p>
          </div>

          {approvedTask.extracted_details && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Extracted Details</h3>
              {Object.entries(approvedTask.extracted_details).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="font-medium">{key}:</span>
                  <span className="text-gray-600">
                    {Array.isArray(value) ? value.join(', ') : value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {approvedTask.required_actions && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Required Actions</h3>
              <ul className="list-disc list-inside text-gray-600">
                {approvedTask.required_actions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TaskCard = ({ task, index, onAccept, onReject, isProcessing }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.2 }}
    className="bg-white p-4 rounded-lg shadow-sm border mb-4"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-100 p-2 rounded-lg">
          {task.agent === "Calendar Agent" ? (
            <Clock className="h-5 w-5 text-indigo-600" />
          ) : (
            <MessageSquare className="h-5 w-5 text-indigo-600" />
          )}
        </div>
        <h3 className="font-medium">{task.agent}</h3>
      </div>
      <span className={`px-2 py-1 rounded text-sm ${
        task.priority === 'high' ? 'bg-red-100 text-red-700' : 
        'bg-yellow-100 text-yellow-700'
      }`}>
        {task.priority}
      </span>
    </div>

    <p className="text-gray-600 mb-3">{task.task_description}</p>

    {task.extracted_details && (
      <div className="mb-3">
        {Object.entries(task.extracted_details).map(([key, value]) => (
          <div key={key} className="text-sm text-gray-500">
            {key}: {Array.isArray(value) ? value.join(', ') : value}
          </div>
        ))}
      </div>
    )}

    <div className="flex justify-end gap-2">
      <button 
        onClick={onReject}
        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transform transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <X className="h-5 w-5" />
      </button>
      <button 
        onClick={onAccept}
        disabled={isProcessing}
        className={`p-2 ${
          isProcessing 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-green-100 text-green-600 hover:bg-green-200'
        } rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-md`}
      >
        {isProcessing ? (
          <Clock className="h-5 w-5 animate-spin" />
        ) : (
          <Check className="h-5 w-5" />
        )}
      </button>
    </div>
  </motion.div>
);

const getEndpointFromAgent = (agentName) => {
  // Extract the first word from agent name and convert to lowercase
  const firstWord = agentName.split(' ')[0].toLowerCase();
  
  // Map of agent types to endpoints
  const endpointMap = {
    'calendar': '/process_calendar_task',
    'gmail': '/process_gmail_task',
    'docs': '/process_docs_task',
    'drive': '/process_drive_task',
    'sheets': '/process_sheets_task',
    'youtube': '/process_youtube_task'
  };

  // Return the matching endpoint or default to generic task
  return endpointMap[firstWord] || '/process_task';
};

const VoiceInputPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [inputText, setInputText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const durationIntervalRef = useRef(null);
  const [error, setError] = useState(null);
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [taskProcessing, setTaskProcessing] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [settings, setSettings] = useState({
    autoPunctuation: true,
    noiseReduction: true,
    realTimeTranscription: true,
  });

  const toggleSetting = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };


  const handleRejectTask = (task) => {
    // Remove the task from the list
    setTasks((prevTasks) => prevTasks.filter(t => t.task_description !== task.task_description));
  };

  const handleTaskProcessing = async (task) => {
    try {
      const endpoint = getEndpointFromAgent(task.agent);
      const response = await axios.post(`http://localhost:5002${endpoint}`, {
        task
      });

      if (response.data.success) {
        console.log('Task processed successfully:', response.data);
      }
    } catch (error) {
      console.error('Error processing task:', error);
      throw error;
    }
  };

  const handleGeminiCall = async (transcriptText) => {
    if (!transcriptText) return;

    try {
      const response = await axios.post('http://localhost:5002/analyze_transcript', {
        transcript: transcriptText,
      });

      if (response.data) {
        setGeminiResponse(response.data);
        setTasks(response.data.tasks.items); // Set tasks from Gemini response
      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setError(error.response?.data?.error || 'Failed to analyze transcript');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(durationIntervalRef.current);
      setRecordingDuration(0);
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const fileName = `recording_${timestamp}.webm`;

      const audioFile = new File([audioBlob], fileName, {
        type: 'audio/webm',
        lastModified: timestamp,
      });

      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('https://renewing-bat-readily.ngrok-free.app/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio');
      }

      if (data.transcription) {
        setDetectedLanguage(data.detected_language);
        setInputText(data.transcription);
        // Call Gemini with the transcription
        await handleGeminiCall(data.transcription);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setError(error.message || 'Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    try {
      const response = await axios.post(`https://b514-2402-3a80-1650-cc11-954a-b6f6-b161-17a3.ngrok-free.app/api/translate`, {
        source_language: LANGUAGES[detectedLanguage], // Use detected language code
        target_language: LANGUAGES[selectedLanguage], // Use selected language code
        text: inputText,
      });

      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error('Error translating:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 bg-gray-50 overflow-y-auto h-screen">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold">Voice Input</h1>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-indigo-100">
                      <Mic className={`h-12 w-12 ${isRecording ? 'text-red-500' : 'text-indigo-600'}`} />
                    </div>
                    {isRecording && (
                      <div className="mt-4">
                        <div className="text-2xl font-bold text-gray-700">
                          {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="flex justify-center gap-2 mt-2">
                          <div className="h-6 w-1 bg-indigo-600 animate-pulse"></div>
                          <div className="h-6 w-1 bg-indigo-600 animate-pulse delay-75"></div>
                          <div className="h-6 w-1 bg-indigo-600 animate-pulse delay-150"></div>
                          <div className="h-6 w-1 bg-indigo-600 animate-pulse delay-200"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      className={`p-4 rounded-full transform transition-all duration-200 hover:scale-110 ${
                        isRecording 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                      }`}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                    >
                      {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </button>

                    {isRecording && (
                      <button
                        className="p-4 rounded-full bg-gray-100 text-gray-600 transform transition-all duration-200 hover:scale-110 hover:bg-gray-200 hover:shadow-md"
                        onClick={stopRecording}
                      >
                        <RotateCcw className="h-6 w-6" />
                      </button>
                    )}
                  </div>

                  <div className="mt-6">
                    <textarea
                      value={
                        `${inputText}` +
                        (translatedText ? `\n\nTranslated - ${selectedLanguage}:\n${translatedText}` : '')
                      }
                      onChange={(e) => setInputText(e.target.value)}
                      className={`w-full p-4 border rounded-lg ${translatedText ? 'min-h-[200px]' : 'min-h-[100px]'} transition-all duration-300 text-gray-700`}
                      placeholder="Your speech will appear here after recording..."
                      readOnly={isProcessing}
                      style={{ 
                        fontStyle: translatedText ? 'italic' : 'normal', 
                        color: translatedText ? '#4F46E5' : '#374151',
                        height: translatedText ? '250px' : '100px'
                      }}
                    />
                    {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>{error}</span>
                    </div>}

                    {isProcessing && (
                      <div className="mt-4 text-center text-gray-600">
                        Processing your audio...
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-center gap-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-4 py-2 border rounded-lg bg-white hover:border-indigo-500 transition-colors duration-200"
                    >
                      {Object.keys(LANGUAGES).map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleTranslate}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-md"
                    >
                      <Globe className="h-5 w-5" />
                      Translate
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transform transition-all duration-200 hover:scale-110 hover:shadow-md">
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      <span>English (US)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5" />
                      <span>Clear Audio</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Recent Recordings</h2>
                </div>
                <div className="divide-y">
                  {[
                    {
                      id: 1,
                      duration: "2:15",
                      text: "Schedule a follow-up meeting with the design team to review the latest mockups and gather feedback on the new features we discussed yesterday.",
                      confidence: 98,
                      date: "Just now",
                    },
                    {
                      id: 2,
                      duration: "1:30",
                      text: "Send the updated project timeline to stakeholders and highlight the key milestones we need to achieve by the end of this quarter.",
                      confidence: 95,
                      date: "2 hours ago",
                    },
                  ].map((recording) => (
                    <div key={recording.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
                          <Mic className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="text-sm text-gray-500">
                              {recording.date} • {recording.duration}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-green-600">
                                {recording.confidence}% accurate
                              </span>
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <p className="mt-2 text-gray-700">{recording.text}</p>
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg text-sm">
                              Edit Text
                            </button>
                            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h2 className="font-medium mb-4">Quick Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between mb-2 cursor-pointer">
                      <span className="text-sm text-gray-600">Auto-Punctuation</span>
                      <div
                        className={`w-12 h-6 ${settings.autoPunctuation ? 'bg-green-100' : 'bg-gray-200'} rounded-full p-1 flex items-center`}
                        onClick={() => toggleSetting('autoPunctuation')}
                      >
                        <div className={`w-4 h-4 ${settings.autoPunctuation ? 'bg-green-600 ml-auto' : 'bg-gray-400'} rounded-full transition-all`}></div>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center justify-between mb-2 cursor-pointer">
                      <span className="text-sm text-gray-600">Background Noise Reduction</span>
                      <div
                        className={`w-12 h-6 ${settings.noiseReduction ? 'bg-green-100' : 'bg-gray-200'} rounded-full p-1 flex items-center`}
                        onClick={() => toggleSetting('noiseReduction')}
                      >
                        <div className={`w-4 h-4 ${settings.noiseReduction ? 'bg-green-600 ml-auto' : 'bg-gray-400'} rounded-full transition-all`}></div>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center justify-between mb-2 cursor-pointer">
                      <span className="text-sm text-gray-600">Real-time Transcription</span>
                      <div
                        className={`w-12 h-6 ${settings.realTimeTranscription ? 'bg-green-100' : 'bg-gray-200'} rounded-full p-1 flex items-center`}
                        onClick={() => toggleSetting('realTimeTranscription')}
                      >
                        <div className={`w-4 h-4 ${settings.realTimeTranscription ? 'bg-green-600 ml-auto' : 'bg-gray-400'} rounded-full transition-all`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {geminiResponse && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <h2 className="font-medium mb-4">Task Analysis</h2>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-sm text-gray-600">
                      <p>Detected Language: {geminiResponse.transcript_info.detected_language}</p>
                      <p className="mt-1">Original: {geminiResponse.transcript_info.original_text}</p>
                      <p className="mt-1">English: {geminiResponse.transcript_info.english_translation}</p>
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <TaskCard 
                        key={index} 
                        task={task} 
                        index={index}
                        onAccept={() => handleTaskProcessing(task)}
                        onReject={() => handleRejectTask(task)}
                        isProcessing={taskProcessing}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showDetailsView && selectedTask && (
          <TaskDetailsView
            isOpen={showDetailsView}
            onClose={() => setShowDetailsView(false)}
            approvedTask={selectedTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInputPage;



