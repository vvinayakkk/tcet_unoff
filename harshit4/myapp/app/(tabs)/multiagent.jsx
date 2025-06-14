import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MultiAgentHub = () => {
  const [userInput, setUserInput] = useState(
    "I need to create a meeting agenda, share it with the team via email, check for any calendar conflicts next week, and pull the latest sales data from our dashboard."
  );

  // Simulated extracted tasks from user input
  const tasks = [
    {
      id: 1,
      description: "Create meeting agenda document",
      agent: "Google Docs",
      status: "completed",
      result: "Created 'Team Meeting Agenda - Q1 Review.docx'",
      agentIcon: "📄"
    },
    {
      id: 2,
      description: "Send email with agenda to team",
      agent: "Gmail",
      status: "awaiting_confirmation",
      recipients: ["sarah@company.com", "john@company.com", "+3 more"],
      subject: "Team Meeting Agenda - Please Review",
      agentIcon: "📧"
    },
    {
      id: 3,
      description: "Check calendar for conflicts next week",
      agent: "Google Calendar",
      status: "in_progress",
      agentIcon: "📅"
    },
    {
      id: 4,
      description: "Pull latest sales data from dashboard",
      agent: "Analytics",
      status: "completed",
      result: "Downloaded 'Q1_Sales_Report.csv' (245KB)",
      agentIcon: "📊"
    },
    {
      id: 5,
      description: "Check for team responses on WhatsApp",
      agent: "WhatsApp",
      status: "pending",
      agentIcon: "💬"
    }
  ];

  const suggestions = [
    "Add sales report to meeting agenda",
    "Schedule follow-up meeting for next Wednesday",
    "Notify marketing team via Slack",
    "Create action items spreadsheet",
    "Set reminders for team members"
  ];

  const StatusBadge = ({ status }) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'in_progress':
          return {
            containerStyle: styles.statusBadgeBlue,
            textStyle: styles.statusTextBlue,
            icon: (
              <Animated.View style={[styles.spinner, styles.spinnerBlue]} />
            ),
            label: 'Processing'
          };
        case 'completed':
          return {
            containerStyle: styles.statusBadgeGreen,
            textStyle: styles.statusTextGreen,
            icon: null,
            label: 'Completed'
          };
        case 'awaiting_confirmation':
          return {
            containerStyle: styles.statusBadgeYellow,
            textStyle: styles.statusTextYellow,
            icon: null,
            label: 'Awaiting Confirmation'
          };
        case 'pending':
          return {
            containerStyle: styles.statusBadgeGray,
            textStyle: styles.statusTextGray,
            icon: null,
            label: 'Pending'
          };
        default:
          return null;
      }
    };

    const config = getStatusConfig();
    if (!config) return null;

    return (
      <View style={[styles.statusBadge, config.containerStyle]}>
        {config.icon}
        <Text style={[styles.statusText, config.textStyle]}>{config.label}</Text>
      </View>
    );
  };

  const renderTaskItem = ({ item: task }) => (
    <View key={task.id} style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskIcon}>{task.agentIcon}</Text>
          <View style={styles.taskDetails}>
            <View style={styles.taskTitleRow}>
              <Text style={styles.taskTitle}>{task.description}</Text>
              <View style={styles.agentBadge}>
                <Text style={styles.agentText}>{task.agent}</Text>
              </View>
            </View>

            {task.status === 'completed' && task.result && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>{task.result}</Text>
              </View>
            )}

            {task.status === 'awaiting_confirmation' && (
              <View style={styles.confirmationContainer}>
                <Text style={styles.recipientsText}>
                  To: {task.recipients.join(', ')}
                </Text>
                <Text style={styles.subjectText}>
                  Subject: {task.subject}
                </Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity style={styles.approveButton}>
                    <Text style={styles.approveButtonText}>
                      Approve & Send
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit First</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
        <StatusBadge status={task.status} />
      </View>
    </View>
  );

  const renderSuggestionItem = ({ item: suggestion }) => (
    <TouchableOpacity key={suggestion} style={styles.suggestionButton}>
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
            {/* Title */}
            <Text style={styles.headerTitle}>Multi-Agent Hub</Text>

            {/* Buttons Container */}
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.settingsButton}>
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.newRequestButton}>
                <Text style={styles.newRequestButtonText}>New Request</Text>
              </TouchableOpacity>
            </View>
          </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                multiline
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Enter your request..."
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity style={styles.processButton}>
                <Text style={styles.processButtonText}>Process</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.taskHubHeader}>
              <Text style={styles.taskHubTitle}>Task Execution Hub</Text>
              <Text style={styles.taskCount}>{tasks.length} tasks identified</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>Suggested Next Actions</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestionsContent}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index} // Use index as key
                    style={styles.suggestionButton}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Space between title and buttons
    alignItems: 'center', // Center items vertically
    paddingHorizontal: 16, // Add horizontal padding
    paddingVertical: 12, // Add vertical padding
    backgroundColor: '#ffffff', // Set background color
    borderBottomWidth: 1, // Add a border at the bottom
    borderBottomColor: '#e0e0e0', // Border color
  },
  headerTitle: {
    fontSize: 20, // Increase font size
    fontWeight: 'bold', // Make the title bold
    color: '#333333', // Set text color
  },
  headerButtons: {
    flexDirection: 'row', // Align buttons horizontally
    gap: 8, // Add space between buttons
  },
  settingsButton: {
    paddingHorizontal: 12, // Add horizontal padding
    paddingVertical: 8, // Add vertical padding
    backgroundColor: '#f0f0f0', // Set background color
    borderRadius: 8, // Add rounded corners
  },
  settingsButtonText: {
    fontSize: 14, // Set font size
    color: '#333333', // Set text color
  },
  newRequestButton: {
    paddingHorizontal: 12, // Add horizontal padding
    paddingVertical: 8, // Add vertical padding
    backgroundColor: '#4F46E5', // Set background color
    borderRadius: 8, // Add rounded corners
  },
  newRequestButtonText: {
    fontSize: 14, // Set font size
    color: '#ffffff', // Set text color
    fontWeight: '500', // Make text semi-bold
  },
  inputContainer: {
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#1F2937',
  },
  processButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  taskHubHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  taskHubTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  taskIcon: {
    fontSize: 20,
    marginTop: 4,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  agentBadge: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  agentText: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultContainer: {
    marginTop: 8,
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultText: {
    fontSize: 14,
    color: '#065F46',
  },
  confirmationContainer: {
    marginTop: 8,
    backgroundColor: '#FEFCE8',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  recipientsText: {
    fontSize: 14,
    color: '#854D0E',
  },
  subjectText: {
    fontSize: 14,
    color: '#854D0E',
    marginBottom: 8,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
  },
  statusBadgeBlue: {
    backgroundColor: '#EFF6FF',
  },
  statusTextBlue: {
    color: '#1D4ED8',
  },
  statusBadgeGreen: {
    backgroundColor: '#F0FDF4',
  },
  statusTextGreen: {
    color: '#16A34A',
  },
  statusBadgeYellow: {
    backgroundColor: '#FEFCE8',
  },
  statusTextYellow: {
    color: '#CA8A04',
  },
  statusBadgeGray: {
    backgroundColor: '#F3F4F6',
  },
  statusTextGray: {
    color: '#374151',
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderTopColor: '#1D4ED8',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  suggestionsHeader: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  suggestionsContent: {
    padding: 16,
    flexDirection: 'row',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  suggestionText: {
    color: '#4F46E5',
    fontSize: 14,
  },
});

export default MultiAgentHub;