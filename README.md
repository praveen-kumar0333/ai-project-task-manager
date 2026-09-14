# 🚀 AI Project & Task Manager

> **Smart developer assistant for task generation, architectural descriptions, and workflow optimization.**

AI Project & Task Manager is a full-stack web application designed to help developers and teams manage projects, tasks, productivity, and development workflows from one place.

The platform combines traditional project/task management with **Google Gemini conversational AI, AI-powered task generation, voice assistance, productivity analytics, authentication, persistent MySQL storage, and a RAG-based Knowledge Base.**

---

## 🌐 Live Application

**Frontend:**  
https://ai-project-task-manager.vercel.app/

**Backend API:**  
https://ai-project-task-manager.onrender.com

**Health Check:**  
https://ai-project-task-manager.onrender.com/api/health

---

# ✨ Features

## 🔐 Authentication & Security

- User registration
- User login
- Password hashing using bcryptjs
- JWT-based authentication
- Protected API routes
- Bearer token authentication
- Automatic handling of expired/unauthorized sessions
- User-specific data isolation
- Project ownership validation
- Task ownership validation
- Secure backend API architecture
- Environment-based secret management

---

# 📊 Developer Productivity Dashboard

The dashboard provides an overview of the user's development activity.

### Dashboard includes:

- Total projects
- Total tasks
- Completed tasks
- Pending tasks
- Task status information
- Project statistics
- Recent activities
- Productivity information
- Quick access to projects and tasks

The dashboard uses real data from the backend and MySQL database.

---

# 📁 Project Management

Users can create and manage development projects.

### Project functionality:

- Create projects
- View projects
- Update projects
- Delete projects
- Project descriptions
- Project status
- Project priority
- User ownership
- Persistent database storage
- Project filtering

Projects are stored permanently in MySQL.

---

# ✅ Task Management

Users can manage tasks associated with their projects.

### Task functionality:

- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Change task status
- Task priority
- Task descriptions
- Due dates
- Project association
- Task filtering
- Persistent storage
- Ownership/security validation

Supported task status and priority values are handled by the backend validation system.

---

# 🤖 AI-Powered Task Generation

The application integrates **Google Gemini AI** to help developers generate tasks automatically.

Users can provide information about a project and ask the AI to generate relevant development tasks.

### AI task generation can help with:

- Breaking projects into smaller tasks
- Generating development tasks
- Creating task titles
- Generating task descriptions
- Suggesting priorities
- Organizing development workflow

AI-generated tasks can be reviewed and saved into the user's project.

---

# 💬 Conversational AI Assistant

The application includes an AI assistant powered by Google Gemini.

The assistant can interact with the user's workspace and provide development-related assistance.

### Features:

- Conversational AI
- Persistent conversations
- Persistent messages
- New conversations
- Conversation history
- Workspace-aware assistance
- Project context
- Task context
- Development guidance
- Architectural explanations
- Workflow assistance

The AI assistant is designed to work with the user's project and task information rather than acting only as a generic chatbot.

---

# 🧠 RAG Knowledge Base

The application includes a Knowledge Base based on a Retrieval-Augmented Generation (RAG) architecture.

Users can upload project-related documents and use them as additional context for AI assistance.

### Supported document types include:

- PDF
- TXT

### Knowledge Base functionality:

- Upload documents
- Store document metadata
- Extract document text
- Split content into chunks
- Store chunks in MySQL
- Generate/store embeddings
- Retrieve relevant knowledge
- Provide additional context to AI responses

This allows the AI assistant to work with project-specific documentation.

> **Production note:** On ephemeral hosting environments, locally stored uploaded files may not persist across redeployments. Persistent object storage or a persistent disk can be added for production-scale document storage.

---

# 🔊 Voice AI Assistant

The application integrates **Murf AI** for voice functionality.

Voice features are accessed through the backend so API credentials remain server-side.

### Voice functionality includes:

- Voice assistance
- Text-to-speech functionality
- Backend voice API integration
- Secure API key handling

The frontend communicates with the backend rather than exposing the Murf API key directly.

---

# 📈 Activity Tracking

The application maintains a persistent activity history.

Activities can be generated when users perform important actions such as:

- Creating projects
- Updating projects
- Deleting projects
- Creating tasks
- Updating tasks
- Completing tasks
- AI task generation
- AI-related operations

Activities are stored in MySQL and isolated per user.

---

# 🗄️ Database

The application uses **MySQL** for persistent data storage.

The production database is hosted using **Aiven**.

### Database tables

```text
users
projects
tasks
activities
conversations
messages
chat_messages
documents
document_chunks
