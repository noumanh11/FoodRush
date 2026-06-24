# FoodRush API Specification

Base URL: `http://localhost:3001/api`

All authenticated endpoints require a valid JWT in the `access_token` HTTP-only cookie (set automatically on login/register) or as `Authorization: Bearer <token>`.

## Authentication

### Register

```
POST /auth/register
```

**Auth:** None

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+92 300 1234567",
  "role": "user"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Min 6 characters |
| `name` | string | Yes | Display name |
| `phone` | string | No | Contact number |
| `role` | string | No | `user`, `restaurant`, or `admin` (default: `user`) |

**Response `200`:**

```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "phone": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Sets `access_token` cookie.

---

### Login

```
POST /auth/login
```

**Auth:** None

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`:**

```json
{
  "message": "Login successful",
  "user": { ... }
}
```

Sets `access_token` cookie.

---

### Logout

```
POST /auth/logout
```

**Auth:** Required

**Response `200`:**

```json
{
  "message": "Logged out successfully"
}
```

Clears `access_token` cookie.

---

### Current User Profile

```
GET /auth/me
```

**Auth:** Required

**Response `200`:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "phone": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Restaurants

### List All Restaurants

```
GET /restaurants
```

**Auth:** None

**Response `200`:** Array of restaurant objects.

```json
[
  {
    "id": "uuid",
    "name": "Biryani House",
    "description": "Best biryani in town",
    "cuisine": "Pakistani",
    "address": "Karachi",
    "phone": "+92 300 0000000",
    "imageUrl": null,
    "isOpen": true,
    "rating": null,
    "ownerId": "uuid",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### Get Restaurant Details

```
GET /restaurants/:id
```

**Auth:** None

**Response `200`:** Single restaurant object.

**Response `404`:** Restaurant not found.

---

### Get My Restaurant

```
GET /restaurants/my
```

**Auth:** Required — Role: `restaurant`

**Response `200`:** Restaurant owned by the authenticated user.

---

### Create Restaurant

```
POST /restaurants
```

**Auth:** Required — Role: `restaurant`

**Body:**

```json
{
  "name": "My Restaurant",
  "description": "Great food",
  "cuisine": "Fast Food",
  "address": "123 Main St",
  "phone": "+92 300 1111111",
  "imageUrl": "https://example.com/image.jpg"
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `description` | string | No |
| `cuisine` | string | No |
| `address` | string | No |
| `phone` | string | No |
| `imageUrl` | string | No |

**Response `201`:** Created restaurant object.

---

### Update Restaurant

```
PATCH /restaurants/:id
```

**Auth:** Required — Role: `restaurant` (owner) or `admin`

**Body:** Partial update — any fields from create.

**Response `200`:** Updated restaurant object.

---

## Menu

### Get Restaurant Menu

```
GET /restaurants/:restaurantId/menu
```

**Auth:** None

**Response `200`:** Array of menu items.

```json
[
  {
    "id": "uuid",
    "name": "Chicken Biryani",
    "description": "Fragrant basmati rice",
    "price": "350.00",
    "category": "Rice",
    "imageUrl": null,
    "isAvailable": true,
    "restaurantId": "uuid",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### Create Menu Item

```
POST /restaurants/:restaurantId/menu
```

**Auth:** Required — Role: `restaurant` (owner)

**Body:**

```json
{
  "name": "Chicken Biryani",
  "description": "Fragrant basmati rice",
  "price": 350,
  "category": "Rice",
  "imageUrl": "https://example.com/biryani.jpg",
  "isAvailable": true
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `price` | number | Yes |
| `description` | string | No |
| `category` | string | No |
| `imageUrl` | string | No |
| `isAvailable` | boolean | No (default: true) |

**Response `201`:** Created menu item.

---

### Update Menu Item

```
PATCH /menu/:id
```

**Auth:** Required — Role: `restaurant` (owner)

**Body:** Partial update — any fields from create.

**Response `200`:** Updated menu item.

---

### Delete Menu Item

```
DELETE /menu/:id
```

**Auth:** Required — Role: `restaurant` (owner)

**Response `204`:** No content.

---

## Orders

### Create Order

```
POST /orders
```

**Auth:** Required — Role: `user`

**Body:**

```json
{
  "items": [
    { "menuItemId": "uuid", "quantity": 2 },
    { "menuItemId": "uuid", "quantity": 1 }
  ],
  "deliveryAddress": "123 Street, Karachi",
  "notes": "No onions"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `items` | array | Yes | At least one item |
| `items[].menuItemId` | string | Yes | Valid menu item UUID |
| `items[].quantity` | number | Yes | Min 1 |
| `deliveryAddress` | string | No | Delivery address |
| `notes` | string | No | Special instructions |

**Rules:**

- All items must belong to the same restaurant
- Unavailable items are rejected

**Response `201`:** Created order with `items` array.

---

### Get My Orders

```
GET /orders/my
```

**Auth:** Required — Role: `user`

**Response `200`:** Array of orders with `restaurant` and `items` relations.

---

### Get Restaurant Orders

```
GET /orders/restaurant/:restaurantId
```

**Auth:** Required — Role: `restaurant` (owner)

**Response `200`:** Array of orders with `user` and `items` relations.

---

### Get All Orders (Admin)

```
GET /orders/admin/all
```

**Auth:** Required — Role: `admin`

**Response `200`:** Array of all orders with `user`, `restaurant`, and `items`.

---

### Get Order by ID

```
GET /orders/:id
```

**Auth:** Required

**Response `200`:** Order with `restaurant`, `items`, and `user` relations.

**Auth:** Required — caller must be the customer, restaurant owner, or admin for that order.

**Response `403`:** User cannot access this order.

**Response `404`:** Order not found.

---

### Cancel Order (Admin)

```
PATCH /orders/:id/cancel
```

**Auth:** Required — Role: `admin`

Cancels any order that is not already `delivered` or `cancelled`.

**Response `200`:** Updated order with `status: cancelled`.

**Alternative:** `PATCH /orders/:id/status` with `{ "status": "cancelled" }` (restaurant owners can cancel pending orders; admins can cancel active orders).

---

### Update Order Status

```
PATCH /orders/:id/status
```

**Auth:** Required — Role: `restaurant` or `admin`

**Body:**

```json
{
  "status": "confirmed"
}
```

**Allowed statuses:** `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`

**Restaurant transitions:**

| From | To |
|------|-----|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `preparing` |
| `preparing` | `ready` |
| `ready` | `delivered` |

**Admin:** Can only set status to `cancelled`.

**Response `200`:** Updated order.

---

## Chatbot

### Send Message

```
POST /chatbot/message
```

**Auth:** Required

**Body:**

```json
{
  "message": "Where can I get biryani?"
}
```

**Response `200`:**

```json
{
  "reply": "You can try Chicken Biryani at Biryani House for PKR 350..."
}
```

**Scope:** Food discovery only. Off-topic queries receive a redirect message.

**Behavior:**
- With valid `GROQ_API_KEY`: uses Groq `llama-3.1-8b-instant` with menu context.
- Without API key or on Groq failure: falls back to local keyword search over menu data.
- Message max length: 500 characters.

---

## Error Responses

All errors follow NestJS standard format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error or business rule violation |
| `401` | Missing or invalid authentication |
| `403` | Insufficient permissions |
| `404` | Resource not found |

---

## Endpoint Summary

| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | `/auth/register` | No | — |
| POST | `/auth/login` | No | — |
| POST | `/auth/logout` | Yes | Any |
| GET | `/auth/me` | Yes | Any |
| GET | `/restaurants` | No | — |
| GET | `/restaurants/my` | Yes | restaurant |
| GET | `/restaurants/:id` | No | — |
| POST | `/restaurants` | Yes | restaurant |
| PATCH | `/restaurants/:id` | Yes | restaurant, admin |
| GET | `/restaurants/:id/menu` | No | — |
| POST | `/restaurants/:id/menu` | Yes | restaurant |
| PATCH | `/menu/:id` | Yes | restaurant |
| DELETE | `/menu/:id` | Yes | restaurant |
| POST | `/orders` | Yes | user |
| GET | `/orders/my` | Yes | user |
| GET | `/orders/restaurant/:id` | Yes | restaurant |
| GET | `/orders/admin/all` | Yes | admin |
| GET | `/orders/:id` | Yes | Any |
| PATCH | `/orders/:id/cancel` | Yes | admin |
| PATCH | `/orders/:id/status` | Yes | restaurant, admin |
| POST | `/chatbot/message` | Yes | Any |

## Postman Collection

Import `docs/postman/FoodRush-API.postman_collection.json` for a ready-to-use collection with example requests.
