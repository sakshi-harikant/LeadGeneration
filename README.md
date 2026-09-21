<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0E1A,50:3457E0,100:6C8BFF&height=210&section=header&text=LeadGen&fontSize=78&fontColor=ffffff&animation=twinkling&fontAlignY=40&desc=Discover.%20Verify.%20Connect.&descAlignY=62&descSize=19" width="100%"/>

<br/>

<img src="https://api.iconify.design/lucide:radar.svg?color=%236C8BFF&width=64"/>

<br/><br/>

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=600&size=20&duration=2600&pause=900&color=6C8BFF&center=true&vCenter=true&width=700&lines=Discover+professional+contacts;Verify+email+addresses;Manage+your+leads+in+one+place" />

<br/><br/>

**A full-stack B2B lead generation platform for discovering, verifying, and managing professional leads.**

</div>

---

## 🎯 What is LeadGen?

LeadGen simplifies the process of finding professional contacts from companies.

Enter a **company, domain, and keywords**, discover relevant contacts, verify their email information, and manage the results from one dashboard.

```text
Company + Domain + Keywords
              ↓
       Lead Discovery
              ↓
      Email Verification
              ↓
        Lead Dashboard
              ↓
         CSV Export
```

---

## ✨ Features

<table>
<tr>

<td width="50%" valign="top">

### 🔍 Lead Discovery

Find professional contacts using:

- Company name
- Domain
- Keywords
- Job titles

</td>

<td width="50%" valign="top">

### ✅ Email Verification

Check discovered email addresses and view their verification status.

</td>

</tr>

<tr>

<td width="50%" valign="top">

### 📊 Lead Dashboard

- Search leads
- Filter results
- View lead information
- Track lead statistics

</td>

<td width="50%" valign="top">

### 📥 Export

Export collected leads as **CSV** for further analysis or CRM use.

</td>

</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,python,fastapi,mongodb,git,github&theme=dark&perline=9"/>

<br/><br/>

| Frontend | Backend | Database |
|:---:|:---:|:---:|
| React | Python + FastAPI | MongoDB Atlas |
| Vite | REST API | PyMongo |
| Tailwind CSS | JWT | |

</div>

### 🔗 APIs & Services

**Hunter.io** · **Apollo.io** · **SendGrid**

---

## 🏗️ Architecture

```mermaid
flowchart LR

    U[👤 User] --> F[⚛️ React]
    F --> B[⚡ FastAPI]

    B --> H[🔍 Hunter.io]
    B --> A[📞 Apollo.io]
    B --> S[📧 SendGrid]

    B --> M[(🍃 MongoDB Atlas)]

    M --> D[📊 Lead Dashboard]
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
MONGODB_URI=your_mongodb_uri
HUNTER_API_KEY=your_hunter_api_key
APOLLO_API_KEY=your_apollo_api_key
JWT_SECRET_KEY=your_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

> 🔒 Keep API keys and database credentials private. Never commit `.env` files.

---

## 📁 Project Structure

```text
LeadGeneration/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md
```

---

<div align="center">

### LeadGen

**Discover. Verify. Connect.**

</div>
