**KonBon App - Kanban Productivity App**

KonBon is a Kanban-based productivity app designed to help users organize tasks. Built with React and Node.js, it integrates Google OAuth for authentication, MongoDB for task storage, and AWS S3 for file uploads. The app features a drag-and-drop interface for managing tasks across "To Do," "In Progress," and "Done" columns, making it a simple and straightforward tool for personal productivity.

**Features**

- Task Management: Create, update, and delete tasks with titles and optional file attachments.
- Drag-and-Drop: Move tasks between "To Do," "In Progress," and "Done" columns using react-beautiful-dnd.
- Google Authentication: Secure login via Google OAuth 2.0.
- File Uploads: Attach files to tasks, stored securely in AWS S3.
- Persistent Storage: Tasks are saved in MongoDB, tied to user IDs.
- Responsive Design: Adapts to desktop and mobile screens.

**Tech Stack**

**Frontend**

- React: UI framework with hooks (useState, useEffect, useCallback).
- react-beautiful-dnd: Drag-and-drop functionality.
- Axios: HTTP requests to the backend.
- CSS: Custom styles (KanbanBoard.css) for layout and responsiveness.

**Backend**

- Node.js & Express: RESTful API server.
- MongoDB & Mongoose: Database for task persistence.
- AWS SDK: S3 integration for file storage.
- Google Auth Library: OAuth 2.0 token verification.


**Deployment**

- Railway: Hosting platform for both frontend and backend.
- Environment Variables: Managed via .env files and Railway dashboard.
  
**Prerequisites**
- Node.js: v18.x or higher.
- npm: v9.x or higher.
- MongoDB Atlas: A cluster for task storage.
- AWS S3: A bucket for file uploads.
- Google Cloud Console: OAuth 2.0 credentials.


  
**Installation**


**Clone the Repository**


- bash
- Copy git clone https://github.com/<your-username>/konbonproject.git
- cd konbonproject

**Frontend Setup**

- Navigate to the frontend directory:
bash
- cd kanban-app/frontend
- Install dependencies:
bash


- Copy
npm install
- Create a .env file:

- Copy
REACT_APP_API_URL=https://konbonproject-backend-production.up.railway.app
- Run locally:
bash

- Copy
npm start
Opens at http://localhost:3000.


**Backend Setup**

- Navigate to the backend directory:

- bash
Copy
cd kanban-app/backend/server
- Install dependencies:

- Copy
npm install

Create a .env file:

- GOOGLE_CLIENT_ID=your-google-client-id
- MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/kanban
- AWS_ACCESS_KEY=your-aws-access-key
- AWS_SECRET_KEY=your-aws-secret-key
- S3_BUCKET=your-s3-bucket-name


**Run locally:**

- bash
- Copy
npm start
- Runs at http://localhost:3001.
