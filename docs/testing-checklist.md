# FoodRush Testing Checklist

Use this checklist to verify all MVP functionality before submission or deployment.

## Environment Setup

- [ ] Docker PostgreSQL container is running (`docker compose up -d`)
- [ ] Backend starts on `http://localhost:3001/api`
- [ ] Frontend starts on `http://localhost:3000`
- [ ] Seed data loaded (`npm run seed` in backend)
- [ ] `GROQ_API_KEY` configured for chatbot tests

## Authentication

### Registration

- [ ] Customer can register with email, password, and name
- [ ] Restaurant owner can register with role `restaurant`
- [ ] Duplicate email returns error
- [ ] Password under 6 characters is rejected
- [ ] Invalid email format is rejected
- [ ] `access_token` cookie is set after registration
- [ ] User is redirected/logged in after registration

### Login

- [ ] Valid credentials log in successfully
- [ ] Invalid password returns 401
- [ ] Unknown email returns 401
- [ ] `access_token` cookie is set after login
- [ ] Navbar reflects logged-in user

### Logout

- [ ] Logout clears session
- [ ] Protected pages redirect after logout
- [ ] `access_token` cookie is removed

### Profile

- [ ] `GET /auth/me` returns current user when authenticated
- [ ] `GET /auth/me` returns 401 when not authenticated

## Customer Flow

### Browse Restaurants

- [ ] Home page lists all restaurants
- [ ] Search filters by name and cuisine
- [ ] Restaurant cards link to detail page
- [ ] Empty state shown when no results

### Restaurant Details

- [ ] Restaurant info displays (name, cuisine, address)
- [ ] Menu items load and display with prices
- [ ] Unavailable items are marked or hidden appropriately
- [ ] Add to cart works for available items

### Cart

- [ ] Cart shows added items with quantities
- [ ] Quantity increase/decrease works
- [ ] Remove item works
- [ ] Total price calculates correctly
- [ ] Cannot mix items from different restaurants
- [ ] Empty cart shows appropriate message
- [ ] Unauthenticated users redirected to login

### Place Order

- [ ] Order requires delivery address
- [ ] Order places successfully with valid data
- [ ] Cart clears after successful order
- [ ] Redirect to order detail page
- [ ] Unavailable items rejected at order time

### Track Orders

- [ ] My Orders page lists customer orders
- [ ] Order detail shows status, items, and total
- [ ] Status updates reflect when restaurant advances order
- [ ] Status badge colors match order state

## Restaurant Dashboard

### Access Control

- [ ] Only `restaurant` role can access `/dashboard`
- [ ] Customers and admins redirected away

### Restaurant Setup

- [ ] New restaurant owner can create restaurant profile
- [ ] Form validates required name field

### Menu Management

- [ ] List all menu items for owned restaurant
- [ ] Create new menu item with name and price
- [ ] Edit existing menu item
- [ ] Delete menu item
- [ ] Toggle availability (isAvailable)
- [ ] Cannot manage another restaurant's menu

### Order Management

- [ ] Incoming orders display with customer info
- [ ] Active vs past orders separated correctly
- [ ] Advance status: pending → confirmed → preparing → ready → delivered
- [ ] Cancel pending orders
- [ ] Invalid status transitions rejected

## Admin Dashboard

### Access Control

- [ ] Only `admin` role can access `/admin`
- [ ] Other roles redirected away

### Order Monitoring

- [ ] All platform orders visible
- [ ] Stats show active, delivered, cancelled counts
- [ ] Order details show restaurant, customer, amount

### Cancel Orders

- [ ] Admin can cancel pending orders
- [ ] Admin cannot advance order through workflow (only cancel)
- [ ] Cancelled orders appear in past orders section

## Chatbot

### Access

- [ ] Authenticated users can access `/chatbot`
- [ ] Unauthenticated users redirected to login

### Food Discovery

- [ ] "Where can I get biryani?" returns relevant dishes/restaurants
- [ ] "Show restaurants serving pizza" searches menu data
- [ ] Recommendations reference real menu items from database
- [ ] Message history displays in chat UI
- [ ] Loading state shown while waiting for response

### Out of Scope (must be rejected or redirected)

- [ ] "Cancel my order" — redirect to orders section
- [ ] "Process my payment" — redirect message
- [ ] "What's the weather?" — redirect message
- [ ] General non-food questions — redirect message

## API Testing (Postman / curl)

- [ ] All auth endpoints work per [api-specification.md](./api-specification.md)
- [ ] Public restaurant/menu endpoints work without auth
- [ ] Protected endpoints return 401 without cookie
- [ ] Role-restricted endpoints return 403 for wrong role
- [ ] Validation errors return 400 with message

## Security

- [ ] Passwords not returned in API responses
- [ ] JWT not exposed in response body (cookie only)
- [ ] CORS allows frontend origin with credentials
- [ ] Restaurant owners cannot access other restaurants' orders
- [ ] Customers cannot access restaurant admin endpoints

## Database

- [ ] Tables created (users, restaurants, menu_items, orders, order_items)
- [ ] Foreign keys enforce relationships
- [ ] Migrations run successfully in production mode
- [ ] Seed script creates demo accounts without errors on re-run

## UI / UX

- [ ] Responsive layout on mobile and desktop
- [ ] Navbar shows role-appropriate links
- [ ] Toast notifications for success/error actions
- [ ] Loading spinners on data-fetching pages
- [ ] Status badges readable and color-coded

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@foodrush.com` | `admin123` |
| Restaurant | `restaurant@foodrush.com` | `rest123` |
| Customer | `customer@foodrush.com` | `cust123` |

## End-to-End Scenario

Complete this full flow without errors:

1. [ ] Login as customer (`customer@foodrush.com`)
2. [ ] Browse restaurants and open Biryani House
3. [ ] Add Chicken Biryani and Garlic Naan to cart
4. [ ] Place order with delivery address
5. [ ] View order on My Orders with `pending` status
6. [ ] Logout and login as restaurant (`restaurant@foodrush.com`)
7. [ ] Confirm order on dashboard
8. [ ] Advance through preparing → ready → delivered
9. [ ] Logout and login as customer — verify `delivered` status
10. [ ] Use chatbot to ask "What biryani options are available?"
11. [ ] Login as admin — verify order appears in admin dashboard
