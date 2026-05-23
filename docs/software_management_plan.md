# Software Product Management Plan: UniBites

## Team Members & Roles
To ensure clear ownership and seamless development pipelines, our 6-person team roles are defined as follows:

- Product Owner: [Nikelwa Sophazi] - Prioritizes and owns backlog.
- Scrum Master & Frontend Developer: [Ayanda Mthembu] - Facilitates ceremonies & removes development blockers then builds and deploy features..
- Backend Developer: [David Maleka ] - Constructs the core server architecture using Node.js and Express
- Designer: [Liyabona Miya] - Design interactive user interfaces & high fidelity wireframes.
- Tester: [Ntandoyenkosi Mncube] - Checks software for bugs and ensures it works correctly before it is released to users.
- Researcher: [Lwando Zimase] - Investigates technologies, methods, and requirements to support the design, development, and improvement of software systems.

## Project Timeline
The 12-week development lifecycle is divided into six distinct 2-week sprints to maintain a sustainable delivery cadence:

| Milestone | Task | Deadline |
| :--- | :--- | :--- |
| Sprint 1 | Foundation (Auth & Menu Browsing) : Repo setup, environment configuration, core MySQL schema design, and local server integration. | Weeks 1–2 |
| Sprint 2 | Ordering (Cart & Time Slots) : Cart form UI development, transactional POST APIs, and time-slot booking allocation logic. | Weeks 3–4 |
| Sprint 3 | Order Management : Live kitchen ticket dashboards, vendor status toggle middleware, and multi-user sync. | Weeks 5–6 |
| Sprint 4 | Polish & Extras : Real-time push notification bubbles, historic order logs, and custom styling updates. |Weeks 7–8 |
| Sprint 5 | Testing & UAT : Postman stress testing, boundary environment validation, and campus user simulation. | Weeks 9–10 |
| Sprint 6 | Launch & Documentation : Live server hosting setup, technical user manual compilation, and code sign-offs.| Weeks 11–12 | 

## Risk Management 
To prevent project slippage, the team has formulated structural mitigation strategies for primary risks:

 **Risk 1: Team Member Unavailability or Skill Gaps**
     Enforce micro-task sizing on GitHub Issues so no single item takes more than 6 hours. Maintain a cross-training framework where David (Backend) and Ayanda (Frontend) document code comments comprehensively, allowing rapid task hand-offs if someone becomes unavailable.
     
 **Risk 2: Technical Integration Errors & Blocker Slippage**
     Mandate brief, mid-sprint technical check-ins to catch API contract failures early. Developers must run local validation checks before submitting pull requests to ensure main-branch builds are never broken.
     
 **Risk 3: Unrealistic Time Estimation for Feature Implementation**
     Implement a conservative sizing policy where historical task times are referenced. If a core API endpoint takes longer than anticipated, lower-priority backlog features (e.g., promotional codes) are automatically deferred to later sprints.

## Technology Stack
Our architectural layers were chosen specifically to handle the high-concurrency demands of campus rush hours:

 **Frontend Framework: React Native**
     Allows us to develop a highly responsive UI with smooth state management. Components render quickly, which is critical for students rushing to check meal statuses between lectures.
     
 **Backend Framework: Node.js with Express**
     Node's asynchronous, event-driven, non-blocking I/O model makes it highly efficient for handling hundreds of simultaneous user pre-orders during peak campus lunch hours (12:00–13:00).
     
 **Database Management System: MySQL**
     Relational database structure enforces strict data integrity constraints. This guarantees that student financial/order transactions are secure and that time-slot booking records do not experience race conditions.
     
 **Cloud Hosting & Deployment: Render & Amazon Web Services (AWS)**
     We decouple our environments by hosting the Express API instance on Render for low-latency web access, while leveraging AWS infrastructure to guarantee high availability and transactional data persistence.
