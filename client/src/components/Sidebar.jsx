
import React from 'react';
import { MessageSquare, Mic, Settings, User, BarChart2, Globe, Zap, Layers } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-indigo-600 text-white flex flex-col">
      <div className="p-4 border-b border-indigo-800">
        <h2 className="text-xl font-bold flex items-center">
          <Layers className="mr-2" /> 
          CommunicateAI
        </h2>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <div className="text-indigo-300 text-xs uppercase tracking-wider mb-3">Main</div>
          <ul className="space-y-2">
            <li className="bg-indigo-800 rounded-lg">
              <a href="/dashboard" className="flex items-center p-3 text-white">
                <BarChart2 className="h-5 w-5 mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a href="/communication" className="flex items-center p-3 text-indigo-100 hover:bg-indigo-800 rounded-lg">
                <MessageSquare className="h-5 w-5 mr-3" />
                Communications
              </a>
            </li>
            <li>
              <a href="/voice" className="flex items-center p-3 text-indigo-100 hover:bg-indigo-800 rounded-lg">
                <Mic className="h-5 w-5 mr-3" />
                Voice Input
              </a>
            </li>
            <li>
              <a href="/companian" className="flex items-center p-3 text-indigo-100 hover:bg-indigo-800 rounded-lg">
                <Globe className="h-5 w-5 mr-3" />
                User Companian
              </a>
            </li>
          </ul>
        </div>
        
        <div className="mb-6">
          <div className="text-indigo-300 text-xs uppercase tracking-wider mb-3">Management</div>
          <ul className="space-y-2">
            <li>
              <a href="/learning" className="flex items-center p-3 text-indigo-100 hover:bg-indigo-800 rounded-lg">
                <Zap className="h-5 w-5 mr-3" />
                Agent Learning
              </a>
            </li>
            <li>
              <a href="/preference" className="flex items-center p-3 text-indigo-100 hover:bg-indigo-800 rounded-lg">
                <User className="h-5 w-5 mr-3" />
                User Preferences
              </a>
            </li>
            <li>
              <a href="/settings" className="flex items-center p-3 text-indigo-100 hover:bg-indigo-800 rounded-lg">
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-indigo-800">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-white font-medium mr-3">
            VB
          </div>
          <div>
            <div className="font-medium">Vinayak Bhatia</div>
            <div className="text-xs text-indigo-300">Free Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


