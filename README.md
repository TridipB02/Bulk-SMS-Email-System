# Bulk SMS & Email Management System
### National Informatics Centre (NIC), Government of India — MeitY

A distributed bulk SMS and email communication platform developed during my internship at the National Informatics Centre (NIC). The system uses a Spring Boot microservices architecture with RabbitMQ for asynchronous messaging and React for the frontend.

---

## Architecture Overview

```
React Frontend (Vite)
        │
        ▼
Spring Cloud Gateway (Port 8888)
        │
        ├── auth-service         (8081)  — JWT auth, OTP, refresh tokens
        ├── user-service         (8082)  — User profiles, role management
        ├── contact-service      (8083)  — Contact groups, CSV import
        ├── campaign-service     (8084)  — Campaign lifecycle, scheduling
        ├── messaging-service    (8085)  — Email/SMS dispatch, retry logic
        ├── billing-service      (8086)  — Credits, deductions, top-up
        ├── notification-service (8087)  — In-app & email notifications
        └── report-service       (8088)  — Delivery analytics

Infrastructure:
        ├── PostgreSQL           (5432)  — 7 isolated databases
        └── RabbitMQ             (5672)  — Async event broker
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.5.1, Java 21 |
| Frontend | React 18, Vite, Recharts |
| Database | PostgreSQL 15 (database-per-service) |
| Messaging | RabbitMQ 3 (4 exchange-queue pairs) |
| Security | Spring Security, JWT (HMAC-SHA512), OTP |
| Gateway | Spring Cloud Gateway 2025.0.0 |
| Containerization | Docker, per-service docker-compose |
| Mail | Spring Mail (Gmail SMTP) |

---

## Key Features

### Campaign Management
- Full campaign lifecycle: DRAFT → PENDING_CHECKER → CHECKED → APPROVED → SENT
- Maker-Checker-Approver (4-role) RBAC workflow
- Campaign scheduling with IST→UTC timezone conversion
- Auto-dispatch via `@Scheduled` polling every 60 seconds
- Exponential backoff retry for failed deliveries (configurable max retries)

### Security
- JWT authentication (HMAC-SHA512, 1-hour access token + 7-day refresh)
- OTP-based email verification on registration and login
- 4-role RBAC: `ADMIN` / `MAKER` / `CHECKER` / `APPROVER`
- Role-gated endpoints via Spring Security `@PreAuthorize`

### Async Messaging (RabbitMQ)
| Exchange | Routing Key | Queue | Publisher → Consumer |
|---|---|---|---|
| `campaign.exchange` | `campaign.dispatch` | `campaign.dispatch.queue` | campaign-service → messaging-service |
| `notification.exchange` | `notification.send` | `notification.queue` | messaging-service → notification-service |
| `billing.exchange` | `billing.deduct` | `billing.deduct.queue` | messaging-service → billing-service |
| `lowbalance.exchange` | `lowbalance.alert` | `lowbalance.queue` | billing-service → notification-service |

### Contact Management
- Contact groups with CSV bulk import
- Phone and email validation, deduplication
- Ad-hoc cross-group contact selection for custom campaigns

### Billing & Credits
- Per-user credit accounts with transaction history
- Pre-send balance check — blocks zero-balance campaigns
- Low-balance warning notifications (threshold: 10 credits)
- Admin top-up for any user

### Delivery Reporting
- Per-campaign delivery stats: total / sent / failed / success rate
- Full message log with recipient, status, sentAt, failure reason
- Sent vs Failed pie chart visualization

---

## RabbitMQ Event Flows

```
ADMIN approves campaign
        │
        ▼
campaign-service publishes CampaignDispatchEvent
        │
        ▼
messaging-service consumes → sends emails/SMS
        │
        ├── publishes NotificationEvent → notification-service (email to user)
        └── publishes BillingDeductEvent → billing-service (deduct credits)
                                                    │
                                        balance ≤ 10 → publishes LowBalanceEvent
                                                    │
                                                    ▼
                                        notification-service (low balance email)
```

---

## Project Structure

```
NIC-PROJECT/
├── auth-service/
├── user-service/
├── contact-service/
├── campaign-service/
├── messaging-service/
├── billing-service/
├── notification-service/
├── report-service/
├── api-gateway/
├── bulk-sms-frontend/
└── infra/
    ├── docker-compose.yml       ← PostgreSQL + RabbitMQ
    └── init-databases.sql       ← Creates all 7 databases
```

---

## Getting Started

### Prerequisites
- Java 21
- Docker Desktop
- Node.js 18+

### 1. Create shared Docker network
```bash
docker network create nic-network
```

### 2. Start infrastructure (PostgreSQL + RabbitMQ)
```bash
cd NIC-PROJECT/infra
docker-compose up -d
```

### 3. Build and start each service
```bash
cd NIC-PROJECT/auth-service
docker-compose up -d --build

cd NIC-PROJECT/user-service
docker-compose up -d --build

# repeat for all services:
# contact-service, campaign-service, messaging-service,
# billing-service, notification-service, report-service, api-gateway
```

### 4. Start frontend
```bash
cd NIC-PROJECT/bulk-sms-frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Service Ports

| Service | Port |
|---|---|
| API Gateway | 8888 |
| Auth Service | 8081 |
| User Service | 8082 |
| Contact Service | 8083 |
| Campaign Service | 8084 |
| Messaging Service | 8085 |
| Billing Service | 8086 |
| Notification Service | 8087 |
| Report Service | 8088 |
| PostgreSQL | 5432 |
| RabbitMQ AMQP | 5672 |
| RabbitMQ Management UI | 15672 |
| Frontend | 5173 |

---

## Environment Variables

Each service reads the following via Docker environment variables:

```yaml
DB_HOST: nic-postgres
DB_USER: postgres
DB_PASS: Postgres@123
JWT_SECRET: <HMAC-SHA512 secret>
RABBITMQ_HOST: nic-rabbitmq
RABBITMQ_USER: guest
RABBITMQ_PASS: guest
MAIL_USERNAME: your@gmail.com
MAIL_PASSWORD: your-app-password   # Gmail App Password
```

---

## API Endpoints (via Gateway — localhost:8888)

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/login` | Login with password |
| POST | `/api/auth/send-otp` | Send OTP for login |
| POST | `/api/auth/refresh` | Refresh access token |

### Campaigns
| Method | Endpoint | Role |
|---|---|---|
| POST | `/api/campaigns` | MAKER |
| PUT | `/api/campaigns/{id}/submit` | MAKER |
| PUT | `/api/campaigns/{id}/check` | CHECKER |
| PUT | `/api/campaigns/{id}/approve` | APPROVER |
| PUT | `/api/campaigns/{id}/reject` | APPROVER / CHECKER |
| PUT | `/api/campaigns/{id}/admin-approve` | ADMIN |
| GET | `/api/campaigns/my` | All roles |
| GET | `/api/campaigns` | ADMIN / CHECKER / APPROVER |

### Contacts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/contacts/groups` | List all groups |
| POST | `/api/contacts/groups` | Create group |
| POST | `/api/contacts/groups/{id}/contacts` | Add contact |
| POST | `/api/contacts/groups/{id}/upload` | CSV bulk import |
| DELETE | `/api/contacts/contacts/{id}` | Delete contact |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/billing/balance` | Get balance |
| GET | `/api/billing/transactions` | Transaction history |
| POST | `/api/billing/topup` | Top up credits (ADMIN) |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/campaign/{id}` | Delivery report |

---

## Campaign Workflow

```
MAKER creates campaign → DRAFT
        │
MAKER submits → PENDING_CHECKER
        │
CHECKER reviews → CHECKED  (or REJECTED)
        │
APPROVER approves → APPROVED → RabbitMQ dispatch → SENT
        │
ADMIN can bypass all stages via /admin-approve
```

---

## RabbitMQ Management

Access at `http://localhost:15672` (guest / guest)

- **Exchanges tab** — view bindings, publish test messages
- **Queues tab** — inspect message counts, purge stuck queues
- **Connections tab** — verify all 4 consumers are connected

---

## Frontend Pages

| Page | Description |
|---|---|
| Dashboard | Stats overview, weekly message volume chart |
| Contacts | Group management, CSV import, cross-group selection |
| Campaigns | Create, edit, submit, approve campaigns |
| Reports | Delivery stats, pie chart, message logs |
| Billing | Credit balance, transaction history, top-up |
| Notifications | In-app campaign and billing alerts |
| Admin Panel | Campaign approval/rejection queue |
| Users | Role management, activate/deactivate, admin top-up |

---

## Challenges Faced

- Designing communication between microservices using RabbitMQ.
- Implementing a Maker-Checker-Approver workflow with role-based access control.
- Managing independent PostgreSQL databases for each service.
- Handling campaign scheduling and asynchronous message delivery.

---

## Key Learnings

- Building event-driven systems with RabbitMQ.
- Implementing JWT authentication and role-based authorization.
- Working with Docker-based microservice deployments.
- Designing scalable backend services using Spring Boot.

---

## Developed By

**Tridip Baksi**
B.Tech-M.Tech Cyber Security — National Forensic Sciences University (NFSU)
Internship: National Informatics Centre (NIC), Agartala — Government of India (MeitY)

---

*Built as part of a government internship project at NIC, Agartala. Not for production use without proper security review and configuration hardening.*
