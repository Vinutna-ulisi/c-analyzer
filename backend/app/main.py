from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routes import auth_routes, test_routes, analytics_routes, recommendation_routes, course_routes
from sqlalchemy.orm import Session
from .database import SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cognitive Learning Pattern Analyzer API")

def seed_data():
    db = SessionLocal()
    try:
        # For this visual update, we force a re-seed if requested or just drop existing to refresh thumbnails
        if db.query(models.Course).count() > 0:
            # We want to refresh thumbnails, so we'll drop all courses and re-seed
            # In a production app you wouldn't do this, but for calibration seeding it's okay.
            db.query(models.Question).delete()
            db.query(models.Quiz).delete()
            db.query(models.Module).delete()
            db.query(models.Course).delete()
            db.commit()
            print("Database cleared for visual refresh.")

        print("Starting database calibration seed...")

        python_courses = [
            {
                "title": "Introduction to Artificial Intelligence",
                "description": "Exploration of AI foundations, search algorithms, and logic-based systems.",
                "difficulty": "Beginner",
                "instructor": "Dr. Alan Turing",
                "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
                "modules": [
                    {
                        "title": "History & Fundamentals", 
                        "content_theoretical": "Artificial Intelligence is the simulation of human intelligence by machines. It spans from simple logic gate systems to complex neural networks...",
                        "content_practical": "# AI Search Simulation\ndef simple_search(data, target):\n    return target in data\n\nprint(simple_search([1, 2, 3], 2))",
                        "content_visual": "• AI = Machines simulating human intelligence\n• Types: Narrow AI vs General AI\n• History: From Turing to Deep Learning",
                        "video_url": "https://www.youtube.com/embed/2ePf9rue1Ao", 
                        "order": 1
                    },
                    {
                        "title": "Search Algorithms", 
                        "content_theoretical": "State-space search is a core AI concept. Breadth-First Search (BFS) and Depth-First Search (DFS) are foundational path-finding techniques...",
                        "content_practical": "def bfs(graph, start):\n    visited, queue = set(), [start]\n    while queue:\n        vertex = queue.pop(0)\n        if vertex not in visited:\n            visited.add(vertex)\n            queue.extend(set(graph[vertex]) - visited)\n    return visited",
                        "content_visual": "• BFS: Explore level by level (Queue)\n• DFS: Explore depth first (Stack)\n• Heuristics: A* search optimization",
                        "video_url": "https://www.youtube.com/embed/pcVnMTx99wM", 
                        "order": 2
                    }
                ],
                "quiz": {
                    "title": "AI Fundamentals Quiz",
                    "questions": [
                        {"text": "What does BFS stand for?", "options": "Best First Search,Breadth First Search,Binary First Search,Basic Fast Search", "correct_answer": "Breadth First Search", "explanation": "BFS explores nodes level by level starting from the root."},
                        {"text": "Which algorithm uses a heuristic to find the shortest path?", "options": "BFS,DFS,A*,Dijkstra", "correct_answer": "A*", "explanation": "A* uses both the distance from start and the estimated distance to goal (heuristic)."}
                    ]
                }
            },
            {
                "title": "Neural Networks & Deep Learning",
                "description": "Understand the architecture of the human brain-inspired neural networks.",
                "difficulty": "Advanced",
                "instructor": "Prof. Geoffrey Hinton",
                "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
                "modules": [
                    {
                        "title": "The Perceptron", 
                        "content_theoretical": "The perceptron is the simplest neural network. It consists of input weights, a sum, and an activation function...",
                        "content_practical": "import numpy as np\ndef sigmoid(x):\n    return 1 / (1 + np.exp(-x))\n\nprint(sigmoid(0.5))",
                        "content_visual": "• Weights: Adjust importance of inputs\n• Activation: Decides if a neuron fires\n• Backpropagation: Training logic",
                        "video_url": "https://www.youtube.com/embed/aircAruvnKk", 
                        "order": 1
                    }
                ],
                "quiz": {
                    "title": "Neural Networks Quiz",
                    "questions": [
                        {"text": "What is the primary goal of Backpropagation?", "options": "Data entry,Gradient calculation for weights update,Image sorting,User authentication", "correct_answer": "Gradient calculation for weights update", "explanation": "Backpropagation calculates the gradient of the error function with respect to the weights."}
                    ]
                }
            },
            {
                "title": "Python for Data Science",
                "description": "Master NumPy, Pandas, and Matplotlib for data manipulation and visualization.",
                "difficulty": "Intermediate",
                "instructor": "Sarah Lee",
                "image_url": "https://images.unsplash.com/photo-1551288049-bbbda536adca?auto=format&fit=crop&q=80&w=800",
                "modules": [
                    {
                        "title": "Pandas DataFrames", 
                        "content_theoretical": "DataFrames are 2D, labeled data structures with columns of potentially different types. Think of them like Excel spreadsheets.",
                        "content_practical": "import pandas as pd\ndf = pd.DataFrame({'Age': [25, 30], 'Name': ['Joe', 'Ann']})\nprint(df.describe())",
                        "content_visual": "• DataFrame: Rows and Columns\n• Selection: df['column']\n• Aggregation: df.groupby()",
                        "video_url": "https://www.youtube.com/embed/vmEHCJofslg", 
                        "order": 1
                    }
                ],
                "quiz": {
                    "title": "Data Science Quiz",
                    "questions": [
                        {"text": "Which library is best for numerical arrays in Python?", "options": "Pandas,NumPy,React,Flask", "correct_answer": "NumPy", "explanation": "NumPy is the core library for scientific computing in Python."}
                    ]
                }
            }
        ]
        
        # Additional courses to reach 10
        additional_configs = [
            ("Machine Learning with Scikit-Learn", "Intermediate", "https://www.youtube.com/embed/M9Itm95JzL0", "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800"),
            ("Natural Language Processing (NLP)", "Advanced", "https://www.youtube.com/embed/CMrHM8a3hqw", "https://images.unsplash.com/photo-1546776159-1bd680c1097b?auto=format&fit=crop&q=80&w=800"),
            ("Computer Vision in Python", "Advanced", "https://www.youtube.com/embed/N8Wwc_6_j3w", "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"),
            ("Python Programming: Advanced Patterns", "Intermediate", "https://www.youtube.com/embed/fA_T-y-q_4w", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800"),
            ("Rust for Python Developers", "Beginner", "https://www.youtube.com/embed/rfscVS0vtbw", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"),
            ("Data Engineering Pipelines", "Advanced", "https://www.youtube.com/embed/rfscVS0vtbw", "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800"),
            ("AI Ethics & Governance", "Beginner", "https://www.youtube.com/embed/rfscVS0vtbw", "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800")
        ]
        
        for i, (title, diff, video, img_url) in enumerate(additional_configs):
            python_courses.append({
                "title": title,
                "description": f"Master the art of {title} with practical examples and deep dives.",
                "difficulty": diff,
                "instructor": "Expert Lead",
                "image_url": img_url,
                "modules": [
                    {
                        "title": f"The Core of {title}", 
                        "content_theoretical": f"This module deep dives into the theoretical foundations of {title}. We discuss historical context and key academic papers...",
                        "content_practical": f"# Practical lab for {title}\nprint('Starting process...')\n# TODO: Implement core algorithm",
                        "content_visual": f"• Key metric for {title}\n• Optimization goal\n• Performance metrics",
                        "video_url": video, 
                        "order": 1
                    }
                ],
                "quiz": {
                    "title": f"{title} Final Test",
                    "questions": [
                        {"text": f"What is a primary principle in {title}?", "options": "Principle A,Principle B,Principle C,Principle D", "correct_answer": "Principle A", "explanation": "This is a placeholder for the actual topic-specific explanation."}
                    ]
                }
            })

        print(f"Starting seed with {len(python_courses)} courses")
        for course_data in python_courses:
            # Use a dictionary copy to be safe
            data = dict(course_data)
            modules_data = data.get("modules", [])
            quiz_item_data = data.get("quiz")
            
            # Remove keys that don't belong in the Course model
            course_model_data = {k: v for k, v in data.items() if k not in ["modules", "quiz"]}
            
            course = models.Course(**course_model_data)
            db.add(course)
            db.flush()
            print(f"Added course: {course.title} (ID: {course.id})")
            
            for mod_data in modules_data:
                module = models.Module(**mod_data, course_id=course.id)
                db.add(module)
            
            if quiz_item_data:
                questions_data = quiz_item_data.get("questions", [])
                quiz_model_data = {k: v for k, v in quiz_item_data.items() if k != "questions"}
                
                quiz = models.Quiz(**quiz_model_data, course_id=course.id)
                db.add(quiz)
                db.flush()
                
                for q_data in questions_data:
                    question = models.Question(**q_data, quiz_id=quiz.id)
                    db.add(question)
        
        db.commit()
        print("Success: Database committed.")
    except Exception as e:
        import traceback
        print(f"Seeding error: {e}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    print("Application starting up... running calibration seeding.")
    seed_data()
    print("Calibration seeding complete.")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to specific frontend URL like ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(test_routes.router)
app.include_router(analytics_routes.router)
app.include_router(recommendation_routes.router)
app.include_router(course_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Cognitive Learning Pattern Analyzer API"}
