
import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Download, Star, MoreVertical, Clock, Check, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const CommunicationsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace with actual user ID
  const userId = import.meta.env.VITE_USER_ID;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tasks?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = selectedFilter === 'all'
    ? tasks
    : tasks.filter(task => task.status.toLowerCase().replace('_', ' ') === selectedFilter);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Communications</h1>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              New Communication
            </button>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search communications..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button className="p-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-500" />
              <span>Filters</span>
            </button>
            
            <button className="p-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Download className="h-5 w-5 text-gray-500" />
              <span>Export</span>
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="border-b px-4 py-3">
              <div className="flex gap-4">
                {['all', 'awaiting confirmation', 'in progress', 'completed'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedFilter === filter
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-4 text-gray-500 text-center">Loading...</div>
            ) : error ? (
              <div className="p-4 text-red-500 text-center">{error}</div>
            ) : (
              <div className="divide-y">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <button className="mt-1">
                        <Star
                          className={`h-5 w-5 ${
                            task.priority === 'High' ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{task.subject}</h3>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-2 flex gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(task.created_at).toLocaleString()}</span>
                          </div>
                          
                          <div className={`flex items-center gap-1 ${
                            task.status === 'awaiting_confirmation' ? 'text-orange-600' :
                            task.status === 'in_progress' ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {task.status === 'awaiting_confirmation' ? <X className="h-4 w-4" /> :
                            task.status === 'in_progress' ? <Clock className="h-4 w-4" /> :
                            <Check className="h-4 w-4" />}
                            <span>{task.status.replace('_', ' ')}</span>
                          </div>
                          
                          <div className="text-gray-500">Priority: {task.priority}</div>
                          <div className="text-gray-500">{task.context_tags.join(', ')}</div>
                        </div>

                        <div className="mt-2 flex gap-2">
                          {task.recipients.map((recipient, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                            >
                              {recipient}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsPage;


