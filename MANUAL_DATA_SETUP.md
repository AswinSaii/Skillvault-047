# Manual Data Entry Guide for Firebase Console

Since the automated script is having issues with Firestore security rules, here's how to manually add demonstration data through the Firebase Console:

## Step 1: Update Your Faculty User with CollegeID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `skillvault-1ce22`
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Find your faculty user (Johny Doe / your email)
6. Click "Edit" and add field:
   - Field: `collegeId`
   - Value: `college_1` (string)
7. Save

## Step 2: Create Sample College (if not exists)

1. In Firestore Database, create/check `colleges` collection
2. Add a document with ID: `college_1`
3. Add fields:
   ```
   name: "Tech University" (string)
   location: "San Francisco, CA" (string)
   verified: true (boolean)
   ```

## Step 3: Add Sample Students

For each student, add a document to `users` collection:

### Student 1:
- Document ID: `student_1` (auto-generate is fine too)
- Fields:
  ```
  name: "Alice Johnson" (string)
  email: "alice@demo.com" (string)
  role: "student" (string)
  collegeId: "college_1" (string)
  collegeName: "Tech University" (string)
  verified: true (boolean)
  ```

### Student 2:
- Document ID: `student_2`
- Fields:
  ```
  name: "Bob Smith" (string)
  email: "bob@demo.com" (string)
  role: "student" (string)
  collegeId: "college_1" (string)
  collegeName: "Tech University" (string)
  verified: true (boolean)
  ```

### Student 3:
- Document ID: `student_3`
- Fields:
  ```
  name: "Carol Davis" (string)
  email: "carol@demo.com" (string)
  role: "student" (string)
  collegeId: "college_1" (string)
  collegeName: "Tech University" (string)
  verified: true (boolean)
  ```

## Step 4: The Assessments Will Be Created by Your Faculty User

Once you log in as faculty and create assessments through the UI, they will be automatically saved to Firestore.

## Step 5: Fix the Firebase Index Issue

**IMPORTANT**: To fix the console error, you must create the Firebase index:

1. Click this link (it's from your error message):
   ```
   https://console.firebase.google.com/v1/r/project/skillvault-1ce22/firestore/indexes?create_composite=ClFwcm9qZWN0cy9za2lsbHZhdWx0LTFjZTIyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9hdHRlbXB0cy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoOCgpwZXJjZW50YWdlEAIaDAoIX19uYW1lX18QAg
   ```
2. Click **"Create Index"**
3. Wait 2-5 minutes for the index to build
4. Refresh your application

## Quick Demo Data Summary

Minimum viable data for demonstration:
- ✅ 1 College (college_1)
- ✅ 1 Faculty User (your current user - update collegeId)
- ✅ 3 Students (Alice, Bob, Carol)
- ✅ Assessments will be created via UI
- ✅ Firebase Index (must be created manually)

## Alternative: Using Firebase Console Import

If you want to add many records at once:
1. Prepare a JSON file with your data
2. Use Firebase CLI: `firebase firestore:import ./data.json`

However, the easiest approach for demonstration is:
1. Update your faculty collegeId to `college_1`
2. Add 2-3 student users manually
3. Create 2-3 assessments through your UI
4. **Create the Firebase index** (this is mandatory!)

Once the index is created and you refresh, the errors will disappear!
