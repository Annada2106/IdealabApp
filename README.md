# 📦 IDEALab Inventory & Borrowing App

> A React Native (Expo) mobile application that replaces the manual component borrowing system in IDEALab.

---

## 🚀 Overview

IDEALab Inventory App digitizes the process of borrowing electronic components.  
It enables students to request parts and allows administrators to manage inventory, approve requests, and maintain records — all in real-time.

---

## 🛠 Tech Stack

- ⚛ React Native (Expo)
- 🔥 Firebase Authentication
- 🗄 Firebase Firestore
- 🧭 React Navigation

---

## ✨ Features

### 👩‍🎓 Student (User) Features
- Secure Login & Registration
- View Available Components
- Request Components

### 🧑‍💼 Admin Features
- Inventory Management
- Approve / Reject Requests
- View Complete Borrow Records
- Update Return Status

---

## 🗂 Project Structure

```
idealab-app/
│
├── App.js
├── firebaseConfig.js
│
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── UserDashboard.js
│   ├── AdminDashboard.js
│   ├── InventoryScreen.js
│   ├── RequestsScreen.js
│   └── RecordsScreen.js
│
└── components/
    ├── ComponentCard.js
    └── RequestCard.js
```

