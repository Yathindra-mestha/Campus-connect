---
title: "CodeCraft: Browser Sandbox IDE"
description: "A full-featured collaborative development environment that runs completely in the browser. Features real-time multi-user editing, a sandboxed WebAssembly execution environment, and terminal emulation."
tags: ["WebAssembly", "React", "WebRTC", "Monaco Editor", "Docker"]
branch: "CSE"
image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
github_url: "https://github.com/Yathindra-mestha/codecraft-ide"
date: "2026-05-22T12:15:00.000Z"
---

# CodeCraft: Next-Generation Collaborative IDE

CodeCraft breaks down the barrier between local and browser-based coding environment. Built as a zero-setup collaborative editor, CodeCraft lets developers pair-program synchronously in real-time, execute their code securely inside sandboxed environments, and manage files without ever leaving their browser window.

## 💻 Tech Stack & Architecture

- **Real-Time Collaboration**: Utilizes WebRTC and Yjs (Conflict-Free Replicated Data Types, or CRDTs) to sync keystrokes and editor selections with sub-10ms latency.
- **Wasm Sandbox**: Code execution runs securely in a sandboxed WebAssembly engine (using Pyodide and native Wasm toolchains), executing code completely client-side without relying on a remote backend.
- **Professional Monaco Editor**: Integrates the same core editor that powers VS Code, providing native autocomplete, error highlighting, and code folding.

## 🚀 Key Implementation Details

### Client-Side File System
CodeCraft utilizes the modern **Origin Private File System (OPFS)** API, allowing highly efficient, low-latency browser storage that acts just like a real operating system disk.

```typescript
// Initializing a secure browser-side file handle
async function getFileHandle(fileName: string) {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(fileName, { create: true });
  return fileHandle;
}
```

### Collaborative WebRTC Signalling
When pair-programming, peers establish direct P2P connections to synchronize documents. In the event WebRTC is blocked by a university firewalls, the editor seamlessly falls back to secure WebSocket synchronization using a redundant central signaling server.
