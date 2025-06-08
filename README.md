# Task Manager App

**By: Mohd Fazal Khan**

## 📝 Description

Task Manager is a simple and elegant React Native mobile application designed to help users manage their daily tasks efficiently.
The app supports the following features:

* Adding new tasks with priority levels (High, Medium, Low).
* Completing and undoing tasks.
* Editing existing tasks.
* Deleting tasks.
* Persisting tasks locally using AsyncStorage.
* Scheduling push notifications for task reminders (via Expo Notifications API).
* Smooth UI animations using React Native Animated API.
* Responsive and attractive design with priority-based color coding.

This app was built using **React Native** and **Expo**, and is compatible with both Android and iOS devices.

---

## 🚀 Getting Started with Expo Go

### Prerequisites

* Node.js and npm installed

* Expo CLI installed globally:

  ```bash
  npm install -g expo-cli
  ```

* Expo Go app installed on your physical Android or iOS device (from Play Store or App Store).

### Steps to Run the App

1. **Clone the repository** (if using version control):

   ```bash
   git clone <your-repo-url>
   ```

2. **Navigate to the project folder**:

   ```bash
   cd task-manager-app
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start the development server**:

   ```bash
   expo start
   ```

5. **Scan the QR code** using Expo Go app on your device to run the app.

---

## ⚠️ Notes & Considerations

* **Notifications permission**: The app requests notification permissions on app launch. Notifications will only work on physical devices (not simulators).
* **AsyncStorage**: Tasks are saved locally using AsyncStorage so that they persist even if the app is closed.
* **Notification cancelation**: When a task is marked as complete, any scheduled notification for that task is canceled to avoid unnecessary reminders.

---

## 💡 Design Choices & Challenges

### Design Choices:

* I used a **priority-based color system** to quickly identify high, medium, and low-priority tasks visually.
* Implemented **animations** on task items using React Native's `Animated` API to make task addition/editing feel smoother.
* Added an **edit feature** to allow users to modify tasks inline without navigating away from the task list.
* Used **rounded headers** and modern design with subtle shadows and colors to keep the UI clean and friendly.

### Challenges Faced:

* **Notification handling**: Scheduling and canceling notifications per task required careful management of notification IDs.
* **Persistence**: Ensuring that edited tasks and task states (completed or not) persist correctly using AsyncStorage.
* **Cross-platform behavior**: Notifications behave slightly differently on Android vs iOS. Testing on both platforms took some extra time.
* **Keyboard management**: Making sure the input fields work well with the on-screen keyboard and that the UI remains responsive.

---

Enjoy using the Task Manager App!
If you like it, feel free to contribute or suggest improvements. ✌️

