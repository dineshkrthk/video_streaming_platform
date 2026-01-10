-----------------------------------------------------------------------------------------
🎥 Secure Multi-Tenant Video Streaming Platform

A full-stack video streaming platform with AI-powered content moderation, secure video streaming, role-based access control, and multi-tenant isolation.
-----------------------------------------------------------------------------------------
🚀 Features

✅ Core Functionality
Secure video upload & storage
Chunked video streaming with HTTP range requests
Real-time processing progress via WebSockets
AI-based video sensitivity analysis
Automatic video classification (safe / flagged)
-----------------------------------------------------------------------------------------
🔐 Security & Access Control

JWT-based authentication
Role-Based Access Control (RBAC)
Multi-tenant data isolation
Secure stream URLs (token-verified)
-----------------------------------------------------------------------------------------
👥 Roles & Permissions (RBAC)

Role	Permissions
Viewer	View and stream safe videos only
Editor	Upload videos, view safe videos, delete own videos
Admin	View all videos (including flagged), upload, delete, tenant-level oversight
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
🧩 Tech Stack

Frontend
React + TypeScript
Vite
Socket.IO Client
CSS (custom responsive UI)

Backend
Node.js + Express
MongoDB + Mongoose
JWT Authentication
Multer (uploads)
FFmpeg (video processing)

AI Service
Python (Flask)
Open-source NSFW detection model
Frame-level analysis
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