# Daily Stand-ups Log

## Stand-up: May 08, 2026

* **Nikelwa Sophazi (Product Owner)**
    * **Yesterday:** Confirmed that Phase 4 architecture feedback was integrated.
    * **Today:** Reviewing the updated user stories to ensure the menu retrieval workflow aligns with our user personas (specifically Nandi's workload requirements).
    * **Blockers:** None.
* **Ayanda Mthembu (Scrum Master / Frontend Developer)**
    * **Yesterday:** Generated trackable milestone issues on the GitHub Project Board based on our component decomposition map.
    * **Today:** Setting up the core React Native boilerplate and starting on the homepage layout wireframes.
    * **Blockers:** Waiting on David to finalize the root project directory structure so I can push my frontend files.
* **David Maleka (Backend Developer)**
    * **Yesterday:** Started setting up the dual-repository directory structure for the Node.js backend and React Native frontend.
    * **Today:** Completing the environment configurations (`.env`, database connection scripts) and unblocking Ayanda.
    * **Blockers:** Ran into a minor npm dependency clash between Expo and Express configurations, but I am resolving it now.
* **Liyabona Miya (UI/UX & Database Designer)**
    * **Yesterday:** Migrated our initial Figma UI concepts into structural database data fields.
    * **Today:** Drafting the MySQL schema design for the `menu_items` and `orders` tables.
    * **Blockers:** None.
* **Lwando Zimase (Research)**
    * **Yesterday:** Reviewed backend deployment constraints for our upcoming Render/AWS environments.
    * **Today:** Assisting Liyabona by validating data types for the menu pickup time-slots to prevent logical conflicts down the line.
    * **Blockers:** None.
* **Ntandoyenkosi Mncube (QA & Documentation)**
    * **Yesterday:** Finalized the structural verification of our architectural visuals folder.
    * **Today:** Setting up Postman workspaces and writing basic test cases for user authentication and menu browsing constraints.
    * **Blockers:** None.

---

## Stand-up: May 11, 2026

* **Nikelwa Sophazi (Product Owner)**
    * **Yesterday:** Monitored project tracking boards and verified requirements mapping compliance.
    * **Today:** Reviewing Liyabona’s finalized database schema to ensure it handles all transactional data points for student meal pre-orders.
    * **Blockers:** None.
* **Ayanda Mthembu (Scrum Master / Frontend Developer)**
    * **Yesterday:** Pushed the initial homepage UI layout and component files to GitHub.
    * **Today:** Starting work on the Menu Display interface component in React Native.
    * **Blockers:** Need the backend API endpoints to know how to map the menu array structure, so I'm currently using mock data.
* **David Maleka (Backend Developer)**
    * **Yesterday:** Completed the shared repository foundation and verified local server environments.
    * **Today:** Collaborating with Liyabona to initialize the local MySQL database instance and test connection pools.
    * **Blockers:** None.
* **Liyabona Miya (UI/UX & Database Designer)**
    * **Yesterday:** Completed the physical database schema for menu and orders.
    * **Today:** Moving the task to *Review* on GitHub and starting on the backend API implementation to retrieve food menu items from MySQL.
    * **Blockers:** None.
* **Lwando Zimase (Research)**
    * **Yesterday:** Monitored team workflow distribution and verified issue updates on the Kanban board.
    * **Today:** Researching efficient connection-pooling mechanisms in Node-MySQL to prevent server lag during peak lunch rush hours.
    * **Blockers:** None.
* **Ntandoyenkosi Mncube (QA & Documentation)**
    * **Yesterday:** Drafted API testing matrices based on the feature breakdown list.
    * **Today:** Reviewing Liyabona's database documentation and preparing the automated test environments.
    * **Blockers:** None.

---

## Stand-up: May 12, 2026

* **Nikelwa Sophazi (Product Owner)**
    * **Yesterday:** Approved the structural DB schema.
    * **Today:** Refining the Sprint 2 backlog priorities based on current development speed.
    * **Blockers:** None.
* **Ayanda Mthembu (Scrum Master / Frontend Developer)**
    * **Yesterday:** Built out the static Menu Display view with filter states.
    * **Today:** Continuing on the frontend interface; will pair up with David to start the backend API integration once his endpoints are pushed.
    * **Blockers:** Awaiting final API endpoint routes from the backend team.
* **David Maleka (Backend Developer)**
    * **Yesterday:** Initialized the database tables and successfully seeded test cafeteria menu items.
    * **Today:** Setting up API routing controllers and preparing to implement integration middleware.
    * **Blockers:** Blocked on integration tasks until Liyabona completes and pushes the menu retrieval API endpoint code.
* **Liyabona Miya (UI/UX & Database Designer)**
    * **Yesterday:** Worked on coding the GET menu items endpoint logic.
    * **Today:** Facing a routing error code 500 when fetching records from the MySQL container; debugging the SQL query syntax and connection handling right now.
    * **Blockers:** Trapped on this database query error; going to hop on a quick Discord call with David after this stand-up to resolve it.
* **Lwando Zimase (Research)**
    * **Yesterday:** Shared documentation on Express exception handling patterns.
    * **Today:** Helping Ntando map out boundary test limits for the checkout pickup windows.
    * **Blockers:** None.
* **Ntandoyenkosi Mncube (QA & Documentation)**
    * **Yesterday:** Began smoke-testing the UI components locally to ensure responsive layout behavior.
    * **Today:** Waiting on the backend API bug to be patched so I can begin testing data collection flows in Postman.
    * **Blockers:** Blocked by Liyabona’s backend API bug.
