📜 CertiLegal (ClarityLegal)

CertiLegal is a modern web application built with Next.js and Firebase to securely manage, upload, and access legal documents.
It focuses on authentication-based access, document handling, and a clean dashboard experience.

🚀 Features

🔐 User Authentication (Firebase Auth)

📁 Upload & manage legal documents

🧾 Secure document access based on user permissions

⚡ Fast and scalable Next.js App Router

☁️ Firebase Firestore & Storage integration

🖥️ Responsive UI

🛠️ Tech Stack

Frontend

Next.js (App Router)

React

Tailwind CSS (if used)

Backend / Services

Firebase Authentication

Firebase Firestore

Firebase Storage

Version Control

Git & GitHub

📂 Project Structure (Simplified)
CertiLegal/
├── app/
│   ├── dashboard/
│   │   └── [docId]/
│   │       └── page.tsx
│   ├── page.tsx
│   └── layout.tsx
├── lib/
│   └── firebase.ts
├── hooks/
│   └── useAuth.ts
├── public/
├── .env.local
├── .gitignore
├── package.json
└── README.md

🔧 Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/VIVEKXDD/CertiLegal.git
cd CertiLegal

2️⃣ Install dependencies
npm install

3️⃣ Setup Firebase Environment Variables

Create a .env.local file in the root:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id


⚠️ Never commit .env.local to GitHub

4️⃣ Run the development server
npm run dev


Open:

http://localhost:3000

🔒 Security Notes

Authentication handled using Firebase Auth

Firestore and Storage access controlled via Firebase Security Rules

Client-side notFound() is avoided to prevent routing issues

📌 Common Issues & Fixes

404 on document page
→ Avoid using notFound() in client components with async auth data

Push rejected by GitHub
→ Use git pull --allow-unrelated-histories before first push

📈 Future Improvements

Role-based access control

Document versioning

Search & filtering

Admin dashboard

Audit logs

👨‍💻 Author

Vivek Dhotre
GitHub: @VIVEKXDD

📄 License

This project is licensed under the MIT License.