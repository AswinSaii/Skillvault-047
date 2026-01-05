# Firebase Index Fix Guide

## Error
The query requires an index for the `attempts` collection with fields: `status`, `percentage`, and `__name__`.

## Solution

You have two options:

### Option 1: Click the Auto-Generated Link (Recommended)
1. Open your browser and go to this URL (from the error message):
   ```
   https://console.firebase.google.com/v1/r/project/skillvault-1ce22/firestore/indexes?create_composite=ClFwcm9qZWN0cy9za2lsbHZhdWx0LTFjZTIyL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9hdHRlbXB0cy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoOCgpwZXJjZW50YWdlEAIaDAoIX19uYW1lX18QAg
   ```
2. Click "Create Index"
3. Wait 2-5 minutes for the index to build

### Option 2: Manual Creation
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `skillvault-1ce22`
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure the index:
   - **Collection ID**: `attempts`
   - **Fields to index**:
     - Field: `status` | Order: Ascending
     - Field: `percentage` | Order: Descending
     - Field: `__name__` | Order: Descending
6. **Query scope**: Collection
7. Click **Create**

### Option 3: Add to firestore.indexes.json (For Version Control)
Create a file `firestore.indexes.json` in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "attempts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "percentage",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "__name__",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

## Additional Indexes You May Need

Based on your app's queries, you may also want to create these indexes:

### For Faculty Dashboard Stats
```json
{
  "collectionGroup": "attempts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "assessmentId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```

### For Student Search
```json
{
  "collectionGroup": "attempts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "studentId", "order": "ASCENDING" },
    { "fieldPath": "percentage", "order": "DESCENDING" }
  ]
}
```

## Verification
After creating the index:
1. Wait for the status to show "Enabled" (usually 2-5 minutes)
2. Refresh your application
3. The error should be resolved

## Notes
- Firestore automatically generates the index creation link in error messages
- Indexes are required for queries with multiple orderBy or where + orderBy clauses
- Indexes don't affect write performance significantly
- You can have up to 200 composite indexes per database
