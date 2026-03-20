# Image Sorter Dashboard Implementation Plan

This plan outlines the steps to build a modern, dashboard-style frontend to visualize and control the local `LlamaImageSorter` backend.

## Architecture

We will implement a simple web architecture:

1.  **Backend (Python/Flask or FastAPI):** We need to wrap your existing `agents.py` logic in a lightweight API so the frontend can interact with it.
2.  **Frontend (React/Vite):** A vibrant, dynamic React single-page application (SPA) acting as the dashboard.

## Proposed Changes

### Backend Component

We will create a simple Flask application that serves as the API for the frontend and runs the image sorting logic in the background.

#### [NEW] `app.py`
A Flask application that exposes the following endpoints:
- `GET /api/status`: Returns the current status of the sorting process (idle, running, current file, etc.).
- `POST /api/start`: Starts the sorting process with specified parameters (source, target, categories, models).
- `GET /api/results`: Returns a summary of the sorted images and their descriptions.

#### [MODIFY] `requirements.txt`
Add `Flask` and `flask-cors` to the requirements file.

### Frontend Component

We will initialize a new Vite + React + TypeScript project within a `frontend/` directory.

#### [NEW] `frontend/`
A new React application initialized via Vite.

#### [NEW] `frontend/src/App.tsx` (and related components)
The main dashboard interface with:
- **Configuration Panel:** Inputs for source directory, target directory, models, and custom categories.
- **Status/Progress Section:** Real-time feedback on the sorting progress (which image is being processed, current description, etc.).
- **Results View:** A grid or list showing the processed images grouped by category, displaying the generated descriptions.

#### Design Aesthetics
The frontend will feature:
- A modern dark-mode aesthetic with vibrant, harmonious accent colors.
- Smooth gradients and glassmorphism effects for panels and cards.
- Interactive micro-animations (hover states, loading spinners, smooth transitions).
- Modern typography using Google Fonts (e.g., Inter).

## Verification Plan

### Automated/Manual Verification
1.  **Backend Verification:** Start the Flask server and test the API endpoints using `curl` or Postman.
2.  **Frontend Verification:** Run the Vite development server (`npm run dev`) and verify the UI rendering, state management, and API calls.
3.  **End-to-End Test:** Start both servers, configure a test run through the UI, and verify that the backend correctly processes the images and updates the frontend in real-time.
