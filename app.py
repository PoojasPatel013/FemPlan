from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import heapq
import json
from functools import wraps
import random

app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb+srv://poojaspatel1375:Pooja1375@femplann.zfzkl.mongodb.net/?retryWrites=true&w=majority&appName=Femplann'
app.secret_key = 'poohhhhh'  # Change this in production
mongo = PyMongo(app)
bcrypt = Bcrypt(app)

# Data structures for efficient task management
class PriorityQueue:
    def __init__(self):
        self.tasks = []
        self.entry_finder = {}
        self.counter = 0
        self.REMOVED = '<removed-task>'
    
    def add_task(self, task, priority=0):
        if task['_id'] in self.entry_finder:
            self.remove_task(task['_id'])
        count = self.counter
        self.counter += 1
        entry = [priority, count, task]
        self.entry_finder[task['_id']] = entry
        heapq.heappush(self.tasks, entry)
    
    def remove_task(self, task_id):
        entry = self.entry_finder.pop(task_id)
        entry[-1] = self.REMOVED
    
    def pop_task(self):
        while self.tasks:
            priority, count, task = heapq.heappop(self.tasks)
            if task is not self.REMOVED:
                del self.entry_finder[task['_id']]
                return task
        raise KeyError('pop from an empty priority queue')
    
    def get_all_tasks(self):
        result = []
        temp_tasks = self.tasks.copy()
        while temp_tasks:
            priority, count, task = heapq.heappop(temp_tasks)
            if task is not self.REMOVED:
                result.append(task)
        return result

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        
        # Check if username already exists
        if mongo.db.users.find_one({'username': username}):
            flash('Username already exists', 'danger')
            return redirect(url_for('register'))
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Insert user
        user_id = mongo.db.users.insert_one({
            'username': username,
            'password': hashed_password,
            'email': email,
            'created_at': datetime.utcnow(),
            'settings': {
                'theme': 'light',
                'notifications': True
            }
        }).inserted_id
        
        session['user_id'] = str(user_id)
        session['username'] = username
        
        flash('Registration successful!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = mongo.db.users.find_one({'username': username})
        
        if user and bcrypt.check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            session['username'] = user['username']
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Login unsuccessful. Please check username and password', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user's tasks, events, and cycle data
    user_id = session['user_id']
    
    # Use priority queue for tasks
    tasks = list(mongo.db.tasks.find({'user_id': user_id}))
    priority_map = {'High': 0, 'Medium': 1, 'Low': 2}
    
    task_queue = PriorityQueue()
    for task in tasks:
        task['_id'] = str(task['_id'])  # Convert ObjectId to string
        priority_value = priority_map.get(task['priority'], 3)
        # Add due date as secondary priority
        if 'due_date' in task:
            days_left = (task['due_date'] - datetime.utcnow()).days
            if days_left < 0:
                days_left = 0
            priority_value = priority_value * 100 + days_left
        task_queue.add_task(task, priority_value)
    
    sorted_tasks = task_queue.get_all_tasks()
    
    # Get events sorted by date
    events = list(mongo.db.events.find({'user_id': user_id}).sort('date', 1))
    for event in events:
        event['_id'] = str(event['_id'])
    
    # Get latest cycle data
    cycle = mongo.db.cycles.find_one({'user_id': user_id}, sort=[("_id", -1)])
    
    # Get upcoming notifications
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    upcoming_tasks = list(mongo.db.tasks.find({
        'user_id': user_id,
        'due_date': {'$gte': today, '$lt': tomorrow}
    }))
    
    upcoming_events = list(mongo.db.events.find({
        'user_id': user_id,
        'date': {'$gte': today, '$lt': tomorrow}
    }))
    
    notifications = []
    for task in upcoming_tasks:
        notifications.append({
            'type': 'task',
            'title': task['title'],
            'due': task['due_date']
        })
    
    for event in upcoming_events:
        notifications.append({
            'type': 'event',
            'title': event['title'],
            'due': event['date']
        })
    
    # Check for upcoming menstrual cycle
    if cycle:
        next_cycle = cycle['next_cycle_date']
        days_to_cycle = (next_cycle - today).days
        
        if 0 <= days_to_cycle <= 3:
            notifications.append({
                'type': 'cycle',
                'title': 'Upcoming menstrual cycle',
                'due': next_cycle
            })
    
    # Add new data for women's health features
    user_id = session['user_id']
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Fetch mood and symptom logs
    mood_logs = list(mongo.db.mood_logs.find({'user_id': user_id}).sort('date', -1).limit(7))
    
    # Fetch water intake
    water_intake = mongo.db.water_intake.find_one({'user_id': user_id, 'date': today.strftime('%Y-%m-%d')})
    
    # Fetch sleep data
    sleep_data = mongo.db.sleep_data.find_one({'user_id': user_id, 'date': today})
    
    # Fetch self-care goals
    self_care_goals = list(mongo.db.self_care_goals.find({'user_id': user_id, 'date': today}))
    
    # Fetch workout suggestions based on cycle phase
    cycle_phase = get_cycle_phase(user_id)  # Implement this function
    workout_suggestions = get_workout_suggestions(cycle_phase)  # Implement this function
    
    return render_template(
        'dashboard.html',
        tasks=sorted_tasks,
        events=events,
        cycle=cycle,
        notifications=notifications,
        username=session['username'],
        mood_logs=mood_logs,
        water_intake=water_intake,
        sleep_data=sleep_data,
        self_care_goals=self_care_goals,
        workout_suggestions=workout_suggestions, 
        now = datetime.utcnow(),
        timedelta=timedelta
    )

@app.route('/tasks')
@login_required
def tasks():
    user_id = session['user_id']
    tasks = list(mongo.db.tasks.find({'user_id': user_id}))
    for task in tasks:
        task['_id'] = str(task['_id'])
    
    return render_template('tasks.html', tasks=tasks)

@app.route('/add_task', methods=['POST'])
@login_required
def add_task():
    user_id = session['user_id']
    title = request.form['title']
    priority = request.form['priority']
    due_date = datetime.strptime(request.form['due_date'], "%Y-%m-%d")
    category = request.form.get('category', 'General')
    description = request.form.get('description', '')
    
    task_id = mongo.db.tasks.insert_one({
        'user_id': user_id,
        'title': title,
        'description': description,
        'priority': priority,
        'category': category,
        'due_date': due_date,
        'created_at': get_utc_now(),  # Updated from utcnow()
        'completed': False
    }).inserted_id
    
    flash('Task added successfully!', 'success')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True, 'task_id': str(task_id)})
    return redirect(url_for('dashboard'))

@app.route('/complete_task/<task_id>', methods=['POST'])
@login_required
def complete_task(task_id):
    user_id = session['user_id']
    
    task = mongo.db.tasks.find_one({'_id': ObjectId(task_id), 'user_id': user_id})
    if not task:
        flash('Task not found', 'danger')
        return redirect(url_for('dashboard'))
    
    mongo.db.tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': {'completed': True, 'completed_at': get_utc_now()}}  # Updated from utcnow()
    )
    
    flash('Task marked as complete!', 'success')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True})
    return redirect(url_for('dashboard'))

@app.route('/delete_task/<task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    user_id = session['user_id']
    
    result = mongo.db.tasks.delete_one({'_id': ObjectId(task_id), 'user_id': user_id})
    
    if result.deleted_count:
        flash('Task deleted successfully!', 'success')
    else:
        flash('Task not found', 'danger')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True})
    return redirect(url_for('dashboard'))

@app.route('/events')
@login_required
def events():
    user_id = session['user_id']
    events = list(mongo.db.events.find({'user_id': user_id}).sort('date', 1))
    for event in events:
        event['_id'] = str(event['_id'])
    
    return render_template('events.html', events=events)

@app.route('/add_event', methods=['POST'])
@login_required
def add_event():
    user_id = session['user_id']
    title = request.form['title']
    date = datetime.strptime(request.form['date'], "%Y-%m-%d")
    category = request.form['category']
    description = request.form.get('description', '')
    
    event_id = mongo.db.events.insert_one({
        'user_id': user_id,
        'title': title,
        'description': description,
        'date': date,
        'category': category,
        'created_at': get_utc_now()  # Updated from utcnow()
    }).inserted_id
    
    flash('Event added successfully!', 'success')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True, 'event_id': str(event_id)})
    return redirect(url_for('dashboard'))

@app.route('/delete_event/<event_id>', methods=['POST'])
@login_required
def delete_event(event_id):
    user_id = session['user_id']
    
    result = mongo.db.events.delete_one({'_id': ObjectId(event_id), 'user_id': user_id})
    
    if result.deleted_count:
        flash('Event deleted successfully!', 'success')
    else:
        flash('Event not found', 'danger')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True})
    return redirect(url_for('dashboard'))

@app.route('/cycle')
@login_required
def cycle():
    user_id = session['user_id']
    cycles = list(mongo.db.cycles.find({'user_id': user_id}).sort('last_cycle_date', -1))
    for cycle in cycles:
        cycle['_id'] = str(cycle['_id'])
    
    # Add the current datetime to the template context
    now = datetime.utcnow()
    
    return render_template('cycle.html', cycles=cycles, now=now)

@app.route('/track_cycle', methods=['POST'])
@login_required
def track_cycle():
    user_id = session['user_id']
    last_cycle_date = datetime.strptime(request.form['last_cycle_date'], "%Y-%m-%d")
    cycle_length = int(request.form['cycle_length'])
    period_length = int(request.form.get('period_length', 5))
    
    # Calculate next cycle date
    next_cycle_date = last_cycle_date + timedelta(days=cycle_length)
    
    # Calculate fertility window (typically 12-16 days before next period)
    fertility_start = next_cycle_date - timedelta(days=16)
    fertility_end = next_cycle_date - timedelta(days=12)
    
    cycle_id = mongo.db.cycles.insert_one({
        'user_id': user_id,
        'last_cycle_date': last_cycle_date,
        'cycle_length': cycle_length,
        'period_length': period_length,
        'next_cycle_date': next_cycle_date,
        'fertility_window': {
            'start': fertility_start,
            'end': fertility_end
        },
        'tracked_at': datetime.utcnow()
    }).inserted_id
    
    # Add cycle as an event
    mongo.db.events.insert_one({
        'user_id': user_id,
        'title': 'Menstrual Cycle',
        'date': next_cycle_date,
        'category': 'Health',
        'description': f'Expected menstrual cycle (Duration: {period_length} days)',
        'created_at': datetime.utcnow()
    })
    
    flash('Menstrual cycle tracked successfully!', 'success')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True, 'cycle_id': str(cycle_id)})
    return redirect(url_for('dashboard'))

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    user_id = session['user_id']
    
    if request.method == 'POST':
        theme = request.form.get('theme', 'light')
        notifications = 'notifications' in request.form
        
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'settings.theme': theme,
                'settings.notifications': notifications
            }}
        )
        
        flash('Settings updated successfully!', 'success')
        return redirect(url_for('settings'))
    
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    return render_template('settings.html', user=user)

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    user_id = session['user_id']
    email = request.form.get('email')
    
    if email:
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'email': email}}
        )
        flash('Profile updated successfully!', 'success')
    else:
        flash('Email is required', 'danger')
    
    return redirect(url_for('settings'))

@app.route('/change_password', methods=['POST'])
@login_required
def change_password():
    user_id = session['user_id']
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')
    
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    
    if not bcrypt.check_password_hash(user['password'], current_password):
        flash('Current password is incorrect', 'danger')
    elif new_password != confirm_password:
        flash('New passwords do not match', 'danger')
    else:
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password': hashed_password}}
        )
        flash('Password changed successfully!', 'success')
    
    return redirect(url_for('settings'))

@app.route('/delete_account', methods=['POST'])
@login_required
def delete_account():
    user_id = session['user_id']
    confirm_password = request.form.get('confirm_password')
    
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    
    if bcrypt.check_password_hash(user['password'], confirm_password):
        # Delete user data
        mongo.db.tasks.delete_many({'user_id': user_id})
        mongo.db.events.delete_many({'user_id': user_id})
        mongo.db.cycles.delete_many({'user_id': user_id})
        mongo.db.users.delete_one({'_id': ObjectId(user_id)})
        
        session.clear()
        flash('Your account has been deleted', 'info')
        return redirect(url_for('index'))
    else:
        flash('Incorrect password', 'danger')
        return redirect(url_for('settings'))

@app.route('/export_data')
@login_required
def export_data():
    user_id = session['user_id']
    
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)}, {'password': 0})
    tasks = list(mongo.db.tasks.find({'user_id': user_id}))
    events = list(mongo.db.events.find({'user_id': user_id}))
    cycles = list(mongo.db.cycles.find({'user_id': user_id}))
    
    export_data = {
        'user': user_data,
        'tasks': tasks,
        'events': events,
        'cycles': cycles
    }
    
    return jsonify(export_data)

@app.route('/api/calendar')
@login_required
def calendar_data():
    user_id = session['user_id']
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    if start_date and end_date:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    else:
        # Default to current month
        today = datetime.utcnow()
        start = datetime(today.year, today.month, 1)
        if today.month == 12:
            end = datetime(today.year + 1, 1, 1)
        else:
            end = datetime(today.year, today.month + 1, 1)
    
    # Get tasks
    tasks = list(mongo.db.tasks.find({
        'user_id': user_id,
        'due_date': {'$gte': start, '$lt': end}
    }))
    
    # Get events
    events = list(mongo.db.events.find({
        'user_id': user_id,
        'date': {'$gte': start, '$lt': end}
    }))
    
    # Get cycle data
    cycle = mongo.db.cycles.find_one({'user_id': user_id}, sort=[("_id", -1)])
    
    calendar_events = []
    
    # Add tasks to calendar
    for task in tasks:
        calendar_events.append({
            'id': str(task['_id']),
            'title': task['title'],
            'start': task['due_date'].strftime("%Y-%m-%d"),
            'allDay': True,
            'backgroundColor': '#ff9f89' if task['priority'] == 'High' else '#ffcc80' if task['priority'] == 'Medium' else '#a5d6a7',
            'borderColor': '#e57373' if task['priority'] == 'High' else '#ffb74d' if task['priority'] == 'Medium' else '#81c784',
            'type': 'task',
            'completed': task.get('completed', False)
        })
    
    # Add events to calendar
    for event in events:
        calendar_events.append({
            'id': str(event['_id']),
            'title': event['title'],
            'start': event['date'].strftime("%Y-%m-%d"),
            'allDay': True,
            'backgroundColor': '#90caf9' if event['category'] == 'Workout' else '#ce93d8' if event['category'] == 'Study' else '#80deea',
            'borderColor': '#64b5f6' if event['category'] == 'Workout' else '#ba68c8' if event['category'] == 'Study' else '#4dd0e1',
            'type': 'event'
        })
    
    # Add cycle data if available
    if cycle:
        next_cycle = cycle['next_cycle_date']
        period_length = cycle.get('period_length', 5)
        
        # Add period days
        for i in range(period_length):
            period_date = next_cycle + timedelta(days=i)
            if start <= period_date < end:
                calendar_events.append({
                    'id': f"cycle_{i}",
                    'title': 'Period' if i == 0 else '',
                    'start': period_date.strftime("%Y-%m-%d"),
                    'allDay': True,
                    'backgroundColor': '#f48fb1',
                    'borderColor': '#ec407a',
                    'type': 'cycle'
                })
        
        # Add fertility window
        if 'fertility_window' in cycle:
            fertility_start = cycle['fertility_window']['start']
            fertility_end = cycle['fertility_window']['end']
            
            for i in range((fertility_end - fertility_start).days + 1):
                fertility_date = fertility_start + timedelta(days=i)
                if start <= fertility_date < end:
                    calendar_events.append({
                        'id': f"fertility_{i}",
                        'title': 'Fertility Window' if i == 0 else '',
                        'start': fertility_date.strftime("%Y-%m-%d"),
                        'allDay': True,
                        'backgroundColor': '#c5e1a5',
                        'borderColor': '#aed581',
                        'type': 'fertility'
                    })
    
    return jsonify(calendar_events)

@app.route('/analytics')
@login_required
def analytics():
    user_id = session['user_id']
    
    # Get completed tasks count
    completed_tasks = mongo.db.tasks.count_documents({
        'user_id': user_id,
        'completed': True
    })
    
    # Get pending tasks count
    pending_tasks = mongo.db.tasks.count_documents({
        'user_id': user_id,
        'completed': False
    })
    
    # Get tasks by priority
    high_priority = mongo.db.tasks.count_documents({
        'user_id': user_id,
        'priority': 'High'
    })
    
    medium_priority = mongo.db.tasks.count_documents({
        'user_id': user_id,
        'priority': 'Medium'
    })
    
    low_priority = mongo.db.tasks.count_documents({
        'user_id': user_id,
        'priority': 'Low'
    })
    
    # Get events by category
    workout_events = mongo.db.events.count_documents({
        'user_id': user_id,
        'category': 'Workout'
    })
    
    study_events = mongo.db.events.count_documents({
        'user_id': user_id,
        'category': 'Study'
    })
    
    other_events = mongo.db.events.count_documents({
        'user_id': user_id,
        'category': 'Other'
    })
    
    # Get task completion trend (last 7 days)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    completion_trend = []
    for i in range(7):
        day = today - timedelta(days=i)
        next_day = day + timedelta(days=1)
        
        completed = mongo.db.tasks.count_documents({
            'user_id': user_id,
            'completed': True,
            'completed_at': {'$gte': day, '$lt': next_day}
        })
        
        completion_trend.append({
            'date': day.strftime("%Y-%m-%d"),
            'day': day.strftime("%a"),
            'count': completed
        })
    
    completion_trend.reverse()
    
    return render_template(
        'analytics.html',
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        high_priority=high_priority,
        medium_priority=medium_priority,
        low_priority=low_priority,
        workout_events=workout_events,
        study_events=study_events,
        other_events=other_events,
        completion_trend=json.dumps(completion_trend)
    )

@app.route('/log_mood', methods=['POST'])
@login_required
def log_mood():
    user_id = session['user_id']
    mood = request.form.get('mood')
    symptoms = request.form.getlist('symptoms')
    notes = request.form.get('notes')
    
    mongo.db.mood_logs.insert_one({
        'user_id': user_id,
        'date': datetime.utcnow(),
        'mood': mood,
        'symptoms': symptoms,
        'notes': notes
    })
    
    flash('Mood and symptoms logged successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/update_water_intake', methods=['POST'])
@login_required
def update_water_intake():
    user_id = session['user_id']
    glasses = int(request.form.get('glasses', 0))
    today = datetime.utcnow().date()
    
    # Convert date to string for MongoDB
    today_str = today.strftime('%Y-%m-%d')
    
    mongo.db.water_intake.update_one(
        {'user_id': user_id, 'date': today_str},
        {'$set': {'glasses': glasses}},
        upsert=True
    )
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True, 'glasses': glasses})
    
    flash('Water intake updated successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/log_sleep', methods=['POST'])
@login_required
def log_sleep():
    user_id = session['user_id']
    sleep_time = request.form.get('sleep_time')
    wake_time = request.form.get('wake_time')
    quality = int(request.form.get('quality'))
    
    # Calculate sleep duration
    sleep_duration = calculate_sleep_duration(sleep_time, wake_time)
    
    # Use datetime object instead of date object for MongoDB
    today_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    mongo.db.sleep_data.insert_one({
        'user_id': user_id,
        'date': today_date,
        'sleep_time': sleep_time,
        'wake_time': wake_time,
        'duration': sleep_duration,
        'quality': quality
    })
    
    flash('Sleep data logged successfully!', 'success')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True})
    return redirect(url_for('dashboard'))

@app.route('/add_self_care_goal', methods=['POST'])
@login_required
def add_self_care_goal():
    user_id = session['user_id']
    goal = request.form.get('goal')
    category = request.form.get('category')
    
    mongo.db.self_care_goals.insert_one({
        'user_id': user_id,
        'date': datetime.utcnow().date(),
        'goal': goal,
        'category': category,
        'completed': False
    })
    
    flash('Self-care goal added successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/complete_self_care_goal/<goal_id>', methods=['POST'])
@login_required
def complete_self_care_goal(goal_id):
    user_id = session['user_id']
    
    result = mongo.db.self_care_goals.update_one(
        {'_id': ObjectId(goal_id), 'user_id': user_id},
        {'$set': {'completed': True}}
    )
    
    if result.modified_count:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Goal not found or already completed'})

@app.route('/get_daily_quote')
@login_required
def get_daily_quote():
    quotes = [
        "You are strong, you are beautiful, you are enough.",
        "Embrace your cycle, embrace your power.",
        "Your body is a temple, treat it with love and respect.",
        "Self-care is not selfish, it's necessary.",
        "You are capable of amazing things.",
        "Every day is a new opportunity to nourish your body and mind.",
        "Your worth is not measured by your productivity.",
        "Listen to your body, it's trying to tell you something.",
        "You are a force of nature.",
        "Take care of yourself as you would your best friend."
    ]
    return jsonify({'quote': random.choice(quotes)})

@app.route('/get_pms_tips')
@login_required
def get_pms_tips():
    tips = [
        "Stay hydrated to help reduce bloating.",
        "Eat foods rich in calcium and magnesium to ease cramps.",
        "Practice gentle yoga or stretching to relieve tension.",
        "Use a heating pad on your lower abdomen to soothe cramps.",
        "Get plenty of rest and prioritize sleep.",
        "Avoid caffeine and alcohol, which can worsen symptoms.",
        "Try aromatherapy with lavender or peppermint essential oils.",
        "Practice deep breathing or meditation to reduce stress.",
        "Eat small, frequent meals to stabilize blood sugar levels.",
        "Wear comfortable, loose-fitting clothing."
    ]
    return jsonify({'tip': random.choice(tips)})

def get_cycle_phase(user_id):
    # Implement logic to determine the user's current menstrual cycle phase
    # This is a placeholder implementation
    phases = ['menstrual', 'follicular', 'ovulatory', 'luteal']
    return random.choice(phases)

def get_workout_suggestions(cycle_phase):
    suggestions = {
        'menstrual': ['Gentle yoga', 'Light walking', 'Stretching'],
        'follicular': ['Strength training', 'High-Intensity Interval Training (HIIT)', 'Running'],
        'ovulatory': ['Dance workouts', 'Cycling', 'Pilates'],
        'luteal': ['Moderate cardio', 'Swimming', 'Bodyweight exercises']
    }
    return suggestions.get(cycle_phase, ['Walking', 'Yoga', 'Light cardio'])

def calculate_sleep_duration(sleep_time, wake_time):
    """Calculate sleep duration in hours from sleep time and wake time."""
    from datetime import datetime, timedelta
    
    # Parse the time strings
    sleep_dt = datetime.strptime(sleep_time, "%H:%M")
    wake_dt = datetime.strptime(wake_time, "%H:%M")
    
    # If wake time is earlier than sleep time, it's the next day
    if wake_dt < sleep_dt:
        wake_dt += timedelta(days=1)
    
    # Calculate the difference in hours
    duration = (wake_dt - sleep_dt).total_seconds() / 3600
    
    # Round to 1 decimal place
    return round(duration, 1)

def get_utc_now():
    return datetime.utcnow()

if __name__ == '__main__':
    with app.app_context():
        mongo.db.tasks.create_index([('user_id', 1), ('due_date', 1)])
        mongo.db.tasks.create_index([('user_id', 1), ('completed', 1)])
        mongo.db.events.create_index([('user_id', 1), ('date', 1)])
        mongo.db.cycles.create_index([('user_id', 1), ('next_cycle_date', 1)])
        mongo.db.mood_logs.create_index([('user_id', 1), ('date', 1)])
        mongo.db.water_intake.create_index([('user_id', 1), ('date', 1)])
        mongo.db.sleep_data.create_index([('user_id', 1), ('date', 1)])
        mongo.db.self_care_goals.create_index([('user_id', 1), ('date', 1)])

    app.run(debug=True)

