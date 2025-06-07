import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform,
  SafeAreaView,
  Animated,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications is required!');
      }
    }
    if (Device.isDevice) {
      requestPermissions();
    }
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('TASKS');
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.log('Error loading tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('TASKS', JSON.stringify(tasks));
    } catch (error) {
      console.log('Error saving tasks:', error);
    }
  };

  const addTask = async () => {
    if (taskText.trim() === '') {
      setErrorMessage('Please enter a task');
      return;
    }
    setErrorMessage('');

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Time to complete: ${taskText}`,
      },
      trigger: {
        type: 'timeInterval',
        seconds: 10,},
    });

    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      priority,
      notificationId,
    };

    setTasks([...tasks, newTask]);
    setTaskText('');
    setPriority('Medium');
  };

  const toggleTaskCompletion = async (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (!task.completed && task.notificationId) {
            Notifications.cancelScheduledNotificationAsync(task.notificationId);
          }
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };

  const deleteTask = async (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (taskToDelete && taskToDelete.notificationId) {
      Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
    }
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEditedTask = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTaskId ? { ...task, text: editingText } : task
      )
    );
    setEditingTaskId(null);
    setEditingText('');
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { backgroundColor: '#ff5252' };
      case 'Medium':
        return { backgroundColor: '#ffca28' };
      case 'Low':
        return { backgroundColor: '#4caf50' };
      default:
        return { backgroundColor: '#ccc' };
    }
  };

  const renderTaskItem = ({ item }) => {
    const scale = new Animated.Value(0.95);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={[styles.taskItem, { transform: [{ scale }] }]}>
        <View style={{ flex: 1 }}>
          {editingTaskId === item.id ? (
            <>
              <TextInput
                style={[styles.input, { height: 40, marginBottom: 5 }]}
                value={editingText}
                onChangeText={setEditingText}
                autoFocus
              />
              <TouchableOpacity
                style={styles.completeButton}
                onPress={saveEditedTask}
              >
                <Text style={styles.completeButtonText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.completedTask,
                ]}
              >
                {item.text}
              </Text>
              <View style={styles.priorityTagContainer}>
                <Text style={[styles.priorityTag, getPriorityStyle(item.priority)]}>
                  {item.priority}
                </Text>
              </View>
            </>
          )}
        </View>

        {editingTaskId !== item.id && (
          <>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => toggleTaskCompletion(item.id)}
            >
              <Text style={styles.completeButtonText}>
                {item.completed ? 'Undo' : 'Complete'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => startEditingTask(item)}
            >
              <Text style={styles.completeButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteTask(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a73e8"
        translucent={true}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Task Manager</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor="#999"
            value={taskText}
            onChangeText={(text) => {
              setTaskText(text);
              setErrorMessage('');
            }}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addTask}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priorityPicker}>
          {['High', 'Medium', 'Low'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.priorityButton,
                priority === level && styles.priorityButtonSelected,
              ]}
              onPress={() => setPriority(level)}
            >
              <Text
                style={[
                  styles.priorityButtonText,
                  priority === level && { color: '#fff' },
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <FlatList
          data={tasks.sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
          })}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a73e8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#1a73e8',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  priorityPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  priorityButton: {
    borderWidth: 1,
    borderColor: '#1a73e8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 5,
  },
  priorityButtonSelected: {
    backgroundColor: '#1a73e8',
  },
  priorityButtonText: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  completeButton: {
    backgroundColor: '#03dac6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4081',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  priorityTagContainer: {
    marginTop: 5,
  },
  priorityTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4081',
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 10,
  },
});
