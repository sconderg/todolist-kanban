# Todolist Kanban Board

A clean, fast Kanban board built with Next.js.

## Features

* Drag and drop that actually feels right using `@dnd-kit/react`
* Instant UI updates. You move, create, delete → it updates immediately thanks to React Query (optimistic updates done properly)
* Infinite scrolling per column so you’re not loading a million tasks at once
* Change column colors on the fly with preset options, and tasks follow the style automatically
* Global state handled with Zustand. Simple and predictable
* Debounced search so you can filter tasks without hammering performance

## Tech Stack

* Next.js 16 + React 19 (App Router)
* React Query for data fetching and caching
* Zustand for state management
* Material UI v7 (with Emotion) for UI
* `@dnd-kit/react` for drag and drop
* JSON Server as a mock backend
* Tailwind + custom MUI theme for styling

## Getting Started

You need to run two things: the frontend and the mock API.

### Install deps

```bash
pnpm install
```

### Run mock API

```bash
pnpm mock-api
```

Runs on:

```
http://localhost:4000
```

### Run the app

```bash
pnpm dev
```

Open:

```
http://localhost:3000
```

## Project Structure

* `api/` → API layer (Axios + services for tasks and columns)
* `components/` → UI pieces (Board, Column, TaskCard, TaskModal, SearchBar)
* `hooks/` → React Query hooks (fetch + mutations)
* `providers/` → App providers (MUI, Emotion, Query)
* `store/` → Zustand state (modals, search, UI stuff)
* `types/` → TypeScript types
* `constants/` → configs (columns, priorities, colors)
