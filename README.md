-----------------------------------------------------------------------------------------

🎥 Video Upload, Sensitivity Processing & Streaming Platform

A full-stack multi-tenant video platform that allows users to upload videos, automatically analyze them for sensitive content, and securely stream them with real-time processing updates.
This project fulfills all core functional requirements and RBAC constraints outlined in the assignment.

-----------------------------------------------------------------------------------------------------

🔗 Live Demo

Frontend (Vercel):
👉 https://video-streaming-platform-vert.vercel.app/

Backend API (Render):
👉 https://video-streaming-platform-ilog.onrender.com

AI Sensitivity Service (Render):
👉 https://video-ai-service.onrender.com

Demo Video:
👉 https://drive.google.com/file/d/1vY7UTskC6isBtNp-EcfZ5x7y7hvp2Hsp/view?usp=sharing

------------------------------------------------------------------------------------------------------

🧱 Architecture Overview

video_streaming_platform/
│
├── backend/                 # Node.js + Express API
│   ├── routes/              # Auth & video routes
│   ├── services/            # Video processing pipeline
│   ├── sockets/             # Socket.IO progress updates
│   ├── models/              # MongoDB schemas
│   ├── config/              # DB, Cloudinary config
│   └── server.js
│
├── ai/                      # Python AI service (Flask)
│   ├── ai_server.py
│   └── requirements.txt
│
├── frontend/                # React + Vite app
│   ├── pages/               # Login, Signup, Dashboard, Upload
│   ├── components/          # VideoCard, VideoPlayer, StatusBadge
│   ├── auth/                # Auth context
│   └── api/                 # Axios & socket clients
│
└── README.md

------------------------------------------------------------------------------------------------------

🛠 Tech Stack

Backend
    Node.js + Express
    MongoDB Atlas + Mongoose
    Socket.IO (real-time progress)
    JWT Authentication
    Cloudinary (object storage for videos)
    FFmpeg (frame extraction)
    Axios (AI service communication)

AI Service
    Python + Flask
    OpenNSFW2
    TensorFlow
    Pillow

Frontend
    React + Vite
    TypeScript
    Axios
    Socket.IO Client
    Pure CSS (custom responsive UI)

------------------------------------------------------------------------------------------------------

🚀 Features

✅ Core Functionality
Secure video upload & storage
Chunked video streaming with HTTP range requests
Real-time processing progress via WebSockets
AI-based video sensitivity analysis
Automatic video classification (safe / flagged)

-----------------------------------------------------------------------------------------------------

🔐 Security & Access Control

JWT-based authentication
Role-Based Access Control (RBAC)
Multi-tenant data isolation
Secure stream URLs (token-verified)

-----------------------------------------------------------------------------------------

👥 Roles & Permissions (RBAC)

| Role       | Permissions                                              |
| ---------- | -------------------------------------------------------- |
| **Viewer** | View video list, play only **safe** videos               |
| **Editor** | Upload videos, delete own org videos, play safe videos   |
| **Admin**  | Upload, delete any org video, preview **flagged** videos |

⚠️ Flagged videos
❌ Viewers & Editors cannot play flagged videos
✅ Admins can preview flagged videos for moderation

-----------------------------------------------------------------------------------------

🏢 Multi-Tenant Isolation

Each user belongs to a tenant (organization): org1, org2, org3
Videos are strictly isolated per tenant
Users within the same tenant can see shared content
Cross-tenant access is fully blocked
Example:
editor@org1 ❌ cannot see videos from org2
admin@org1 ❌ cannot manage users/videos from org2

-----------------------------------------------------------------------------------------

🧠 AI Content Moderation Pipeline

Video uploaded
Frames extracted using FFmpeg
Frames sent to Python AI service
Sensitivity score calculated per frame
Final classification:
safe → playable
flagged → restricted
Real-time progress updates are pushed via Socket.IO.

-----------------------------------------------------------------------------------------

🎬 Video Processing Pipeline

Upload

     Client uploads video → Cloudinary

Processing

     FFmpeg extracts frames

     Frames sent to AI service (/analyze)

Classification

     Sensitivity score computed

     Status updated: safe or flagged

Live Updates

     Socket.IO pushes progress to dashboard

Streaming

     Secure playback via token-based stream URL

-----------------------------------------------------------------------------------------

🔑 Environment Variables

Backend
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

AI Service
AI_PORT=5001

-----------------------------------------------------------------------------------------

📌 API Endpoints (Highlights)

Method	Endpoint	Description
POST	/api/auth/login	Login
POST	/api/auth/register	Register (viewer/editor only)
POST	/api/videos/upload	Upload video
GET	/api/videos	List videos (tenant-scoped)
GET	/api/videos/play/:id	Secure play URL
GET	/api/videos/stream/:id	Stream video
DELETE	/api/videos/:id	Delete video (admin/editor)

-----------------------------------------------------------------------------------------

🧪 Demo Accounts

| Role   | Email                                     | Password    | Tenant |
| ------ | ----------------------------------------- | ----------- | ------ |
| Admin  | [admin@org1.com](mailto:admin@org1.com)   | password123 | org1   |
| Editor | [editor@org1.com](mailto:editor@org1.com) | password123 | org1   |
| Viewer | [viewer@org1.com](mailto:viewer@org1.com) | password123 | org1   |

-----------------------------------------------------------------------------------------

🌱 Future Enhancements (Planned)

Advanced video filtering (date, size, duration)
Video compression & adaptive streaming
CDN integration
User management dashboard
Audit logs for admin actions

-----------------------------------------------------------------------------------------

✅ Status

✔ All functional requirements satisfied
✔ Clean architecture & secure design
✔ Ready for deployment & demo

-----------------------------------------------------------------------------------------