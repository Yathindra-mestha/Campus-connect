---
title: "AeroSpace: Autonomous Drone Delivery"
description: "An autonomous aerial logistics system designed for swift, on-campus transport of emergency medical supplies and books, utilizing PX4 autopilot and obstacle avoidance vision algorithms."
tags: ["Robotics", "Autopilot", "OpenCV", "ROS", "C++"]
branch: "ECE"
image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80"
github_url: "https://github.com/Yathindra-mestha/aerospace-drone"
date: "2026-05-22T12:10:00.000Z"
---

# AeroSpace: High-Flyer Campus Logistics

AeroSpace aims to revolutionize the way lightweight materials are moved around our large university campus. By leveraging low-altitude autonomous quadcopters, we can transport vital materials, such as emergency medical supplies, documents, and library books, in a fraction of the time required by traditional ground travel.

## 🚁 System Architecture

The project consists of three core components working in unison:

- **The Airframe**: A custom-built carbon fiber quadcopter powered by a Pixhawk 4 flight controller running the PX4 Autopilot stack.
- **Onboard Companion Computer**: An NVIDIA Jetson Nano running ROS2 (Robot Operating System) handles real-time computer vision, obstacle avoidance, and path planning.
- **Base Station Control Hub**: A web application developed to monitor flight telemetry, stream live video feeds, and handle automated package dispatching.

## 🛠️ Computer Vision & Navigation

For navigation, the drone uses a combinations of GPS waypoints and visual inertia odometry (VIO) using an onboard stereo depth camera. Obstacle avoidance is driven by a localized OctoMap generated dynamically in real-time, allowing the drone to navigate around dynamic obstacles like trees, building corners, and other flyers.

```cpp
// ROS2 Node snippet for obstacle detection and hover override
void ObstacleAvoidanceNode::sensorCallback(const sensor_msgs::msg::LaserScan::SharedPtr msg) {
    for (auto range : msg->ranges) {
        if (range < CRITICAL_DISTANCE_THRESHOLD) {
            triggerHoverOverride();
            RCLCPP_WARN(this->get_logger(), "Obstacle detected! Initiating emergency hover.");
            break;
        }
    }
}
```

## 🔋 Autonomous Charging Stations

To ensure a continuous duty cycle, the quadcopters are designed to land autonomously on custom-engineered charging pads equipped with induction charging circuits. Using ArUco marker detection via a downward-facing camera, the drone achieves precision landing within a 2cm margin of error.
