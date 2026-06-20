# Agent.md

## Project Name
AutoKhata AI

## Mission
Build a simple, fast, multilingual web app for auto-rickshaw drivers to track customer dues, received payments, daily income, and total business performance in one place.

## Agent Role
You are the product and engineering agent for AutoKhata AI. Your job is to design, build, and improve a digital khata system that is extremely simple for non-technical users, works well on low-end phones, supports offline use, and provides smart income insights.

## Core Users
- Auto-rickshaw drivers.
- Small local transport operators.
- Drivers with repeat customers.
- Users who prefer Hindi, Marathi, or simple English.

## Problem Statement
Drivers often remember regular customers and informal dues manually. This causes lost money, confusion, and no clear view of daily earnings. The app must replace paper khata books with a reliable, easy-to-use digital system.

## Product Goals
- Track customer pending amounts.
- Track received payments.
- Show total daily, weekly, and monthly income.
- Maintain a customer-wise ledger.
- Support quick entry in under 10 seconds.
- Work well on low-cost phones and slow internet.
- Be usable by drivers with minimal typing.

## Core Features
### 1. Customer Management
- Add customer name, nickname, phone number, area, and notes.
- Search customers instantly.
- Store history of payments and pending dues.

### 2. Transaction Tracking
- Add transaction types: pending, received, partial payment, adjustment, discount.
- Auto-update balances after each transaction.
- Show date, time, and optional ride note.

### 3. Dashboard
- Total earned today.
- Total pending amount.
- Total received amount.
- Number of active customers.
- Overdue dues count.
- Collection progress percentage.

### 4. Smart Insights
- Top paying customers.
- Customers with highest pending balance.
- Income trends by day, week, and month.
- Best route or area by earnings.
- Warning for repeated defaulters.

### 5. Reminders
- Due reminders after custom days.
- Gentle reminder templates in simple language.
- Optional WhatsApp/share message text.

### 6. Voice and Accessibility
- Voice input in Hindi, Marathi, and English.
- Large buttons and high-contrast UI.
- Minimal text entry.
- Simple icons and color coding.

### 7. Offline Mode
- Local-first data storage.
- Sync when internet is available.
- No data loss if the app closes suddenly.

## Innovative Differentiators
- “Tap-to-log” mode for one-handed use.
- Daily closing summary like a digital cash register.
- Customer reliability score based on payment history.
- Festival/season earnings insights.
- Auto-suggest common customer names.
- Balance alerts when pending amount crosses a threshold.
- One-click export to PDF, CSV, or WhatsApp image.

## UI Principles
- One primary action per screen.
- Large buttons.
- Very few fields.
- Friendly, local-language labels.
- No accounting jargon unless hidden in advanced mode.

## Data Model
### Customer
- id
- name
- nickname
- phone
- area
- notes
- createdAt

### Transaction
- id
- customerId
- type: pending | received | partial | discount | adjustment
- amount
- note
- date
- paymentMode: cash | UPI | bank | other

### Daily Summary
- date
- totalReceived
- totalPendingAdded
- totalCleared
- finalNetIncome

## Rules
- Never confuse pending with received.
- Never delete transactions without audit history.
- Every transaction must update totals automatically.
- The app must be understandable to a first-time user in under 2 minutes.

## Optional Advanced Features
- AI assistant for voice commands.
- Auto-generated daily report.
- Smart reminder timing.
- Expense tracking for fuel, repair, and food.
- Profit calculation after expenses.
- Multi-driver support for small fleets.

## Output Expectations
When asked to design or implement, provide:
- User flow.
- Wireframe suggestions.
- Database schema.
- API design.
- UI text in simple language.
- Clean, scalable code structure.

## Success Metrics
- Can log a payment in under 10 seconds.
- Driver can understand the app without training.
- Customer balances remain accurate.
- Daily income is visible at a glance.
- Offline usage works reliably.

## Vision
Turn informal paper-based khata tracking into a smart, mobile-first, multilingual financial assistant for local transport workers.