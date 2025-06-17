import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AudioWaveform from '../components/AudioWaveform';

export default function HomeScreen() {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState();
    const [hasPermission, setHasPermission] = useState(false);
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordedURI, setRecordedURI] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [language, setLanguage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskResponse, setTaskResponse] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleRejectTask = (task) => {
        setTasks((prevTasks) => prevTasks.filter(t => t.task_description !== task.task_description));
    };

    const handleTaskProcessing = async (task) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://192.168.202.60:5002/process_task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: task.task_description }),
            });
            const data = await response.json();
            setTaskResponse(data);
            setSelectedTask(task);
            setIsModalVisible(true);
            setIsLoading(false);
        } catch (error) {
            console.error('Error processing task:', error);
            setError('Failed to process task. Please try again.');
            setIsLoading(false);
        }
    };

    const handleConfirmTask = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://192.168.202.60:5002/process_task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    task: selectedTask.task_description,
                    confirm: true 
                }),
            });
            const data = await response.json();
            // Remove the processed task from the list
            setTasks((prevTasks) => prevTasks.filter(t => t.task_description !== selectedTask.task_description));
            setIsModalVisible(false);
            setSelectedTask(null);
            setTaskResponse(null);
        } catch (error) {
            console.error('Error confirming task:', error);
            setError('Failed to confirm task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeminiCall = async (transcriptText) => {
        if (!transcriptText) return;
        try {
            const response = await fetch('http://192.168.202.60:5002/analyze_transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: transcriptText }),
            });
            const data = await response.json();
            setTasks(data.tasks.items);
        } catch (error) {
            console.error('Error calling Gemini:', error);
            setError(error.message || 'Failed to analyze transcript');
        }
    };

    async function startRecording() {
        try {
            if (!hasPermission) {
                alert('Permission for audio recording is required.');
                return;
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Error recording: ', err);
        }
    }

    async function stopRecording() {
        if (!recording) return;
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordedURI(uri);
        await sendAudioToBackend(uri);
    }

    async function sendAudioToBackend(uri) {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', { uri, type: 'audio/webm', name: 'recording.webm' });
    
            const response = await fetch('https://refined-gazelle-normal.ngrok-free.app/transcribe', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            let responseText = await response.text(); // Get raw response text
    
            let data;
            try {
                // Attempt to parse as JSON
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.warn("Response is not JSON, converting manually:", responseText);
                
                // Convert non-JSON response into a structured object
                data = {
                    transcription: extractText(responseText),
                    detected_language: { name: "Unknown" } // Set default value
                };
            }
    
            setTranscription(data.transcription);
            setLanguage(data.detected_language.name);
            handleGeminiCall(data.transcription);
    
        } catch (error) {
            console.error('Error sending audio:', error);
            setError('Failed to send audio. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    
    // Helper function to extract meaningful text from raw response
    function extractText(rawResponse) {
        // Simple approach: remove unexpected characters and return a cleaned version
        return rawResponse.replace(/[^a-zA-Z0-9 .,?!]/g, '').trim();
    }
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Voice Recognition</Text>
            <View style={styles.waveformContainer}>
                <AudioWaveform isRecording={isRecording} />
            </View>
            <TouchableOpacity 
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color='white' />
            </TouchableOpacity>
            
            {isLoading && <ActivityIndicator size='large' color='#3B82F6' />}
            
            {transcription && (
                <View style={styles.resultContainer}>
                    <Text style={styles.languageText}>Detected Language: {language}</Text>
                    <Text style={styles.transcriptionText}>{transcription}</Text>
                </View>
            )}
            
            <FlatList 
                data={tasks} 
                keyExtractor={(item) => item.task_description}
                renderItem={({ item }) => (
                    <View style={styles.taskContainer}>
                        <Text style={styles.taskText}>{item.task_description}</Text>
                        <TouchableOpacity 
                            style={styles.processButton}
                            onPress={() => handleTaskProcessing(item)}
                        >
                            <Text style={styles.buttonText}>Process</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.rejectButton}
                            onPress={() => handleRejectTask(item)}
                        >
                            <Text style={styles.buttonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                )} 
            />

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Task Response</Text>
                        <Text style={styles.modalText}>
                            {taskResponse?.result || "No response available"}
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirmTask}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8FAFC', // Light blue-gray background
        alignItems: 'center', 
        padding: 20 
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        marginBottom: 20,
        color: '#1E40AF' // Dark blue for title
    },
    waveformContainer: {
        backgroundColor: '#EFF6FF', // Very light blue
        padding: 15,
        borderRadius: 12,
        width: '100%',
        marginBottom: 20,
        display:'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    recordButton: { 
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: '#3B82F6', // Primary blue
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    recordingButton: { 
        backgroundColor: '#DC2626' // Red for recording state
    },
    resultContainer: { 
        marginTop: 20, 
        padding: 20, 
        backgroundColor: '#DBEAFE', // Light blue background
        borderRadius: 10,
        width: '100%',
        borderWidth: 1,
        borderColor: '#93C5FD' // Lighter blue border
    },
    languageText: { 
        fontSize: 16, 
        color: '#1E40AF', // Dark blue
        marginBottom: 10 
    },
    transcriptionText: { 
        fontSize: 18, 
        color: '#1E3A8A' // Darker blue
    },
    taskContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 10, 
        backgroundColor: '#FFFFFF',
        padding: 15, 
        borderRadius: 8,
        width: '100%',
        borderLeftWidth: 4,
        borderLeftColor: '#60A5FA', // Medium blue accent
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    taskText: {
        flex: 1,
        fontSize: 16,
        color: '#334155' // Slate gray
    },
    processButton: {
        backgroundColor: '#2563EB', // Bright blue
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginLeft: 10
    },
    rejectButton: {
        backgroundColor: '#DC2626', // Red
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginLeft: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.5)' // Dark blue with opacity
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
        borderTopWidth: 4,
        borderTopColor: '#3B82F6' // Blue accent
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1E40AF' // Dark blue
    },
    modalText: {
        fontSize: 16,
        color: '#334155', // Slate gray
        marginBottom: 20
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginLeft: 10
    },
    confirmButton: {
        backgroundColor: '#2563EB' // Bright blue
    },
    cancelButton: {
        backgroundColor: '#DC2626' // Red
    }
});