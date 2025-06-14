import { useState, useEffect, useRef } from 'react';
import { Terminal, FileText, Home, ChevronRight, ChevronDown, Save, Trash, ArrowUpDown, Edit2, RefreshCw, Search, Settings, Download, Copy, Eye, Code, MessageSquare, X, Maximize, GitBranch, BookOpen } from 'lucide-react';

export default function EnhancedCodeEditorUI() {
  const [code, setCode] = useState(`%------------Projects-----------------

\\section{Projects}
\\resumeSubHeadingListStart
% Advanced Image Segmentation & Computer Vision
\\resumeItemTest{{{\\textbf{Computer Vision and Image Segmentation}}}}\\vspace{-0.7em}

\\resumeItemListStart
  \\setlength{\\itemsep}{0.5pt}
  \\setlength{\\leftmargin}{0pt}
\\resumeItemTest{\\href{https://github.com/vvinayakkk/Image-Segmentation-BioMedical}{\\textcolor{darkblue}{\\textbf{Advanced Medical Image Segmentation}}}} Developed {\\textbf{UNet}-based models for cell nuclei segmentation and implemented \\textbf{EffUNet} {EffUNetV2 encoder + UNet decoder} achieving IOU of \\textbf{0.857 for buildings} and \\textbf{0.912 for roads} using \\textbf{Dice Loss + BCE} optimization.}
\\resumeItemTest{\\href{https://github.com/vvinayakkk/Autonomous-Surveillance}{\\textcolor{darkblue}{\\textbf{Multi-Sensor Surveillance System}}}} Engineered a hybrid vision pipeline using {\\textbf{Swin Transformer} (\\textbf{96.8\\% accuracy}}) and {\\textbf{Mask R-CNN} (\\textbf{mAP@.5=0.91}), integrating {\\textbf{LIDAR}, {\\textbf{thermal cameras}, and {\\textbf{XGBoost anomaly detection} (\\textbf{99.2\\% recall}) with \\textbf{Langchain-powered} incident summarization and {\\textbf{98ms latency}.}
`);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'system', message: 'Welcome to CodeMaster IDE! I\'m your AI assistant. How can I help with your LaTeX resume today?' },
    { sender: 'user', message: 'Can you help me improve the formatting of my projects section?' },
    { sender: 'system', message: 'Analyzing your code... I notice you\'re using \\vspace{-0.7em} after section headers. For more consistent spacing across sections, consider using a macro definition that can be easily adjusted globally. Would you like me to show you how?' }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [currentLine, setCurrentLine] = useState(181);
  const [currentTab, setCurrentTab] = useState('main.tex');
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [progressValue, setProgressValue] = useState(71);
  const [codeView, setCodeView] = useState('code'); // code or chat
  const [isTyping, setIsTyping] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const chatContainerRef = useRef(null);
  const editorRef = useRef(null);

  const files = [
    { name: 'main.tex', icon: <FileText size={16} />, active: true },
    { name: 'education.tex', icon: <FileText size={16} />, active: false },
    { name: 'experience.tex', icon: <FileText size={16} />, active: false },
    { name: 'projects.tex', icon: <FileText size={16} />, active: false },
    { name: 'skills.tex', icon: <FileText size={16} />, active: false }
  ];

  const handleRecompile = () => {
    setIsRecompiling(true);
    setProgressValue(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecompiling(false);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { sender: 'user', message: newMessage }]);
      setNewMessage('');
      setIsTyping(true);
      
      // Simulate AI typing
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [...prev, { 
          sender: 'system', 
          message: `I've analyzed your LaTeX code. To improve your projects section, consider adding more structured formatting with \\item commands and consistent spacing between entries. Would you like me to refactor this section for you?` 
        }]);
      }, 1500);
    }
  };

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Cursor blinking effect
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    
    return () => clearInterval(cursorInterval);
  }, []);

  // Line highlighting animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine(prev => {
        if (prev >= 190) return 181;
        return prev + 1;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Typing animation effect for code
  const [visibleCode, setVisibleCode] = useState('');
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < code.length) {
        setVisibleCode(code.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
    
    return () => clearInterval(typingInterval);
  }, []);

  const handleLineClick = (lineNumber) => {
    setCurrentLine(lineNumber);
    // Add subtle animation to highlight the line
    if (editorRef.current) {
      const lineElement = editorRef.current.querySelector(`.line-${lineNumber}`);
      if (lineElement) {
        lineElement.classList.add('bg-blue-700');
        setTimeout(() => {
          lineElement.classList.remove('bg-blue-700');
        }, 300);
      }
    }
  };

  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      sidebar: 'bg-gray-800',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-gray-700',
      codeArea: 'bg-gray-800 text-gray-100',
      lineNumbers: 'bg-gray-800 text-gray-500',
      activeLineNumber: 'bg-gray-700 text-white',
      selectedTab: 'bg-gray-700',
      hoveredItem: 'hover:bg-gray-700'
    },
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      sidebar: 'bg-white',
      button: 'bg-blue-500 hover:bg-blue-600',
      border: 'border-gray-200',
      codeArea: 'bg-white text-gray-800',
      lineNumbers: 'bg-gray-100 text-gray-500',
      activeLineNumber: 'bg-blue-100 text-blue-800',
      selectedTab: 'bg-white',
      hoveredItem: 'hover:bg-gray-100'
    }
  };

  const theme = themeClasses[selectedTheme];

  return (
    <div className={`flex h-screen ${theme.bg} ${theme.text} font-sans overflow-hidden transition-colors duration-500`}>
      {/* Left Sidebar */}
      {showFileExplorer && (
        <div className={`w-56 ${theme.sidebar} border-r ${theme.border} flex flex-col transition-all duration-500 transform`}>
          {/* Project Header */}
          <div className="p-3 flex justify-between items-center border-b border-opacity-20 border-gray-600">
            <div className="flex items-center">
              <BookOpen size={18} className="mr-2 text-blue-400" />
              <span className="font-medium">Resume Project</span>
            </div>
            <div className="flex items-center">
              <GitBranch size={16} className="text-green-400" />
              <span className="text-xs ml-1">main</span>
            </div>
          </div>
          
          {/* File Explorer */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 text-sm font-medium text-gray-400 flex items-center">
              <ChevronDown size={16} className="mr-1" />
              <span>PROJECT FILES</span>
            </div>
            
            <div className="pl-4">
              {files.map((file, index) => (
                <div 
                  key={file.name} 
                  className={`flex items-center py-1 px-2 rounded my-1 cursor-pointer ${file.name === currentTab ? 'bg-blue-600 bg-opacity-30 text-blue-400' : `${theme.hoveredItem}`} transition-colors duration-300`}
                  onClick={() => setCurrentTab(file.name)}
                >
                  {file.icon}
                  <span className="ml-2 text-sm">{file.name}</span>
                </div>
              ))}
            </div>
            
            {/* Additional Sections */}
            <div className="p-2 text-sm font-medium text-gray-400 flex items-center mt-4">
              <ChevronRight size={16} className="mr-1" />
              <span>RESOURCES</span>
            </div>
            
            <div className="p-2 text-sm font-medium text-gray-400 flex items-center">
              <ChevronRight size={16} className="mr-1" />
              <span>SETTINGS</span>
            </div>
          </div>
          
          {/* User Profile */}
          <div className={`p-3 flex items-center border-t ${theme.border}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              VP
            </div>
            <div className="ml-2">
              <div className="text-sm">Vinayak Prem</div>
              <div className="text-xs text-gray-400">Premium</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className={`${selectedTheme === 'dark' ? 'bg-gray-800' : 'bg-white border-b border-gray-200'} transition-colors duration-500 flex items-center px-4 py-2`}>
          <button 
            className="mr-4 hover:bg-gray-700 hover:bg-opacity-30 p-1 rounded transition-colors duration-300"
            onClick={() => setShowFileExplorer(prev => !prev)}
          >
            <Terminal size={18} />
          </button>
          
          <div className="mr-4 flex items-center">
            <Home size={18} className="mr-2" />
            <span>Home</span>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md px-3 py-1 text-sm mr-6 transform hover:scale-105 transition-transform duration-300">
            Upgrade Pro
          </div>
          
          <div className="mx-2 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            LaTeX Master IDE
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <button className={`${theme.hoveredItem} p-1 rounded-full transition-colors duration-300`}>
              <Search size={18} />
            </button>
            <button 
              className={`${theme.hoveredItem} p-1 rounded-full transition-colors duration-300`}
              onClick={() => setSelectedTheme(selectedTheme === 'dark' ? 'light' : 'dark')}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
        
        {/* Editor Toolbar */}
        <div className={`${selectedTheme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-200'} flex items-center px-2 py-1 transition-colors duration-500`}>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-700 hover:bg-opacity-30 rounded transition-colors duration-300">
              <Save size={16} />
            </button>
            <button className="p-1 hover:bg-gray-700 hover:bg-opacity-30 rounded transition-colors duration-300">
              <Trash size={16} />
            </button>
            <button className="p-1 hover:bg-gray-700 hover:bg-opacity-30 rounded transition-colors duration-300">
              <Copy size={16} />
            </button>
          </div>
          
          <div className="flex mx-2 rounded-md overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm font-medium transition-colors duration-300 ${codeView === 'code' ? 'bg-blue-600 text-white' : 'bg-gray-700 bg-opacity-50 text-gray-300'}`}
              onClick={() => setCodeView('code')}
            >
              <div className="flex items-center">
                <Code size={14} className="mr-1" />
                Code Editor
              </div>
            </button>
            <button 
              className={`px-3 py-1 text-sm font-medium transition-colors duration-300 ${codeView === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-700 bg-opacity-50 text-gray-300'}`}
              onClick={() => setCodeView('chat')}
            >
              <div className="flex items-center">
                <MessageSquare size={14} className="mr-1" />
                AI Assistant
              </div>
            </button>
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            <div className="text-sm font-medium">LaTeX</div>
            <RefreshCw size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        
        {/* File tabs */}
        <div className={`${selectedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} px-2 flex items-center space-x-1 overflow-x-auto transition-colors duration-500`}>
          {files.filter(f => f.active || f.name === currentTab).map(file => (
            <div 
              key={file.name}
              className={`flex items-center px-3 py-2 text-sm rounded-t cursor-pointer ${currentTab === file.name ? 
                (selectedTheme === 'dark' ? 'bg-gray-800 border-t-2 border-blue-500' : 'bg-white border-t-2 border-blue-500 shadow-sm') : 
                'hover:bg-gray-800 hover:bg-opacity-50'} transition-all duration-300`}
              onClick={() => setCurrentTab(file.name)}
            >
              {file.icon}
              <span className="ml-1">{file.name}</span>
              {currentTab === file.name && (
                <button className="ml-2 hover:bg-gray-700 p-1 rounded-full transform hover:rotate-90 transition-all duration-300">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Code Editor */}
          <div className="w-1/2 flex flex-col border-r border-gray-700">
            {codeView === 'code' ? (
              <div className="flex-1 flex" ref={editorRef}>
                {/* Line Numbers */}
                <div className={`${theme.lineNumbers} p-2 text-right w-16 select-none`}>
                  {Array.from({ length: 25 }, (_, i) => i + 177).map(lineNum => (
                    <div 
                      key={lineNum} 
                      className={`line-${lineNum} py-1 pr-2 transition-colors duration-300 ${currentLine === lineNum ? theme.activeLineNumber + ' font-medium' : ''} cursor-pointer`}
                      onClick={() => handleLineClick(lineNum)}
                    >
                      {lineNum}
                    </div>
                  ))}
                </div>
                
                {/* Code Area */}
                <div className={`flex-1 ${theme.codeArea} font-mono relative overflow-auto p-2 transition-colors duration-500`}>
                  <pre className="whitespace-pre-wrap">
                    <code>
                      {code.split('\n').map((line, index) => {
                        // Basic syntax highlighting
                        const highlightedLine = line
                          .replace(/\\([a-zA-Z]+)/g, '<span class="text-purple-400">\\$1</span>')
                          .replace(/\{([^{}]*)\}/g, '{<span class="text-yellow-400">$1</span>}')
                          .replace(/\\textbf/g, '<span class="text-green-400">\\textbf</span>')
                          .replace(/%([^\n]*)/g, '<span class="text-gray-500">%$1</span>');
                        
                        return (
                          <div 
                            key={index} 
                            className={`py-1 ${currentLine === index + 177 ? 'bg-blue-900 bg-opacity-20' : ''} transition-colors duration-300`}
                            dangerouslySetInnerHTML={{ __html: highlightedLine }}
                          />
                        );
                      })}
                      {showCursor && currentLine === 181 && <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse"></span>}
                    </code>
                  </pre>
                  
                  {/* Editing indicator with animation */}
                  <div className="absolute top-2 right-2 flex items-center text-gray-400 bg-gray-800 bg-opacity-70 px-2 py-1 rounded-md">
                    <Edit2 size={14} className="mr-1 animate-pulse" />
                    <span className="text-sm">Editing</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Assistant View */
              <div className="flex-1 flex flex-col bg-gray-900">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div 
                        className={`max-w-xs rounded-2xl px-4 py-2 shadow-lg ${
                          msg.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                        } transform transition-all duration-300 hover:scale-102`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 text-gray-100 rounded-2xl px-4 py-3 shadow-lg border border-gray-700 flex items-center">
                        <span className="mr-2">Thinking</span>
                        <span className="flex space-x-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                  <div className="flex bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                    <input
                      className="flex-1 bg-transparent border-0 px-4 py-3 focus:outline-none text-gray-100"
                      placeholder="Ask about your LaTeX code..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition-colors duration-300 flex items-center"
                      onClick={sendMessage}
                    >
                      <span className="mr-1">Send</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-45">
                        <path d="M1.5 7.5H13.5M13.5 7.5L7.5 1.5M13.5 7.5L7.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <div className="text-xs text-gray-400 flex items-center animate-pulse">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      AI assistant is ready to help
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Panel - CV Renderer */}
          <div className="w-1/2 flex flex-col">
            {/* Compiler Bar */}
            <div className={`flex justify-between items-center ${selectedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} p-3 border-b ${theme.border}`}>
              <div className="flex items-center">
                <button 
                  className={`flex items-center ${isRecompiling ? 'opacity-50 cursor-wait' : 'hover:bg-gray-700 hover:bg-opacity-30'} px-3 py-1 rounded-md transition-all duration-300`}
                  onClick={handleRecompile}
                  disabled={isRecompiling}
                >
                  <RefreshCw size={16} className={`mr-2 ${isRecompiling ? 'animate-spin' : ''}`} />
                  <span className="font-medium">{isRecompiling ? 'Compiling...' : 'Recompile'}</span>
                </button>
                
                {isRecompiling && (
                  <div className="ml-4 w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                      style={{ width: `${progressValue}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-700 hover:bg-opacity-30 rounded transition-colors duration-300">
                  <Download size={16} />
                </button>
                <button className="p-1 hover:bg-gray-700 hover:bg-opacity-30 rounded transition-colors duration-300">
                  <Eye size={16} />
                </button>
                <button className="p-1 hover:bg-gray-700 hover:bg-opacity-30 rounded transition-colors duration-300">
                  <Maximize size={16} />
                </button>
                <div className="text-sm font-medium">{progressValue}%</div>
              </div>
            </div>
            
            {/* CV Content with Animation */}
            <div className="flex-1 overflow-auto bg-white p-6 relative">
              {isRecompiling ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                  <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-lg font-medium text-gray-800">Compiling LaTeX...</div>
                    <div className="text-sm text-gray-500 mt-2">Rendering your changes</div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto shadow-lg rounded-lg overflow-hidden border border-gray-200 animate-fadeIn transition-all duration-500">
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold text-gray-800">Vinayak Prem Bhatia</h1>
                      <div className="flex justify-center flex-wrap space-x-4 text-sm mt-2 text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium mr-1">Email:</span> vinayak.bhatia@tspiit.ac.in
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">Mobile:</span> +91 9936796651
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6 animate-slideInFromRight" style={{ animationDelay: '0.2s' }}>
                      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3 text-gray-800">EDUCATION</h2>
                      <div className="pl-2">
                        <div className="flex justify-between mt-2">
                          <div>
                            <div className="font-bold text-gray-800">SP Jain Institute of Management & Research</div>
                            <div className="italic text-gray-600">Master of Business Administration</div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-700">Mumbai, India</div>
                            <div className="text-gray-500">Aug. 2022 - Present</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6 animate-slideInFromRight" style={{ animationDelay: '0.4s' }}>
                      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3 text-gray-800">RESEARCH EXPERIENCE</h2>
                      <div className="pl-2">
                        <div className="flex justify-between mt-2">
                          <div className="font-bold text-gray-800">Research Intern at IIT Patna</div>
                          <div className="text-right text-gray-700">Patna, India</div>
                        </div>
                        <div className="text-right text-sm italic text-gray-500">Jan. 2023 - July 2023</div>
                        <div className="mt-2">
                          <div className="flex items-baseline">
                            <span className="mr-2 text-blue-600">•</span>
                            <span className="text-gray-700">Advanced Backbone Design for Crop Disease Detection</span>
                          </div>
                          <div className="flex items-baseline ml-4">
                            <span className="mr-2 text-gray-400">◦</span>
                            <span className="text-gray-600">Engineered a hybrid backbone combining CNN, ResNet-50, ResNet-101</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="animate-slideInFromRight" style={{ animationDelay: '0.6s' }}>
                      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3 text-gray-800">PROJECTS</h2>
                      <div className="pl-2">
                        <div>
                          <div className="font-bold text-gray-800">Computer Vision and Image Segmentation</div>
                          <div className="flex items-baseline mt-1">
                            <span className="mr-2 text-blue-600">•</span>
                            <span className="text-gray-700">Advanced Medical Image Segmentation: Developed UNet-based models for cell nuclei segmentation and implemented EffUNet (EffUNetV2 encoder + UNet decoder) achieving IOU of 0.857 for buildings and 0.912 for roads using Dice Loss + BCE optimization.</span>
                          </div>
                          <div className="flex items-baseline mt-2">
                            <span className="mr-2 text-blue-600">•</span>
                            <span className="text-gray-700">Multi-Sensor Surveillance System: Engineered a hybrid vision pipeline using Swin Transformer (96.8% accuracy) and Mask R-CNN (mAP@.5=0.91), integrating LIDAR, thermal cameras, and XGBoost anomaly detection (99.2% recall) with Langchain-powered incident summarization and 98ms latency.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes slideInFromRight {
          0% { transform: translateX(30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideInFromRight {
          animation: slideInFromRight 0.7s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        
        .gradient-background {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        
        .transform:hover {
          transform: scale(1.05);
        }
        
        .typing-cursor::after {
          content: "|";
          animation: cursor 1s infinite;
        }
        
        @keyframes cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .hover:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}