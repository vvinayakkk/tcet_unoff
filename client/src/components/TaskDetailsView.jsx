
import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, FileText, Mail, Calendar, BarChart2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskDetailsView = ({ isOpen, onClose, approvedTask }) => {
  const [expandedTask, setExpandedTask] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'Calendar Agent':
        return <Calendar className="h-5 w-5 text-indigo-600" />;
      case 'Gmail Agent':
        return <Mail className="h-5 w-5 text-indigo-600" />;
      default:
        return <FileText className="h-5 w-5 text-indigo-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border p-6 max-w-2xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Task Details</h2>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
          {approvedTask.required_actions?.length || 0} Actions Required
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden mb-4">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              {getAgentIcon(approvedTask.agent)}
            </div>
            <div>
              <h3 className="font-medium">{approvedTask.agent}</h3>
              <span className="text-sm text-gray-500">Priority: {approvedTask.priority}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Task Description</h4>
              <p className="mt-1">{approvedTask.task_description}</p>
            </div>

            {approvedTask.extracted_details && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Extracted Details</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {Object.entries(approvedTask.extracted_details).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium capitalize">{key}:</span>
                      <span className="text-sm">{Array.isArray(value) ? value.join(', ') : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {approvedTask.required_actions && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Required Actions</h4>
                <ul className="space-y-2">
                  {approvedTask.required_actions.map((action, index) => (
                    <li key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {approvedTask.dependencies && approvedTask.dependencies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Dependencies</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <ul className="space-y-1">
                    {approvedTask.dependencies.map((dep, index) => (
                      <li key={index} className="text-sm">• {dep}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskDetailsView;


