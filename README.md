# SkillVault Platform

> AI-ready, skill-first assessment and certification platform for verified colleges

SkillVault is a comprehensive skill assessment and certification platform that enables colleges to issue verified certificates, students to showcase their skills, and recruiters to find qualified candidates. The platform uses AI-powered question generation and provides a complete ecosystem for skill verification and certification.

![SkillVault](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.7-orange?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### Core Features
- **AI-Powered Question Generation**: Automatically generates MCQ questions using OpenAI API for skill assessments
- **Dynamic Skill Assessments**: Students can take assessments for any skill with 5 dynamically generated questions
- **Certificate Generation**: Automatic PDF certificate generation with QR codes for verification
- **Real-time Analytics**: Comprehensive dashboards with dynamic data updates
- **Multi-role Access Control**: Five distinct user roles with role-based dashboards
- **Certificate Verification**: Public verification system for recruiters to verify certificates
- **Shortlisting System**: Recruiters can shortlist candidates with verified skills
- **Proctoring Features**: Tab switch detection and security measures during assessments

### Security Features
- **Assessment Security**: 
  - Text selection disabled during assessments
  - Right-click disabled
  - Developer tools shortcuts blocked (F12, Ctrl+Shift+I, etc.)
  - View source disabled (Ctrl+U)
- **Firebase Authentication**: Secure user authentication and authorization
- **Role-based Access Control**: Granular permissions for each user role

## 👥 User Roles

### 1. **Students**
- View and enroll in skill courses
- Take skill assessments with AI-generated questions
- Earn certificates upon scoring 70% or higher
- View certificate history
- Track assessment history and progress
- Daily quiz participation
- Skill recommendations

### 2. **Faculty**
- Create and manage assessments
- Build question banks
- Track student performance
- View proctoring alerts
- Manage assessment schedules
- View student analytics

### 3. **College Administrators**
- Manage faculty and students
- View and manage certificates issued by their college
- Search and filter certificates
- Download certificates
- Verify and revoke certificates
- View college-wide analytics

### 4. **Recruiters**
- Search for candidates by skills
- Verify certificates using certificate IDs
- Shortlist candidates
- View candidate profiles with verified skills
- Filter candidates by domain and certification status

### 5. **Super Admins**
- Manage all users across the platform
- Create and manage skills
- Manage colleges and verify college registrations
- View platform-wide analytics
- Manage certificate templates
- System-wide data management

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.0** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend & Services
- **Firebase Authentication** - User authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **OpenAI API** - AI-powered question generation
- **jsPDF** - PDF certificate generation
- **QRCode** - QR code generation for certificates

### Additional Tools
- **Vercel Analytics** - Performance monitoring
- **Sonner** - Toast notifications
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Firebase account** with a project set up
- **OpenAI API key** (for question generation)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillvaultplatform.git
   cd skillvaultplatform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI API Key (for question generation)
   OPENAI_API_KEY=your_openai_api_key

   # Application URL (for certificate verification links)
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Optional: Enable dummy data generation in development
   NEXT_PUBLIC_ENABLE_DUMMY_DATA=true
   ```

4. **Set up Firebase**
   
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Deploy Firestore indexes (see Firebase Setup section)
   - Copy your Firebase configuration to `.env.local`

5. **Deploy Firestore Indexes**
   
   The project includes a `firestore.indexes.json` file with all required indexes. Deploy them using:
   
   **Option 1: Firebase Console**
   - Go to Firebase Console → Firestore → Indexes
   - Click "Import" and upload `firestore.indexes.json`
   
   **Option 2: Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:indexes
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

### 1. Create Firestore Collections

The following collections are automatically created when you use the application:
- `users` - User profiles and authentication data
- `colleges` - College information
- `skills` - Available skills/courses
- `skillEnrollments` - Student skill enrollments
- `assessments` - Assessment definitions
- `attempts` - Student assessment attempts
- `questions` - Question bank
- `certificates` - Issued certificates
- `shortlist` - Recruiter shortlisted candidates

### 2. Firestore Security Rules

Set up appropriate security rules in Firebase Console. Example rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules based on your requirements
  }
}
```

### 3. Authentication Setup

- Enable Email/Password authentication in Firebase Console
- Configure authorized domains if needed

## 🚀 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
   - Ensure all Firebase and OpenAI keys are set

### Important Notes for Deployment

**⚠️ About User Accounts:**
- **No, you don't need to create login accounts again** when deploying to Vercel
- User accounts are stored in **Firebase Authentication**, which is cloud-based
- As long as you use the same Firebase project configuration, all user accounts will be available
- The database (Firestore) is also cloud-based, so all data persists across deployments

**What to do:**
1. Use the same Firebase project credentials in your Vercel environment variables
2. Ensure Firestore indexes are deployed (they're tied to your Firebase project)
3. All existing users, certificates, and data will be available immediately

## 📁 Project Structure

```
skillvaultplatform/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages by role
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Other components
├── lib/                   # Utility libraries
│   ├── firebase/         # Firebase helper functions
│   ├── openai/           # OpenAI integration
│   └── utils/            # Utility functions
├── public/               # Static assets
│   └── images/           # Images and logos
├── firestore.indexes.json # Firestore index definitions
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Dependencies
```

## 🎯 Key Features Explained

### AI-Powered Question Generation
- Uses OpenAI GPT-4o-mini to generate 5 MCQ questions per assessment
- Questions are tailored to the selected skill
- Questions are generated dynamically when a student starts an assessment
- Only MCQ questions are generated (no coding questions)

### Certificate System
- Automatic certificate generation upon scoring 70% or higher
- PDF certificates with QR codes
- Unique certificate IDs (e.g., CERT-XXXXX)
- Public verification system
- Certificate templates managed by super admins

### Assessment Security
- Text selection disabled during assessments
- Right-click context menu disabled
- Developer tools blocked
- View source disabled
- Tab switch detection for proctoring

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `OPENAI_API_KEY` | OpenAI API key for question generation | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for certificate links | Yes |
| `NEXT_PUBLIC_ENABLE_DUMMY_DATA` | Enable dummy data generation | No |

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build       # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@skillvault.app or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Powered by [Firebase](https://firebase.google.com/)
- AI question generation by [OpenAI](https://openai.com/)

---

Made with ❤️ by the SkillVault Team

