# Kony Web Admin Dashboard

This repository contains the source code for the **Kony Web Admin Dashboard**, a web-based tool that allows administrators to manage technical visit reports and user accounts for the Kony application.

This README provides all essential commands and setup instructions for development, Git workflow, and Firebase Hosting deployment.

---

## 🚀 Project Overview

- **User Authentication** with role-based access control
- **Technical Visit Report Management**: View, approve, and delete reports
- **PDF Generation** for reports
- **User Management**
- Built with **Vanilla JavaScript** and **Vite** (for bundling)
- Backend powered by **Firebase Authentication**, **Firestore Database**, and **Firebase Hosting**
- CI/CD via **GitHub Actions**
- Requires: **Node.js 16+**, **npm 7+**, **Firebase CLI**

---

## 🛠️ Project Setup

### Install Dependencies

```bash
npm ci
# or
npm install
```

### Build the Project

```bash
npm run build
```

> This generates production-ready files in the output folder (typically `dist/`).

---

## 🧑‍💻 Development

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

---

## 🌲 Git Workflow

Check current status:

```bash
git status
```

Pull remote changes (especially if histories are unrelated):

```bash
git pull origin main --allow-unrelated-histories
```

Add and commit your changes:

```bash
git add .
git commit -m "Your descriptive commit message"
```

Push changes to GitHub:

```bash
git push origin main
```

If push is rejected because remote is ahead:

```bash
git pull origin main --allow-unrelated-histories
# Fix any conflicts, then:
git push origin main
```

---

## ☁️ Firebase Hosting Deployment

Initialize Firebase Hosting (only needed once):

```bash
firebase init hosting
```

Deploy your site:

```bash
firebase deploy --only hosting
```

For a clean rebuild and redeploy:

```bash
rm -rf dist
npm ci
npm run build
firebase deploy --only hosting
```

---

## 🔄 GitHub Actions (CI/CD)

Pushing changes to the `main` branch automatically triggers the GitHub Actions workflow to build and deploy your project.

🔍 **View deployment status:**  
[GitHub Actions Workflow](https://github.com/Skanderba8/kony-web-admin-prod/actions)

---

## ❓ Troubleshooting

### Resolving Merge Conflicts

1. Edit conflicting files and remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. Save the resolved files
3. Stage and commit:

```bash
git add .
git commit -m "Resolved merge conflicts"
```

4. Push changes:

```bash
git push origin main
```

### Still seeing an old version after deploy?

- Clear browser cache or try an **Incognito window**
- Make sure you're visiting the correct **Firebase Hosting URL**
- Run a clean build and deploy again (see above)

---

## 📎 Useful Links

- 🔧 **Firebase Console**: [Firebase Hosting](https://console.firebase.google.com/project/kony-25092/hosting/sites)
- 💡 **GitHub Repository**: [kony-web-admin-prod](https://github.com/Skanderba8/kony-web-admin-prod)

---

## 📁 Project Structure

```
.
├── public/         # Static assets
├── src/            # Source code
│   └── components/ # UI components
│   └── utils/      # Utility functions
├── firebase/       # Firebase configuration files
└── README.md       # This file
```

npm run build
git add .
git commit -m "Your message"
git pull origin main --allow-unrelated-histories
git push origin main
