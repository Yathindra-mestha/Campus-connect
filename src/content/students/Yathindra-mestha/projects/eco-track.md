---
title: "EcoTrack: Smart Green Grid"
description: "A comprehensive IoT dashboard that aggregates real-time data from campus-wide sensor meshes. Monitors power consumption, water usage, and environmental telemetry to drive carbon reduction."
tags: ["IoT", "Sustainability", "Node.js", "MQTT", "Grafana"]
branch: "Environmental Engineering"
image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
github_url: "https://github.com/Yathindra-mestha/eco-track"
date: "2026-05-22T12:05:00.000Z"
---

# EcoTrack: Saving the Planet, One Data Point at a Time

EcoTrack is more than just a data dashboard; it's a real-time smart grid solution designed to optimize resource usage and drive campus-wide sustainability. Built on top of a resilient ESP32 mesh network, the system tracks key utility consumption metrics and provides automated alert notifications.

## 🌿 Technical Overview

Our sensor grid is deployed across major university buildings, featuring customized firmware that broadcasts telemetry data to a central MQTT broker:

- **Electricity Monitoring**: Non-invasive SCT-013 current transformers measure real-time amperage and calculate active power.
- **Water Management**: Ultrasonic flow sensors detect unusual water activity and identify leaks in under-floor plumbing.
- **Waste Bin Status**: Ultrasonic rangefinders monitor bin capacity, optimizing waste collection routes and schedule efficiency.

## 📖 Deployment Guide

### Hardware Requirements
- **Microcontrollers**: ESP32 NodeMCU development boards
- **Sensors**: SCT-013 Current Sensors, YF-S201 Water Flow Sensors, and HC-SR04 Ultrasonic Sensors
- **Gateway**: Raspberry Pi 4 (or any local server running Node.js)

### Software Setup
1. Clone the repository and install project dependencies:
   ```bash
   git clone https://github.com/Yathindra-mestha/eco-track.git
   cd eco-track
   npm install
   ```
2. Configure your environmental variables in a `.env` file with your MQTT broker credentials.
3. Launch the local gateway to stream sensor packets:
   ```bash
   npm run start:gateway
   ```

## 🏆 Project Impact

Since its initial pilot deployment in the Main Campus Hall, EcoTrack has successfully:
- Reduced **idle energy waste by 14%** through smart lighting automation triggers.
- Detected **4 major water leaks** in real-time, saving thousands of gallons of municipal water.
- Optimized garbage truck dispatch frequency, resulting in a **20% decrease** in campus carbon footprint.
