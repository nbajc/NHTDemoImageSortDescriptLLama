import os
import threading
import shutil
from flask import Flask, request, jsonify
from flask_cors import CORS
from agents import DescriberAgent, SorterAgent

app = Flask(__name__)
CORS(app)

# Global state to keep track of sorting progress
job_state = {
    "status": "idle", # idle, running, completed, error
    "current_file": None,
    "description": None,
    "category": None,
    "processed": 0,
    "total": 0,
    "results": [],
    "error": None
}

def sort_images_worker(source_dir, target_dir, categories, vision_model, text_model, extensions, dry_run):
    global job_state
    
    try:
        if not os.path.exists(source_dir):
            job_state["error"] = f"Source directory not found: {source_dir}"
            job_state["status"] = "error"
            return

        if not dry_run and not os.path.exists(target_dir):
            os.makedirs(target_dir, exist_ok=True)

        job_state["status"] = "running"
        job_state["results"] = []
        job_state["current_file"] = "Initializing agents..."
        
        describer = DescriberAgent(model_name=vision_model)
        sorter = SorterAgent(model_name=text_model, categories=categories)
        
        exts = tuple(f".{ext.lower()}" for ext in extensions)

        # Count total files
        total_files = 0
        for root, _, files in os.walk(source_dir):
            for file in files:
                if file.lower().endswith(exts):
                    total_files += 1
                    
        job_state["total"] = total_files
        job_state["processed"] = 0

        for root, _, files in os.walk(source_dir):
            if job_state["status"] != "running": # Handle manual stop if needed later
                break
                
            for file in files:
                if file.lower().endswith(exts):
                    full_path = os.path.join(root, file)
                    
                    job_state["current_file"] = file
                    job_state["description"] = "Generating description..."
                    job_state["category"] = None
                    
                    # 1. Describe Image
                    description = describer.describe(full_path)
                    
                    if not description:
                        job_state["description"] = "Failed to describe."
                        job_state["processed"] += 1
                        continue
                        
                    job_state["description"] = description
                    
                    # 2. Sort Image
                    job_state["category"] = "Determining category..."
                    category = sorter.sort(description)
                    
                    if not category:
                        job_state["category"] = "Failed to sort."
                        job_state["processed"] += 1
                        continue
                        
                    job_state["category"] = category
                    
                    # 3. Move Image
                    category_dir = os.path.join(target_dir, category)
                    target_path = os.path.join(category_dir, file)
                    
                    moved = False
                    if not dry_run:
                        try:
                            if not os.path.exists(category_dir):
                                os.makedirs(category_dir, exist_ok=True)
                                
                            if os.path.exists(target_path):
                                base, extension = os.path.splitext(file)
                                counter = 1
                                while os.path.exists(target_path):
                                    target_path = os.path.join(category_dir, f"{base}_{counter}{extension}")
                                    counter += 1
                                    
                            shutil.copy2(full_path, target_path) # Changed to copy for safety by default during API runs, or can configure to move
                            
                            desc_path = os.path.splitext(target_path)[0] + ".txt"
                            with open(desc_path, "w", encoding="utf-8") as f:
                                f.write(description)
                                
                            moved = True
                        except Exception as e:
                            print(f"Failed to move {full_path}: {e}")
                    else:
                        moved = True
                    
                    if moved:
                        job_state["results"].append({
                            "file": file,
                            "original_path": full_path,
                            "new_path": target_path,
                            "category": category,
                            "description": description
                        })
                        
                    job_state["processed"] += 1

        job_state["status"] = "completed"
        job_state["current_file"] = None
        
    except Exception as e:
        job_state["status"] = "error"
        job_state["error"] = str(e)


@app.route("/api/status", methods=["GET"])
def get_status():
    return jsonify(job_state)


@app.route("/api/start", methods=["POST"])
def start_sorting():
    global job_state
    
    if job_state["status"] == "running":
        return jsonify({"error": "A job is already running."}), 400
        
    data = request.json
    source_dir = data.get("source")
    target_dir = data.get("target")
    categories = data.get("categories", [])
    vision_model = data.get("vision_model", "llava")
    text_model = data.get("text_model", "llama3")
    extensions = data.get("extensions", ["jpg", "jpeg", "png", "webp"])
    dry_run = data.get("dry_run", False)
    
    if not source_dir or not target_dir or not categories:
        return jsonify({"error": "Missing required fields: source, target, categories"}), 400
        
    job_state = {
        "status": "starting",
        "current_file": None,
        "description": None,
        "category": None,
        "processed": 0,
        "total": 0,
        "results": [],
        "error": None
    }
    
    # Start thread
    thread = threading.Thread(
        target=sort_images_worker,
        args=(source_dir, target_dir, categories, vision_model, text_model, extensions, dry_run)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Job started successfully"})

@app.route("/api/results", methods=["GET"])
def get_results():
    if job_state["status"] != "completed":
        return jsonify({"error": "No completed job results available yet."}), 400
    return jsonify({"results": job_state["results"]})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
