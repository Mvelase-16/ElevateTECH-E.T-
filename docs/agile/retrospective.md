# Sprint 1 Retrospective

## 1. Sprint Review
**Date:** May 15, 2026  
**Sprint Focus:** Repository initialization, system architecture baseline, and core menu foundation setup.

### Completed Deliverables & Tasks:
* **Product Backlog & Vision Baseline:** Formally mapped core system requirements tailored to Walter Sisulu University campus constraints.
* **UI/UX Wireframes:** Completed initial Figma wireframes for the core student homepage layout.
* **Shared Environment Setup:** Initialized the project repository structure with configured environment files (`.env`) for both frontend and backend development layers.
* **Database Architecture:** Designed and verified the physical MySQL schema for the core `menu_items` and `orders` tables.
* **Interface Skeleton:** Developed the static React Native Menu Display component and successfully seeded sample cafeteria menu records to test database connectivity.

### Sprint Demo Summary:
The team demonstrated a working prototype of the React Native interface fetching and displaying local mock menu items, showcasing how students will view available daily meals to avoid long cafeteria queues.

---

## 2. Retrospective Analysis

### What Went Well
* **Consistent Async Communication:** Daily WhatsApp check-ins at 8:00 AM kept the team aligned on immediate daily tasks and blocked dependencies without needing excessive formal meetings.
* **Architectural Alignment:** The Layered Architecture approach approved during our design phase gave developers a clear separation of concerns, allowing backend and frontend structural tasks to run in parallel.
* **Proactive Collaborative Problem-Solving:** When development hit technical friction (such as the MySQL connection error 500 during API routing logic implementation), members actively paired up on Teams/Discord to debug and unblock the pipeline.

### What Could Be Improved
* **Dependency Slippage:** Frontend API integration tasks were pushed right to the end of the sprint timeline due to unexpected backend query debugging delays, leaving a very tight window for testing.
* **Granular Issue Tracking:** While GitHub commits were consistent, several commits lacked clear issue links, making it harder to track task progression automatically on the Kanban project board columns.
* **Postman Test Syncing:** The QA environment setup lacked shared workspaces early on, meaning test matrices had to be manually synced across team members.

---

## 3. Action Items & Process Optimizations
To optimize team velocity and collaboration for Sprint 2, the team has committed to the following action items:

* [ ] **Enforce Strict Commit Rules:** Every team member must explicitly reference its corresponding GitHub Issue ID (e.g., `git commit -m "feat: #12 setup express router"`) to ensure the project board updates automatically.
* [ ] **Establish Mid-Sprint Tech Syncs:** Introduce a brief, mandatory 15-minute technical check-in halfway through the sprint window to identify integration blockages early before they impact QA timeline windows.
* [ ] **Initialize Shared Postman Collections:** Set up a centralized, shared Postman team workspace to instantly distribute API testing routes as soon as backend controllers are implemented.

---

## 4. High-Level Forward Planning (Sprint 2 Focus)
In the upcoming sprint cycle, the team will transition from foundational setup to active transactional functionality:
1. **Interactive Cart & Order Selection:** Developing the dynamic meal selection UI forms.
2. **Order Submission API Infrastructure:** Coding backend Express endpoints to write active order payloads to the MySQL database.
3. **Queue Mitigation Logic:** Implementing the core time-slot booking allocation algorithms to effectively spread out pickup traffic.
