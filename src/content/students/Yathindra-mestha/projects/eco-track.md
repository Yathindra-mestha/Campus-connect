---
title: "EcoTrack: Sustainability Monitor"
description: "An IoT-powered dashboard that tracks campus energy consumption and waste management in real-time, providing actionable insights for a greener university."
tags: ["IoT", "Sustainability", "Data Vision", "Node.js"]
branch: "Environmental Engineering"
image: "/images/students/Yathindra-mestha/eco-track.png"
github_url: "https://github.com/Yathindra-mestha/eco-track"
date: "2026-02-26T21:35:00.000Z"
---

# EcoTrack: Saving the Planet, One Data Point at a Time

EcoTrack is more than just a dashboard; it's a call to action for every student on campus to participate in our sustainability goals.

## 🌿 Technical Overview
Our system utilizes a mesh network of ESP32 sensors placed in every building to monitor:
- **Electricity Usage** (Amperage & Voltage)
- **Water Flow** (Identifying leaks in real-time)
- **Waste Bin Status** (Optimizing collection routes)

## 📖 Deployment Guide

### Hardware Requirements
- ESP32 Microcontroller
- SCT-013 Current Sensor
- HC-SR04 Ultrasonic Sensor (for bin levels)

### Software Setup
1. Clone the repository and install dependencies.
2. Configure your `config.env` with your MQTT broker credentials.
3. Pulse your sensors to the gateway.

```bash
# Start the EcoTrack local gateway
npm install
npm run start:gateway
```

## 🏆 Project Impact
Since its deployment in the Main Campus Hall, we have seen a **12% reduction** in idle energy waste and identified **3 major water leaks** within the first week.

---

*Join our mission to create a carbon-neutral campus by 2030.*
