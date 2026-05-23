# System Decomposition


## Modules
The UniBites application is decomposed into six core operational modules that run across our layered architecture architecture boundaries:

- Authentication
- Menu / Catalog Management
- Cart Management
- Order & Transaction Processing
- Notification & Alert Services
- Vendor Management & Analytics
  

## Component Responsibilities
Each component has dedicated structural responsibilities within our Node.js and Express business logic server layer to maintain strict separation of concerns:

- **Authentication:** Handles user login and authentication workflows. Manages secure login sessions, role-based application access privileges, and encrypted password reset routines.

- **Menu / Catalog Management:** Displays available food items, supports search and filtering and allows vendors to execute CRUD operations to dynamically update meal listings or toggle stock status to sold out.

- **Cart Management:** Manages the client-side selection array cache before order commitment and supports adding items, removing items, updating piece quantities, and computing live price summaries.

- **Order & Transaction Processing:** Processes secure checkout validation routines and integrates cashless transaction gateway tokens. it also engineered the core queue-mitigation booking logic by writing order payloads to strict, capacity-limited pickup time slots within the database layer.

- **Notification & Alert Services:** Triggers live order status monitoring updates across the network interface. Dispatches real-time automated push notifications or SMS alerts to consumer devices the moment a kitchen worker flags a meal as "Ready for Collection."

- **Vendor Management & Analytics:**  Manages student-submitted vendor ratings, qualitative meal reviews, and automated administrative feedback tracking metricsa and supports high-level platform administration dashboard for reviewing new stall registration approvals. Tracks daily sales entries, calculates vendor performance data, and logs historical platform usage metrics for audit validation.

 
