# Smart Wildlife Conservation and Anti-Poaching Monitoring System 🐘🐆

Welcome to the **Smart Wildlife App**! This is the official mobile application for Rangers, Park Managers, and Researchers to manage patrols, report incidents, and monitor wildlife tracking.

## 🛠 Tech Stack
* **Frontend:** React Native with Expo (Expo Router)
* **Backend:** Google Firebase (Firestore, Auth, Storage)
* **Maps & Location:** `react-native-maps`, `expo-location`

---

## 🚀 How to Set Up the Project (For Team Members)

Follow these steps to get the app running on your computer:

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone <YOUR_GITHUB_REPO_URL_HERE>
cd Smart_Wildlife_App
```

### 2. Install Dependencies
Run the following command to download all the required packages:
```bash
npm install
```

### 3. Setup Environment Variables (Crucial!)
You need to connect your local app to our Firebase database.
1. Create a new file named `.env` in the root folder (same place as `package.json`).
2. Open `.env.example` and copy its contents.
3. Paste them into your new `.env` file and replace the placeholder text with the actual Firebase config keys (Ask the team for these keys!).

### 4. Run the App
Start the Expo development server (use `-c` to clear cache for the first time):
```bash
npx expo start -c
```
* Download the **Expo Go** app on your phone.
* Scan the QR code shown in the terminal to view the app live!

---

## 📂 Project Structure & Division of Work

We are using **Expo Router**, so our screens are based on the file system. 

```text
src/
├── app/
│   ├── index.tsx              # Login Screen
│   ├── (ranger)/              # Ranger's Bottom Tabs
│   │   ├── patrol.tsx         # Use Case 1: Manage Patrols
│   │   ├── incident.tsx       # Use Case 2: Report Incidents
│   │   └── tracking.tsx       # Use Case 3: Monitor Tracking
│   ├── (manager)/             # Park Manager's Bottom Tabs
│   │   ├── assign.tsx         # Assign Patrols
│   │   ├── monitor.tsx        # Monitor Patrols
│   │   └── reports.tsx        # Use Case 4: Reports
│   └── (researcher)/          # Researcher's Bottom Tabs
│       └── reports.tsx        # Use Case 4: Reports
├── components/                # Reusable UI (Buttons, Cards, Modals)
├── services/                  # Database connections (Firebase logic)
├── hooks/                     # Custom React Hooks
├── constants/                 # Colors, Themes, Configs
└── utils/                     # Helper functions & dummyData.json
```

### 💡 Guidelines for Development
* **Do not edit `app/index.tsx` (Login)** unless discussed. It handles role-based routing.
* Work **only inside your assigned files** to avoid merge conflicts.
* If you create a reusable button or map, put it in `src/components/`.
* Write all database queries (Firestore calls) inside `src/services/`.

Happy Coding! 🚀
