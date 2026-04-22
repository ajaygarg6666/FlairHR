<div align="center">

# ⚡ FlairHR — Visual Workflow Designer

**A production-grade, drag-and-drop HR workflow builder for modern enterprise teams.**

*Design. Configure. Simulate. Ship.*

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## What Is This?

FlairHR is an interactive, node-based workflow designer that lets HR administrators visually build, configure, and simulate internal processes — onboarding flows, leave approvals, document verification, and more — without writing a single line of code.

This is not a CRUD app dressed up as a canvas. It is a **graph-native tool** built from first principles: real BFS-based workflow simulation, dynamic form generation driven by node type, a clean layered architecture, and a mock API layer that mirrors how a real backend would behave.

---

## Live Demo Walkthrough

> **Drag → Configure → Connect → Simulate**

1. Drag a **Start Node** from the sidebar onto the canvas.
2. Add **Task**, **Approval**, and **Automated Step** nodes to represent your process.
3. Click any node to open its **configuration panel** — fill in fields, choose actions, set approvers.
4. Connect nodes by dragging between handles to define the execution path.
5. Hit **Run Simulation** — watch your workflow execute step by step in the Sandbox Panel.

---

## Features

### Visual Canvas
- Drag-and-drop node palette with five distinct node types
- Animated, directional edges between steps
- Click-to-select with instant configuration panel
- Delete nodes and edges via keyboard or controls
- Mini-map for navigating complex workflows
- Zoom controls and auto-fit

### Node Types

| Node | Purpose | Color |
|------|---------|-------|
| **Start** | Workflow entry point | Green |
| **Task** | Human-centric action (collect docs, fill form) | Blue |
| **Approval** | Decision step — Manager, HRBP, or Director | Orange |
| **Automated Step** | System-triggered action — email, PDF generation | Purple |
| **End** | Completion state with summary flag | Red |

### Intelligent Configuration Forms
Each node type renders a **context-aware form** with its own schema and validation. No generic inputs — every field is purpose-built for that node's role in the workflow.

- **Zod-powered validation** with real-time error feedback
- **Dynamic fields** — the Automated Step node renders different parameter inputs based on which action is selected from the API
- **Controlled components** throughout — zero uncontrolled state
- Auto-saves changes back to the graph in real time

### Workflow Simulation (Sandbox Panel)
- Serializes the entire graph to a portable JSON structure
- Sends it to the mock `/simulate` endpoint
- Validates graph structure **before** simulation:
  - Missing Start or End nodes
  - Disconnected / unreachable nodes
  - Cycle detection (prevents infinite loops)
  - Start node incoming edge constraint
- Renders a **step-by-step execution log** as a timeline UI

### Export / Import
- Export any workflow as a `.json` file
- Re-import it later to pick up exactly where you left off — full fidelity, no data loss

---

## Architecture

### Philosophy

The codebase is designed around one guiding principle: **every concern lives in exactly one place.** Canvas rendering does not know about API calls. Forms do not know about graph traversal. The store does not import components. This makes the system easy to reason about and easy to extend.

### Folder Structure

```
src/
├── components/
│   ├── canvas/          # ReactFlow wrapper, edge config, canvas controls
│   ├── nodes/           # One file per node type (StartNode, TaskNode, …)
│   ├── forms/           # One form component per node type + shared field primitives
│   ├── sidebar/         # Draggable node palette
│   └── sandbox/         # Simulation panel and execution log UI
│
├── hooks/               # useWorkflow, useSimulate, useNodeForm, useValidation
├── store/               # Zustand store — single source of truth for graph state
├── mocks/               # MSW handlers for /automations and /simulate
├── types/               # TypeScript interfaces for every node type and edge
└── utils/               # Graph validation, BFS traversal, JSON serialization
```

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + Vite | Fastest DX, latest concurrent features |
| Graph Engine | React Flow | Purpose-built for node-based UIs |
| State | Zustand | Minimal boilerplate, no provider hell |
| Forms | react-hook-form + Zod | Type-safe, performant, composable |
| Mock API | MSW (Mock Service Worker) | Intercepts at the network level — mirrors real backend behavior |
| Styling | Tailwind CSS | Utility-first, consistent design tokens |
| Icons | Lucide React | Consistent, accessible icon set |

### Key Design Decisions

**1. Each node type is fully self-contained.**
A `TaskNode` component owns its visual rendering. A `TaskNodeForm` component owns its configuration UI. A `TaskNodeSchema` owns its validation. Adding a new node type requires touching zero existing files — only adding new ones.

**2. The form system is schema-driven.**
Forms don't have hardcoded fields. Each node type exports a Zod schema, and the form panel renders fields by iterating that schema. This means extending a node's fields is a one-line change.

**3. Simulation is graph-first.**
The mock `/simulate` endpoint doesn't just echo back the input. It runs a BFS traversal over the serialized adjacency list and returns an ordered execution log — the same logic you'd implement in a real backend. This keeps the mock honest and the frontend simulation realistic.

**4. State is flat and normalized.**
The Zustand store holds nodes and edges as flat arrays, mirroring React Flow's own data model. There's no nested state tree to reconcile — updates are surgical and predictable.

**5. MSW over `axios-mock-adapter` or hardcoded data.**
Mock Service Worker intercepts requests at the Service Worker level, meaning the app behaves identically whether it's talking to a real API or the mock. This makes the transition to a real backend a one-line config change.

---

## How to Run

**Prerequisites:** Node.js 18+ and npm

```bash
# 1. Clone the repository
git clone https://github.com/your-username/flairhr-workflow-designer
cd flairhr-workflow-designer

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

> MSW registers its Service Worker automatically on first load. If the Automated Step node's action dropdown is empty, do a hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`) to ensure the Service Worker is active.

---

## Mock API Reference

The mock API layer (powered by MSW) handles two endpoints:

**`GET /automations`**
Returns the list of available automated actions and their dynamic parameter definitions.

```json
[
  { "id": "send_email",    "label": "Send Email",         "params": ["to", "subject"] },
  { "id": "generate_doc",  "label": "Generate Document",  "params": ["template", "recipient"] },
  { "id": "notify_slack",  "label": "Notify Slack",       "params": ["channel", "message"] }
]
```

**`POST /simulate`**
Accepts a serialized workflow graph and returns a step-by-step BFS execution log.

```json
{
  "steps": [
    { "nodeId": "node-1", "label": "Employee Onboarding Start", "status": "completed" },
    { "nodeId": "node-2", "label": "Collect Documents",         "status": "completed" },
    { "nodeId": "node-3", "label": "Manager Approval",          "status": "pending" }
  ]
}
```

---

## What I Built vs. What I'd Add Next

### ✅ Completed
- Full drag-and-drop canvas with all five node types
- Dynamic, schema-driven configuration forms for every node type
- MSW mock API for `/automations` and `/simulate`
- BFS-based workflow simulation with step-by-step log
- Graph validation (cycles, missing nodes, broken connections)
- Export and Import as JSON
- Mini-map and zoom controls
- TypeScript interfaces for all nodes, edges, and API payloads
- Clean, modular folder structure

### 🚧 What I'd Add With More Time

**Conditional Branching** — Approval nodes currently have one outgoing edge. A real HR workflow needs YES/NO branches with labeled edges and conditional routing logic. This would require extending the edge model with a `condition` field and updating the BFS simulator to evaluate conditions during traversal.

**Visual Validation Feedback** — Right now, validation errors appear in the Sandbox Panel. I'd surface them directly on the canvas: a red outline on the offending node, a tooltip explaining the issue, and a "Fix" shortcut where possible.

**Undo / Redo** — React Flow has built-in history hooks. Wiring them to Zustand's `temporal` middleware would give full undo/redo with no custom logic.

**Node Templates** — Pre-built workflow starters (e.g., "Standard Onboarding", "Leave Approval") that drop a connected subgraph onto the canvas in one click.

**Real-time Collaboration** — The Zustand store is already serializable. Adding a WebSocket layer (e.g., Yjs + y-websocket) would enable multi-user editing with presence indicators and conflict resolution.

**Backend Persistence** — Swap MSW for a FastAPI backend with a PostgreSQL graph store. The frontend API layer is already abstracted behind hooks — the only change needed is the base URL and removing the MSW initialization.

---

## Project Assumptions

- No authentication or user session management was required per the spec.
- Backend persistence was explicitly out of scope — all state lives in memory and optionally in exported JSON files.
- The UI reference image was treated as a directional guide for aesthetics, not a pixel-perfect spec. Some layout choices were made to optimize for usability over visual fidelity to the reference.
- The Automated Step node's dynamic parameter fields assume that `params` in the `/automations` response are always strings. A production implementation would include a `type` field per param to support dropdowns, booleans, etc.

---

<div align="center">

Built with focus, care, and a lot of React Flow documentation.

**[View Source](https://github.com/your-username/flairhr-workflow-designer)**

</div>