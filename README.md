<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:151923,50:5267C9,100:8EA7FF&height=165&section=header&text=LeadGen&fontSize=68&fontColor=ffffff&fontAlignY=42&desc=Discover.%20Verify.%20Connect.&descAlignY=65&descSize=18" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=26&duration=2500&pause=800&color=5267C9&center=true&vCenter=true&width=850&lines=Discover+professional+contacts;Verify+email+addresses;Manage+your+leads+in+one+place" />

<br/><br/>

<p>
<strong>LeadGen</strong> is a full-stack B2B lead generation platform that helps users discover professional contacts, verify email information, and manage leads from a centralized dashboard.
</p>

</div>

---

## 🎯 What It Does

Enter a **company name, domain, and keywords** to find relevant professional contacts and organize them in one place.

**LeadGen provides:**

- 🔍 **Lead Discovery** — Find professional contacts using company and domain information.
- ✅ **Email Verification** — Check discovered email addresses and their status.
- 📊 **Lead Management** — Search, filter, and manage collected leads.
- 📥 **CSV Export** — Export lead data for further use.

---

## 🛠️ Tech Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,python,fastapi,mongodb,git,github&theme=dark&perline=9"/>

</div>

| | Technologies |
|---|---|
| **Frontend** | React · Vite · Tailwind CSS · JavaScript |
| **Backend** | Python · FastAPI · REST API |
| **Database** | MongoDB Atlas · PyMongo |
| **Authentication** | JWT |
| **Integrations** | Hunter.io · Apollo.io · SendGrid |

---

## 🚀 Getting Started

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

Open **http://localhost:5173**

---

## ⚙️ Environment

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

> 🔒 Keep API keys and `.env` files private.

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

**LeadGen — Discover. Verify. Connect.**

</div>
