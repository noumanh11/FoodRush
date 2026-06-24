# FoodRush - Project Requirements

## Overview

FoodRush is a food ordering platform built using Next.js, NestJS, PostgreSQL, TypeScript, and the Groq API.

The objective is to deliver a complete end-to-end application that supports three user roles (Customer, Restaurant, and Admin) along with an AI-powered food discovery chatbot.

The implementation should focus on clean architecture, maintainable code, proper authentication and authorization, and a fully functional user experience.

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

## Backend

* NestJS
* TypeScript
* TypeORM
* PostgreSQL

## Authentication

* JWT Authentication
* HTTP-only Cookies
* Role-Based Access Control (RBAC)

## AI Integration

* Groq API

---

# User Roles

## Customer

Customers can:

* Register and login
* Browse restaurants
* View restaurant menus
* Place orders
* Track order status

### Customer Flow

Browse Restaurants

→ Select Restaurant

→ View Menu

→ Add Items

→ Place Order

→ Track Status

---

## Restaurant

Restaurant users can manage their business data and incoming orders.

### Restaurant Features

#### Menu Management

* Create menu items
* Update menu items
* Delete menu items
* View all menu items

#### Order Management

View incoming orders and update their status.

Supported statuses:

* Pending
* Confirmed
* Preparing
* Ready
* Delivered

### Restaurant Dashboard

The dashboard should provide:

* Menu management
* Order management
* Status updates

---

## Admin

Admins have system-wide control.

### Admin Features

* View all orders
* Monitor platform activity
* Cancel any order

### Admin Dashboard

The dashboard should provide:

* Global order visibility
* Order cancellation controls

---

# Chatbot Requirements

The chatbot is strictly a food discovery assistant.

Its purpose is to help users discover food and restaurants from existing menu data.

---

## Supported Queries

Examples:

* Where can I get biryani?
* Show restaurants serving pizza.
* Find burgers near me.
* What restaurants have pasta?

---

## Chatbot Behavior

The chatbot must:

* Search menu items
* Search restaurant data
* Return relevant restaurants
* Return relevant dishes

---

## Out of Scope

The chatbot must NOT:

* Place orders
* Cancel orders
* Handle complaints
* Process payments
* Answer unrelated questions
* Act as a general-purpose AI assistant

---

# Backend Requirements

## Authentication Module

Implement:

* User Registration
* User Login
* User Logout
* Current User Profile

Security Requirements:

* Password hashing
* JWT authentication
* HTTP-only cookies
* Role-based authorization

---

## Restaurant Module

Implement:

* Create restaurant
* List restaurants
* Get restaurant details
* Update restaurant information

---

## Menu Module

Implement:

* Create menu item
* Get menu items
* Update menu item
* Delete menu item

---

## Orders Module

Implement:

* Create order
* Get user orders
* Get restaurant orders
* Update order status
* Cancel order

---

## Chatbot Module

Implement:

* Chat endpoint
* Menu search functionality
* Restaurant recommendation functionality
* Groq integration

---

# Frontend Requirements

## Authentication Pages

* Login Page
* Registration Page

---

## Customer Pages

* Home Page
* Restaurant Listing Page
* Restaurant Details Page
* Cart Page
* Orders Page

---

## Restaurant Dashboard

Provide interfaces for:

* Menu Management
* Order Management
* Status Updates

---

## Admin Dashboard

Provide interfaces for:

* View All Orders
* Cancel Orders

---

## Chatbot Page

Provide:

* Chat Interface
* Message History
* Food Discovery Responses

---

# Database Requirements

The database should include at minimum:

## Users

* id
* name
* email
* password
* role

---

## Restaurants

* id
* name
* description
* ownerId

---

## Menus

* id
* restaurantId
* name
* description
* price

---

## Orders

* id
* userId
* restaurantId
* status
* totalAmount

---

## Order Items

* id
* orderId
* menuId
* quantity

---

# Deliverables

## Backend

* All endpoints functional
* Database migrations applied
* TypeORM entities implemented
* JWT authentication working
* Role-based guards implemented
* .env.example included

---

## Frontend

* Application runs locally
* API integration completed
* Tailwind styling applied
* All pages functional
* Role-based routing implemented

---

## Chatbot

* Groq API integrated
* Menu search working
* Restaurant recommendations working
* Food discovery responses accurate

---

## Testing

* End-to-end flows tested
* Postman collection prepared
* No broken user flows

---

## Documentation

Provide:

* README.md
* API Documentation
* Database Documentation
* Architecture Documentation
* Setup Instructions

---

# Evaluation Criteria

## Functionality

* All roles work correctly
* Orders can be placed
* Orders can be tracked
* Chatbot responds correctly

---

## Code Quality

* Clean TypeScript code
* Proper folder structure
* No hardcoded values
* Proper error handling
* Maintainable architecture

---

## Documentation

* Clear setup instructions
* API documentation
* Architecture explanation
* Database design explanation

---

# Constraints

Do NOT implement:

* Payment gateways
* Ratings and reviews
* Advanced search systems
* Notifications
* Inventory management
* Loyalty programs

Stay focused on the MVP requirements only.

---

# Success Criteria

A successful submission demonstrates:

* Clean architecture
* Working authentication
* Proper authorization
* Functional ordering workflow
* Functional restaurant management
* Functional admin controls
* Accurate food discovery chatbot
* Professional documentation
* Production-quality code organization
