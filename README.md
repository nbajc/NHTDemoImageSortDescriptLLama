# Nexus Hestia Image Sorter

An advanced, entirely local AI-powered multi-agent image sorting and cataloging system. The Nexus Hestia Image Sorter utilizes LLaVA for vision-based image comprehension and LLaMA 3 for text synthesis, automatically generating rich descriptions and intelligently categorizing your local image libraries into distinct thematic folders.

## ✨ Core Functionality

- **Autonomous Agentic Sorting**: Connect a source directory, and the backend engine will systematically copy each file, run it through the Vision AI model to determine its contents, assign it to a category, and generate a descriptive summary. 
- **Non-destructive Pipeline**: The engine intelligently utilizes `shutil.copy2` to gracefully duplicate images into your sorted target directory, leaving your original files entirely untouched. 
- **Intelligent Sub-Folder Generation**: Automatically builds a structured directory tree using Project Tags and matched thematic categories.
- **Human-in-the-Loop (HITL) Editor**: Features a beautifully overlaid interactive pop-up modal. Click any image to review its full-resolution source and easily edit the AI's generated textual descriptions or add your own `#hashtags`.
- **Dynamic Extracted Hashtags**: Manually typed hashtags inside the description are instantly detected via RegEx and elevated into the formal `project_tag` indexing database.
- **SQLite Catalog Indexing**: Every parsed detail—including descriptions, file paths, origin schemas, categories, and custom tags—is persistently saved into an internal `nexus_catalog.db` SQLite database.
- **Real-time Live Desktop Search**: Immediately search across thousands of images through the top dashboard pane. The UI separates visually into a transient "Active Search Results" panel that hovers independently above your permanent full catalogue.
- **Persistent Category Tabs**: Custom categories inputted via the dashboard configuration are persistently saved to `localStorage` and automatically converted into rapid-access UI Filter Tabs once images begin indexing.

## 🏗️ Architecture Stack

### Backend
- **Framework**: Python `Flask` (REST API).
- **Core Orchestration**: Multi-threading (`threading.Thread`) is utilized to decouple the heavy local LLM inference tasks from the main API thread, preventing UI blocking.
- **Database**: Python's native `sqlite3` drives `nexus_catalog.db`. Used as the primary synchronization layer for all endpoints (`/api/search`, `/api/update_item`, `/api/delete_item`).
- **AI Models**: Designed to interface with Ollama running `llava` (Vision Context) and `llama3` (Text Synthesizer) models asynchronously. 

### Frontend
- **Framework**: React 18, utilizing the latest `Vite` build engine. 
- **Styling**: Tailwind CSS v4 to orchestrate fluid sizing, sleek dark mode glassmorphism panels, gradient typography, and state-driven macro-animations. 
- **Icons**: `lucide-react` forms the basis for the application's minimalist UI iconography.
- **State Management**: Complex layout coordination mapped through React `useState` and `useEffect` patterns separating transient Sorting Job state updates from the persistent SQLite layout arrays.

## 🚀 Installation & Setup

### Prerequisites
1. Ensure [Ollama](https://ollama.com/) is installed and running locally with the requisite models:
   ```bash
   ollama run llava
   ollama run llama3
   ```
2. Node.js (v18+) & Python (3.10+)

### Running the Backend Engine
1. Navigate to the root directory folder.
2. Ensure you have the required Python modules (`pip install -r requirements.txt`). 
3. Launch the API Gateway:
   ```bash
   python app.py
   ```
   *The server will initialize on `http://127.0.0.1:5000` and automatically deploy the `nexus_catalog.db` indexing layer if not found.*

### Running the React Dashboard
1. Open a new terminal and enter the frontend module:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
3. Boot up `http://localhost:5173/` in your browser. Configure your source and target directories, punch in your project tags, and hit "Start Sorting".
