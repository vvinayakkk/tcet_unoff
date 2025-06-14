import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const IconButton = ({ name, size = 20, color = "#666" }) => (
  <TouchableOpacity style={styles.iconButton}>
    <Icon name={name} size={size} color={color} />
  </TouchableOpacity>
);

// Constants for consistent styling
const { width } = Dimensions.get('window');
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  const numValue = Number(value);
  if (isNaN(numValue)) return '0';
  return Number.isInteger(numValue) ? numValue.toString() : numValue.toFixed(4);
};

const StatCard = ({ title, value, change, changeColor }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statChange, { color: changeColor }]}>{change}</Text>
  </View>
);

const CommunicationItem = ({ comm }) => (
  <View style={styles.commItem}>
    <View style={styles.commHeader}>
      <View style={styles.commTypeContainer}>
        <View style={[
          styles.badge,
          { backgroundColor: comm.type === 'voice-to-text' ? '#EBF5FF' : '#F3E8FF' }
        ]}>
          <Text style={[
            styles.badgeText,
            { color: comm.type === 'voice-to-text' ? '#1D4ED8' : '#7E22CE' }
          ]}>
            {comm.type === 'voice-to-text' ? 'Voice Refined' : 'Translated'}
          </Text>
        </View>
        <Text style={styles.timestamp}>{comm.timestamp}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <IconButton name="pencil" />
        <IconButton name="message-text" />
      </View>
    </View>

    <View style={styles.messageContainer}>
      <Text style={styles.originalText}>"{comm.original}"</Text>
      <Text style={styles.refinedText}>"{comm.refined}"</Text>
    </View>

    <View style={styles.commFooter}>
      {comm.type === 'voice-to-text' ? (
        <Text style={styles.footerText}>{comm.improvements} improvements applied</Text>
      ) : (
        <Text style={styles.footerText}>{comm.sourceLanguage} → {comm.targetLanguage}</Text>
      )}
      <Text style={styles.footerText}>AI confidence: {formatNumber(comm.confidence)}%</Text>
    </View>
  </View>
);

const SmartSuggestion = ({ suggestion, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.suggestion, active && styles.activeSuggestion]} 
    onPress={onPress}
  >
    <View style={styles.suggestionHeader}>
      <Text style={styles.suggestionText}>{suggestion.text}</Text>
      <View style={[styles.chevronContainer, active && styles.activeChevron]}>
        <Icon 
          name="chevron-right" 
          size={16} 
          color={active ? '#4338CA' : '#666'} 
        />
      </View>
    </View>

    {active && (
      <View style={styles.suggestionActions}>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Suggestion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit First</Text>
        </TouchableOpacity>
      </View>
    )}
  </TouchableOpacity>
);

const LanguageBar = ({ language, percentage }) => (
  <View style={styles.languageBar}>
    <View style={styles.languageHeader}>
      <Text style={styles.languageText}>{language}</Text>
      <Text style={styles.percentageText}>{formatNumber(percentage)}%</Text>
    </View>
    <View style={styles.progressContainer}>
      <View 
        style={[styles.progressBar, { width: `${percentage}%` }]} 
      />
    </View>
  </View>
);

const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [recentCommunications, setRecentCommunications] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [contextSuggestions, setContextSuggestions] = useState([]);
  const [recentLanguages, setRecentLanguages] = useState([]);
  const [offlineStatus, setOfflineStatus] = useState({});
  const [learningProgress, setLearningProgress] = useState({});

  const API_URL ='http://192.168.202.60:6001';

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await axios.get(`${API_URL}/api/dashboard/stats`);
      setPerformanceMetrics(statsResponse.data);

      const commsResponse = await axios.get(`${API_URL}/api/dashboard/recent-communications`);
      setRecentCommunications(Array.isArray(commsResponse.data) ? commsResponse.data : []);

      const suggestionsResponse = await axios.get(`${API_URL}/api/dashboard/context-suggestions`);
      setContextSuggestions(Array.isArray(suggestionsResponse.data) ? suggestionsResponse.data : []);

      const languagesResponse = await axios.get(`${API_URL}/api/dashboard/language-distribution`);
      setRecentLanguages(Array.isArray(languagesResponse.data.languages) ? languagesResponse.data.languages : []);

      const offlineResponse = await axios.get(`${API_URL}/api/dashboard/offline-status?user_id=67b7a32acc78837076f0a7d6`);
      setOfflineStatus(offlineResponse.data || {});

      const progressResponse = await axios.get(`${API_URL}/api/dashboard/learning-progress`);
      setLearningProgress(progressResponse.data || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats ScrollView */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <StatCard
            title="Accuracy Rate"
            value={`${formatNumber(performanceMetrics.accuracy_rate)}%`}
            change={+`${formatNumber(performanceMetrics.improvement_rate)}% this month`}
            changeColor="#10B981"
          />
          <StatCard
            title="Languages"
            value={performanceMetrics.languages_supported}
            change={`${performanceMetrics.new_languages_added} new languages added`}
            changeColor="#3B82F6"
          />
          <StatCard
            title="User Corrections"
            value={`${formatNumber(performanceMetrics.user_correction_rate)}%`}
            change="Down 2.3% from last week"
            changeColor="#10B981"
          />
          <StatCard
            title="Avg. Refinement"
            value={`${formatNumber(performanceMetrics.average_refinement_time)}s`}
            change="Faster on mobile devices"
            changeColor="#F97316"
          />
          <StatCard
            title="Offline Sessions"
            value={performanceMetrics.offline_sessions}
            change={`${formatNumber(performanceMetrics.offline_percentage)}% of total usage`}
            changeColor="#8B5CF6"
          />
        </ScrollView>

        {/* Recent Communications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Communications</Text>
          {recentCommunications.map(comm => (
            <CommunicationItem key={comm.id} comm={comm} />
          ))}
        </View>

        {/* Smart Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Suggestions</Text>
          {contextSuggestions.map(suggestion => (
            <SmartSuggestion
              key={suggestion.id} // Add key prop
              suggestion={suggestion}
              active={activeSuggestion === suggestion.id}
              onPress={() => setActiveSuggestion(
                activeSuggestion === suggestion.id ? null : suggestion.id
              )}
            />
          ))}
        </View>

        {/* Language Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language Distribution</Text>
          {recentLanguages.map(item => (
            <LanguageBar
              key={item.language} // Add key prop
              language={item.language}
              percentage={item.percentage}
            />
          ))}
          <Text style={styles.otherLanguagesText}>
            {performanceMetrics.otherLanguagesCount} other languages detected this month
          </Text>
        </View>

        {/* Offline Mode Status */}
        <View style={styles.section}>
          <View style={styles.offlineContainer}>
            <View>
              <Text style={styles.offlineTitle}>Offline Mode</Text>
              <Text style={styles.offlineSubtitle}>
                Last sync: {offlineStatus.last_sync_minutes_ago} minutes ago
              </Text>
            </View>
            <TouchableOpacity style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Sync Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.syncInfo}>
            <View style={styles.syncFrequency}>
              <Icon name="clock-outline" size={16} color="#666" />
              <Text style={styles.syncFrequencyText}>
                Auto-sync every {offlineStatus.sync_frequency}
              </Text>
            </View>
          </View>
        </View>

        {/* Learning Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Learning Progress</Text>
          {['voice_pattern_recognition', 'contextual_understanding', 'translation_precision'].map((key) => (
            <View key={key} style={styles.progressSection}> 
              <Text style={styles.progressTitle}>
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { width: `${formatNumber(learningProgress[key]?.accuracy || 0)}%` }
                  ]} 
                />
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.accuracyText}>
                  {formatNumber(learningProgress[key]?.accuracy || 0)}% accuracy
                </Text>
                <Text style={styles.improvementText}>
                  +{formatNumber(learningProgress[key]?.improvement || 0)}% this week
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statsContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    width: width * 0.6,
    marginRight: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statChange: {
    fontSize: 12,
  },
  section: {
    padding: SPACING.md,
    backgroundColor: 'white',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  commItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: SPACING.md,
  },
  commHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  commTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  messageContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  originalText: {
    backgroundColor: '#F3F4F6',
    padding: SPACING.sm,
    borderRadius: 8,
    fontSize: 14,
    color: '#374151',
  },
  refinedText: {
    backgroundColor: '#EEF2FF',
    padding: SPACING.sm,
    borderRadius: 8,
    fontSize: 14,
    color: '#3730A3',
},
commFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
},
footerText: {
    fontSize: 12,
    color: '#6B7280',
},
suggestion: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
},
activeSuggestion: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
},
suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
},
suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
},
chevronContainer: {
    padding: SPACING.xs,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
},
activeChevron: {
    backgroundColor: '#E0E7FF',
},
suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
},
contextText: {
    fontSize: 12,
    color: '#6B7280',
},
confidenceText: {
    fontSize: 12,
    color: '#059669',
},
suggestionActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
},
applyButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
},
applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
},
editButton: {
    padding: SPACING.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
},
editButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
},
languageBar: {
    marginBottom: SPACING.md,
},
languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
},
languageText: {
    fontSize: 14,
    color: '#374151',
},
percentageText: {
    fontSize: 14,
    fontWeight: '500',
},
progressContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
},
progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
},
otherLanguagesText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: SPACING.md,
},
offlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
offlineTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
},
offlineSubtitle: {
    fontSize: 14,
    color: '#6B7280',
},
syncButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
},
syncButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
},
syncInfo: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
syncFrequency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
},
syncFrequencyText: {
    fontSize: 14,
    color: '#6B7280',
},
progressSection: {
    marginBottom: SPACING.lg,
},
progressTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.sm,
},
progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
},
accuracyText: {
    fontSize: 12,
    color: '#6B7280',
},
improvementText: {
    fontSize: 12,
    color: '#059669',
},
});

// Export the Dashboard component directly
export default Dashboard;