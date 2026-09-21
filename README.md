<div align="center"><!-- 🚀 HERO BANNER --><img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0E1A,50:3457E0,100:6C8BFF&height=240&section=header&text=LeadGen&fontSize=90&fontColor=ffffff&animation=twinkling&fontAlignY=38&desc=Discover.%20Verify.%20Connect.&descAlignY=58&descSize=20" width="100%"/>
<!-- 🎯 LOGO --><img src="https://api.iconify.design/lucide:radar.svg?color=%236C8BFF&width=90" />
<!-- ⌨️ ANIMATED TYPING --><img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&duration=2800&pause=800&color=6C8BFF&center=true&vCenter=true&width=700&lines=Find+professional+contacts+at+any+company;Verify+every+email+before+you+send;Manage+all+your+leads+in+one+dashboard" />
<!-- 🏆 BADGES -->
<a href="https://github.com/sakshi-harikant/LeadGeneration/stargazers"><img src="https://img.shields.io/github/stars/sakshi-harikant/LeadGeneration?style=for-the-badge&logo=starship&color=3457E0&labelColor=0B0E1A&logoColor=FFD700"/></a>
<a href="https://github.com/sakshi-harikant/LeadGeneration/network/members"><img src="https://img.shields.io/github/forks/sakshi-harikant/LeadGeneration?style=for-the-badge&logo=git&color=6C8BFF&labelColor=0B0E1A&logoColor=white"/></a>
<a href="https://github.com/sakshi-harikant/LeadGeneration/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-17A34A?style=for-the-badge&logo=opensourceinitiative&labelColor=0B0E1A&logoColor=white"/></a>
<a href="https://github.com/sakshi-harikant/LeadGeneration"><img src="https://img.shields.io/badge/Status-Live-9B6BFF?style=for-the-badge&logo=rocket&labelColor=0B0E1A&logoColor=white"/></a>


🚀 A full-stack B2B lead generation platform that discovers contacts, verifies emails, and organizes leads — all in one dashboard.

</div>
<!-- 🎯 WHAT IT DOES --><div align="center">
🎯 What It Does
<table> <tr><td align="center" width="33%"> <br/> <img src="https://api.iconify.design/lucide:radar.svg?color=%236C8BFF&width=64"/> <br/><br/> <h3>🔍 DISCOVER</h3> Search any company domain and pull live professional contacts. <br/><br/> </td><td align="center" width="33%"> <br/> <img src="https://api.iconify.design/lucide:shield-check.svg?color=%2317A34A&width=64"/> <br/><br/> <h3>✅ VERIFY</h3> Every email tested — valid, invalid, risky, or unknown. <br/><br/> </td><td align="center" width="33%"> <br/> <img src="https://api.iconify.design/lucide:layout-dashboard.svg?color=%239B6BFF&width=64"/> <br/><br/> <h3>📊 MANAGE</h3> Search, filter, and export leads from one modern dashboard. <br/><br/> </td></tr> </table></div>
<!-- ⚡ FEATURES --><div align="center">
⚡ Key Features
<table> <tr><td width="50%" valign="top" align="left">
🔐  Secure Authentication
<img src="https://api.iconify.design/lucide:key-round.svg?color=%236C8BFF&width=20"/>  JWT signup, login, password reset via SendGrid.

🔍  Real-Time Discovery
<img src="https://api.iconify.design/lucide:search.svg?color=%236C8BFF&width=20"/>  Live contacts with names, titles, and emails.

✅  Email Verification
<img src="https://api.iconify.design/lucide:badge-check.svg?color=%2317A34A&width=20"/>  Confidence scores with status badges.

</td><td width="50%" valign="top" align="left">
📊  Live Dashboard
<img src="https://api.iconify.design/lucide:bar-chart-3.svg?color=%239B6BFF&width=20"/>  Real-time stats on leads and email quality.

📥  CSV / Excel Export
<img src="https://api.iconify.design/lucide:download.svg?color=%23D9A62B&width=20"/>  One-click export for analysis or CRM import.

🏢  20+ Pre-loaded Companies
<img src="https://api.iconify.design/lucide:building-2.svg?color=%23E24C4B&width=20"/>  Airbnb, Stripe, Shopify, Uber, Notion, and more.

</td></tr> </table></div>
<!-- 🛠️ TECH STACK --><div align="center">
🛠️ Tech Stack

<p> <img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,python,fastapi,mongodb,git,github&theme=dark&perline=9"/> </p>
<img src="https://img.shields.io/badge/Hunter.io-FF6B35?style=for-the-badge&logo=h&logoColor=white&labelColor=0B0E1A"/> <img src="https://img.shields.io/badge/Apollo.io-FF3D00?style=for-the-badge&logo=apollographql&logoColor=white&labelColor=0B0E1A"/> <img src="https://img.shields.io/badge/SendGrid-1A82E2?style=for-the-badge&logo=maildotru&logoColor=white&labelColor=0B0E1A"/></div>
<!-- 🏗️ ARCHITECTURE --><div align="center">
🏗️ Architecture
  graph LR
    A[⚛️ React<br/>Vercel] -->|REST API| B[⚡ FastAPI<br/>Render]
    B -->|PyMongo| C[(🍃 MongoDB<br/>Atlas)]
    B --> D[🔍 Hunter.io]
    B --> E[📞 Apollo.io]
    B --> F[📧 SendGrid]
    
    style A fill:#61DAFB,stroke:#0B0E1A,color:#000,stroke-width:2px
    style B fill:#009688,stroke:#0B0E1A,color:#fff,stroke-width:2px
    style C fill:#47A248,stroke:#0B0E1A,color:#fff,stroke-width:2px
    style D fill:#FF6B35,stroke:#0B0E1A,color:#fff,stroke-width:2px
    style E fill:#FF3D00,stroke:#0B0E1A,color:#fff,stroke-width:2px
    style F fill:#1A82E2,stroke:#0B0E1A,color:#fff,stroke-width:2px
</div>








<!-- 🚀 QUICK START --><div align="center">
🚀 Quick Start
</div>
bash
# 1️⃣ Clone
git clone https://github.com/sakshi-harikant/LeadGeneration.git
cd LeadGeneration

# 2️⃣ Backend
cd backend && python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3️⃣ Frontend (new terminal)
cd frontend && npm install && npm run dev
<div align="center">
🌐 Open  →  <a href="http://localhost:5173"><b>http://localhost:5173</b></a>
</div>
<!-- ⚙️ ENV --><div align="center">
⚙️ Environment Setup
</div><table align="center"> <tr> <th>📦 Backend — <code>backend/.env</code></th> <th>🎨 Frontend — <code>frontend/.env</code></th> </tr> <tr> <td>
env
MONGODB_URI=mongodb+srv://...
HUNTER_API_KEY=your_key
APOLLO_API_KEY=your_key
JWT_SECRET_KEY=your_secret
SENDGRID_API_KEY=your_key
</td> <td>
env
VITE_API_URL=http://localhost:8000
</td> </tr> </table>
<!-- 📡 API --><div align="center">
📡 Core API
<table> <tr> <th>Method</th> <th>Endpoint</th> <th>Description</th> </tr> <tr> <td><img src="https://img.shields.io/badge/POST-3457E0?style=flat-square"/></td> <td><code>/api/auth/signup</code></td> <td>Register user</td> </tr> <tr> <td><img src="https://img.shields.io/badge/POST-3457E0?style=flat-square"/></td> <td><code>/api/auth/login</code></td> <td>Login user</td> </tr> <tr> <td><img src="https://img.shields.io/badge/POST-3457E0?style=flat-square"/></td> <td><code>/api/leads/search/domain</code></td> <td>Search leads by domain</td> </tr> <tr> <td><img src="https://img.shields.io/badge/GET-17A34A?style=flat-square"/></td> <td><code>/api/leads/</code></td> <td>Get all leads (paginated)</td> </tr> <tr> <td><img src="https://img.shields.io/badge/GET-17A34A?style=flat-square"/></td> <td><code>/api/leads/stats</code></td> <td>Dashboard statistics</td> </tr> <tr> <td><img src="https://img.shields.io/badge/GET-17A34A?style=flat-square"/></td> <td><code>/api/leads/export/csv</code></td> <td>Export leads to CSV</td> </tr> </table></div>
<!-- 📊 STATS --><div align="center">
📊 Project Stats

<img src="https://img.shields.io/badge/⚡_BUILD_TIME-10_DAYS-6C8BFF?style=for-the-badge&labelColor=0B0E1A"/> <img src="https://img.shields.io/badge/📝_LINES_OF_CODE-5000+-9B6BFF?style=for-the-badge&labelColor=0B0E1A"/> <img src="https://img.shields.io/badge/🔌_API_ENDPOINTS-15+-17A34A?style=for-the-badge&labelColor=0B0E1A"/> <img src="https://img.shields.io/badge/📄_PAGES-9-D9A62B?style=for-the-badge&labelColor=0B0E1A"/> <img src="https://img.shields.io/badge/🏢_COMPANIES-20-E24C4B?style=for-the-badge&labelColor=0B0E1A"/>



</div>
<!-- 👩‍💻 AUTHOR --><div align="center">
👩‍💻 Author
<img src="https://api.iconify.design/lucide:user-circle-2.svg?color=%236C8BFF&width=72"/>
Sakshi Mohan Harikant

<a href="https://github.com/sakshi-harikant"> <img src="https://img.shields.io/badge/GitHub-0B0E1A?style=for-the-badge&logo=github&logoColor=6C8BFF&labelColor=0B0E1A"/> </a> &nbsp; <a href="mailto:sakshi.mohan@cmr.edu.in"> <img src="https://img.shields.io/badge/Email-0B0E1A?style=for-the-badge&logo=gmail&logoColor=E24C4B&labelColor=0B0E1A"/> </a></div>
<!-- 🎉 FOOTER --><div align="center">
<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=600&size=18&duration=2500&pause=900&color=6C8BFF&center=true&vCenter=true&width=600&lines=⭐+Star+this+repo+if+you+found+it+helpful!;Built+with+❤️+by+Sakshi;Discover.+Verify.+Connect." />
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6C8BFF,50:3457E0,100:0B0E1A&height=140&section=footer" width="100%"/></div>
✨ What Makes This README Dynamic
Element	What It Does
🎯 Radar Logo	Custom SVG icon as your brand mark
⌨️ Typing Animation	Animated headline that cycles through taglines
🏆 Live Badges	Stars, forks, license auto-update from GitHub
🎨 Iconify Icons	Premium 3D-style Lucide icons (Discover/Verify/Manage)
📊 Mermaid Diagram	Interactive architecture flow
🌊 Animated Wave Headers	Gradient capsule-render banners
💫 Emoji Section Anchors	Visual navigation
📈 Skill Icons	9 tech logos in one clean strip
Copy this directly into your README.md. Every icon, logo, and animation is embedded via URLs — no files needed. 🚀

