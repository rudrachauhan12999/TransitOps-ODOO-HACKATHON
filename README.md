# TransitOps AI - AI Operations Copilot

## Branch
feature/ai-copilot

## Assigned To
AI Developer

## Objective

Develop the AI Operations Copilot using Grok API.

## Features

### GPS Simulator

Every 5 seconds generate

- Latitude
- Longitude
- Speed
- Fuel Level
- Engine Temperature

Update database.

Broadcast through WebSocket.

---

### AI Copilot

Supported Questions

- Which vehicles need servicing?
- Which drivers are available?
- Which vehicle has low fuel?
- Show delayed deliveries.
- Give today's operational summary.

---

### Tool Functions

- get_vehicle()
- get_driver()
- get_route()
- get_delivery_status()
- get_notifications()
- get_live_gps()

---

### Smart Alerts

Generate alerts

- Low Fuel
- High Engine Temperature
- Maintenance Due
- Driver Shift Exceeded
- Delivery Delayed

---

### AI Workflow

User Question

↓

Grok API

↓

Tool Selection

↓

Backend Functions

↓

Database

↓

Generate Response

## Tech Stack

- Python
- Grok API
- APScheduler
- FastAPI
- WebSockets

## Status

- [ ] GPS Simulator
- [ ] Tool Functions
- [ ] AI Copilot
- [ ] Smart Alerts
