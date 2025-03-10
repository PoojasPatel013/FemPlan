# FemPlan - Empowering Women, Simplifying Life

## Overview
*FemPlan* is an all-in-one *task manager, menstrual cycle tracker, and wellness planner* designed for all the gorgeous ladies out there. It helps women streamline their *daily tasks, schedules, health tracking, and reminders* in one place. Whether you're planning your *workouts, study sessions, health checkups, or personal goals, FemPlan is here to make your life more **organized, stress-free, and empowering*!

## Features
*Task Manager* – Organize, prioritize, and track daily to-dos.  
*Menstrual Cycle Tracker* – Predict periods, ovulation, and fertility days.   
*Water & Sleep Tracker* – Stay hydrated and maintain a healthy sleep cycle.  
*Workout & Yoga Planner* – Get suggestions based on your cycle phase.  
*Self-Care & Mental Wellness* – Affirmations, and stress management tips.  

## Data Structures Used
1. *HashMap (Dictionary in Python & MongoDB)* – Efficient data retrieval for tasks, events, and menstrual cycles.  
2. *List (Arrays in JavaScript & MongoDB)* – Stores multiple logs like symptoms, moods, and reminders.  
3. *Priority Queue (FIFO for Task/Event Management)* – Ensures timely task execution.  

## Tech Stack
### *Frontend*
- *HTML, CSS, JavaScript* – Modern UI with Bootstrap.

### *Backend*
- *Python (Flask Framework)* – Handles user requests and logic.  
- *MongoDB (NoSQL Database)* – Stores structured task & health data.  
- *Flask-PyMongo* – Connects Flask with MongoDB.

## Project Structure
```
FemPlan/
│── .git/                        # Git repository metadata
│── static/                      # Static assets
│   │── css/
│   │   │── style.css            # Stylesheet for UI
│   │── img/                     # Image assets
│   │── js/
│   │   │── script.js            # JavaScript functions
│
│── templates/                   # HTML templates for Flask
│   │── analytics.html           # Analytics page
│   │── cycle.html               # Menstrual cycle tracker page
│   │── dashboard.html           # User dashboard
│   │── events.html              # Events and reminders page
│   │── index.html               # Homepage
│   │── login.html               # Login page
│   │── register.html            # Registration page
│   │── settings.html            # User settings page
│   │── tasks.html               # Task manager page
│
│── app.py                        # Main Flask application
│── README.md                     # Project documentation
│── requirements.txt               # Dependencies and libraries
```

## Why FemPlan is a Game Changer for Women
🚀 *Empowers women* to take control of their health and daily life.  
💖 *Promotes self-care* by tracking mood, symptoms, and wellness activities.  
📅 *Simplifies planning* for work, health, and personal growth.  
🌍 *Builds a supportive community* of women uplifting each other.  

## Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/PoojasPatel013/femplan.git
   cd femplan
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask app:
   ```bash
   python app.py
   ```
4. Open the app in your browser:
   ```
   http://127.0.0.1:5000/
   ```

## Contact
📩 *Email:* poojaspatel1375@gmail.com

## Made with ❤️ by Pooja Patel
FemPlan is built with love, care, and the vision to empower women everywhere. Stay strong, stay organized, and shine! ✨

