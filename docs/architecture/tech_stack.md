# Technology Stack

* **Frontend Framework**
  * JavaScript
  * React Native
  * Expo
* **Backend Framework**
  * Node.js
  * Express.js
* **Database Management System**
  * MySQL
* **Cloud Hosting**
  * Render
* **Deployment Platform**
  * Amazon Web Services (AWS)


---

# Justification

- Frontend Framework: Javascript + React Native + Expo
  
JavaScript was chosen because it is beginner-friendly, widely used in modern software development, and can be used for both frontend and backend development, allowing for language consistency in the entire project.

React Native is chosen to create a responsive and interactive user interface for the UniBites application. It allows the development of reusable components such as menus, order forms, and dashboards, which improves code maintainability. React Native also enhances the overall campus user experience by updating only necessary parts of the screen dynamically, making the application fast and user-friendly for busy students and staff.

Expo was chosen to simplify the React Native compilation process by providing developer tools for straightforward environment setup, testing, debugging, and cross-platform deployment, which is highly beneficial for a student project team like us.

---

- Backend Framework: Node.js + Express.js

Node.js with Express is suitable for UniBites because it efficiently handles multiple simultaneous requests using its asynchronous, non-blocking architecture. In a campus environment where hundreds of students and staff pre-orders at the exact same time, this runtime ensures fast server response times and smooth system performance. Express also simplifies the development and routing of the RESTful APIs needed for clean data communication between our frontend mobile views and backend data models.

---

-  Database Managemeny System : MySQL

MySQL is selected because UniBites requires structured, dependable data storage for user profiles, cafeteria menu items, and incoming order transactions. As a robust relational database management system, MySQL efficiently enforces relational integrity constraints and manages relationships between entities securely. It guarantees that financial order payloads are safely stored, and remains easily scalable for a growing number of user registrations across the university environment

---

- Cloud Hosting: Render

Render was chosen because it offers simple, lightweight cloud deployment and hosting services for modern web applications and web services. This enables our development team to deploy, manage, and test our live backend Express API endpoints online without getting bogged down by overly complex cloud infrastructure setups or manual server configuration pipelines.

---

- Deployment Platform: Amazon Web Services (AWS)

AWS is utilized to host our persistent data tier and handle media storage backups . While the Express API server runs on Render for rapid deployment loops , the production MySQL relational database is deployed via AWS cloud infrastructure to guarantee high availability, strict transactional security, and automated database backups during peak operational hours on campus . This multi-cloud separation ensures that if the web server experiences a temporary runtime crash, our underlying user, menu, and financial pre-order data records remain secure and uncorrupted.

---
# Summary

Our chosen full-stack architecture specifications are built on React Native, Node.js (Express), MySQL, Render hosting, and Amazon Web Services (AWS) cloud infrastructure. These choices are structurally justified by leveraging Node's non-blocking request handling for peak campus rush hours , React's responsive client-side component rendering, and MySQL's strict relational integrity for secure transaction tracking. Furthermore, we decouple our infrastructure to optimize team workflow and system resilience—utilizing Render's streamlined platform for rapid backend deployment cycle, while relying on AWS RDS to guarantee data persistence, automated structural backups, and high availability for our relational storage. Ultimately, this technical stack ensures that the UniBites system is efficient, scalable, secure, and easily maintainable for both campus consumers and kitchen administrators
