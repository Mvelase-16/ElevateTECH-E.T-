# Feature to Requirements Mapping

---

## Feature: User Registration and Authentication

- **Functional Requirements:**
  - Students and staff must be able to register using their campus email address.
  - Users must be able to log in with a username and password.
  - The system must support role-based access (student, vendor, admin).
  - Users must be able to reset their password via email.

- **Non-Functional Requirements:**
  - Login and registration must complete within 3 seconds under normal load.
  - The system must comply with data protection standards for storing personal information.

---

## Feature: Restaurant Stall Listing and Menu Management

- **Functional Requirements:**
  - Vendors must be able to create and edit their stall profile including name, location, and operating hours.
  - Vendors must be able to add, update, and remove menu items with names, prices, and images.
  - Vendors must be able to mark items as available or sold out.

- **Non-Functional Requirements:**
  - Menu updates must reflect on the student-facing view within 5 seconds.
  - The system must support a minimum of 50 active vendor listings simultaneously.

---

## Feature: Food Ordering and Cart Management

- **Functional Requirements:**
  - Students must be able to browse menus and add items to a food cart.
  - Students must be able to view, edit, and remove items from the cart before checkout.
  - Students must be able to place an order with a single confirmation action.

- **Non-Functional Requirements:**
  - The system must be able to handle many orders at the same time

---

## Feature: Payment Integration

- **Functional Requirements:**
  - The system must support payment via card, mobile payment, and cash-on-collection selection.
  - The system must generate an order confirmation and receipt upon successful payment.
  - Failed payments must notify the user with an appropriate error message.

- **Non-Functional Requirements:**
  - Payment transactions must be processed within 5 seconds.
  - All payment data must be encrypted.

---

## Feature: Order Tracking and Pickup Notifications

- **Functional Requirements:**
  - Students must receive real-time status updates: Order Received, In Progress, Ready for Collection.
  - Vendors must be able to update order status from their dashboard.
  - The system must send a push notification or SMS when an order is marked as ready.

- **Non-Functional Requirements:**
  - Notifications must be delivered within 10 seconds of a status change.

---

## Feature: Ratings and Reviews

- **Functional Requirements:**
  - Students must be able to submit a rating (1–5 stars) and written review after order completion.
  - Ratings must be visible on the vendor's public profile.
  - Admin must be able to remove reviews that violate platform policies.

- **Non-Functional Requirements:**
  - Reviews must be submitted and displayed within 3 seconds.
  - The system must prevent duplicate reviews from the same student for the same order.

---

## Feature: Admin Panel for Vendor Management

- **Functional Requirements:**
  - Admins must be able to view all vendor registration requests and approve or reject them.
  - Admins must be able to suspend or permanently remove a vendor listing.
  - Admins must be able to view aggregated platform usage reports.

- **Non-Functional Requirements:**
  - The admin dashboard must load within 4 seconds.
  - All admin actions must be logged with a timestamp and admin ID for audit purposes.
