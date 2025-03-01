document.addEventListener('DOMContentLoaded', function() {
    // Custom cursor
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);

    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth > 768) {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            
            // Add a slight delay to the outline for a trailing effect
            setTimeout(() => {
                cursorOutline.style.left = e.clientX + 'px';
                cursorOutline.style.top = e.clientY + 'px';
            }, 50);
        }
    });

    // Hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, input, select, textarea, .card, .feature-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.opacity = '0.5';
            }
        });
        
        el.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.opacity = '1';
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Parallax effect for landing page
    const landingPage = document.querySelector('.landing-page');
    if (landingPage) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            landingPage.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
        });
    }

    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .stat-card, .card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('fade-in-up');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            if (this.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                // If using AJAX submission
                if (e.submitter && e.submitter.getAttribute('data-ajax') === 'true') {
                    e.preventDefault();
                    
                    const formData = new FormData(this);
                    
                    fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Close modal if open
                            const addTaskModal = document.getElementById('addTaskModal');
                            if (addTaskModal) {
                                const modal = bootstrap.Modal.getInstance(addTaskModal);
                                if (modal) {
                                    modal.hide();
                                }
                            }
                            
                            // Reset form
                            taskForm.reset();
                            
                            // Show success message
                            showAlert('Task added successfully!', 'success');
                            
                            // Refresh page or update UI
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert('An error occurred. Please try again.', 'danger');
                    });
                }
            }
            
            this.classList.add('was-validated');
        });
    }

    // Event form submission
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            if (this.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                // If using AJAX submission
                if (e.submitter && e.submitter.getAttribute('data-ajax') === 'true') {
                    e.preventDefault();
                    
                    const formData = new FormData(this);
                    
                    fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Close modal if open
                            const addEventModal = document.getElementById('addEventModal');
                            if (addEventModal) {
                                const modal = bootstrap.Modal.getInstance(addEventModal);
                                if (modal) {
                                    modal.hide();
                                }
                            }
                            
                            // Reset form
                            eventForm.reset();
                            
                            // Show success message
                            showAlert('Event added successfully!', 'success');
                            
                            // Refresh page or update UI
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert('An error occurred. Please try again.', 'danger');
                    });
                }
            }
            
            this.classList.add('was-validated');
        });
    }

    // Cycle form submission with animation
    const cycleForm = document.getElementById('cycleForm');
    if (cycleForm) {
        cycleForm.addEventListener('submit', function(e) {
            if (this.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                // If using AJAX submission
                if (e.submitter && e.submitter.getAttribute('data-ajax') === 'true') {
                    e.preventDefault();
                    
                    const formData = new FormData(this);
                    
                    // Add loading animation
                    const submitBtn = this.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...';
                    submitBtn.disabled = true;
                    
                    fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Close modal if open
                            const trackCycleModal = document.getElementById('trackCycleModal');
                            if (trackCycleModal) {
                                const modal = bootstrap.Modal.getInstance(trackCycleModal);
                                if (modal) {
                                    modal.hide();
                                }
                            }
                            
                            // Reset form
                            cycleForm.reset();
                            
                            // Show success message
                            showAlert('Menstrual cycle tracked successfully!', 'success');
                            
                            // Refresh page or update UI with animation
                            setTimeout(() => {
                                document.body.classList.add('page-transition-exit-active');
                                setTimeout(() => {
                                    window.location.reload();
                                }, 300);
                            }, 1000);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert('An error occurred. Please try again.', 'danger');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
                }
            }
            
            this.classList.add('was-validated');
        });
    }

    // Task checkbox handling with animation
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    if (taskCheckboxes.length > 0) {
        taskCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = this.dataset.id;
                if (this.checked) {
                    completeTask(taskId, this);
                }
            });
        });
    }

    // Delete task handling with animation
    const deleteTaskButtons = document.querySelectorAll('.delete-task');
    if (deleteTaskButtons.length > 0) {
        deleteTaskButtons.forEach(button => {
            button.addEventListener('click', function() {
                const taskId = this.dataset.id;
                deleteTask(taskId, this);
            });
        });
    }

    // Delete event handling with animation
    const deleteEventButtons = document.querySelectorAll('.delete-event');
    if (deleteEventButtons.length > 0) {
        deleteEventButtons.forEach(button => {
            button.addEventListener('click', function() {
                const eventId = this.dataset.id;
                deleteEvent(eventId, this);
            });
        });
    }

    // Sidebar toggle for mobile with animation
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (openSidebarBtn && closeSidebarBtn && sidebar) {
        openSidebarBtn.addEventListener('click', function() {
            sidebar.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
        });
        
        closeSidebarBtn.addEventListener('click', function() {
            sidebar.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('show') && 
                !sidebar.contains(e.target) && 
                e.target !== openSidebarBtn && 
                !openSidebarBtn.contains(e.target)) {
                sidebar.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // Dark mode toggle with animation
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Check for saved theme preference or use preferred color scheme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Initialize date inputs with today's date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }

    // Animated number counters for statistics
    const animateCounter = (element, target, duration = 1000) => {
        if (!element) return;
        
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
            } else {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            }
        };
        
        updateCounter();
    };
    
    const statNumbers = document.querySelectorAll('.stat-details h3');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.textContent);
                    animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(number => {
            observer.observe(number);
        });
    }

    // Helper functions
    function completeTask(taskId, element) {
        if (confirm('Mark this task as complete?')) {
            fetch('/complete_task/' + taskId, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const taskItem = element.closest('.task-item');
                    if (taskItem) {
                        taskItem.classList.add('completed');
                        taskItem.style.height = taskItem.offsetHeight + 'px';
                        
                        setTimeout(() => {
                            taskItem.style.height = '0';
                            taskItem.style.opacity = '0';
                            taskItem.style.padding = '0';
                            taskItem.style.margin = '0';
                            taskItem.style.overflow = 'hidden';
                            
                            setTimeout(() => {
                                taskItem.remove();
                            }, 500);
                        }, 500);
                    } else {
                        // For task list page
                        const row = element.closest('tr');
                        if (row) {
                            row.querySelector('td:nth-child(5) span').textContent = 'Completed';
                            row.querySelector('td:nth-child(5) span').classList.remove('bg-secondary');
                            row.querySelector('td:nth-child(5) span').classList.add('bg-success');
                            row.dataset.status = 'completed';
                            
                            // Add animation
                            row.style.backgroundColor = 'rgba(32, 201, 151, 0.1)';
                            setTimeout(() => {
                                row.style.backgroundColor = '';
                            }, 1000);
                            
                            element.closest('button').remove();
                        }
                    }
                    
                    showAlert('Task completed!', 'success');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred. Please try again.', 'danger');
            });
        }
    }

    function deleteTask(taskId, element) {
        if (confirm('Are you sure you want to delete this task?')) {
            fetch('/delete_task/' + taskId, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const taskItem = element.closest('.task-item');
                    if (taskItem) {
                        taskItem.style.height = taskItem.offsetHeight + 'px';
                        
                        setTimeout(() => {
                            taskItem.style.height = '0';
                            taskItem.style.opacity = '0';
                            taskItem.style.padding = '0';
                            taskItem.style.margin = '0';
                            taskItem.style.overflow = 'hidden';
                            
                            setTimeout(() => {
                                taskItem.remove();
                            }, 500);
                        }, 300);
                    } else {
                        // For task list page
                        const row = element.closest('tr');
                        if (row) {
                            row.style.height = row.offsetHeight + 'px';
                            row.style.opacity = '0';
                            
                            setTimeout(() => {
                                row.remove();
                            }, 300);
                        }
                    }
                    
                    showAlert('Task deleted!', 'success');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred. Please try again.', 'danger');
            });
        }
    }

    function deleteEvent(eventId, element) {
        if (confirm('Are you sure you want to delete this event?')) {
            fetch('/delete_event/' + eventId, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const eventItem = element.closest('.event-item');
                    if (eventItem) {
                        eventItem.style.height = eventItem.offsetHeight + 'px';
                        
                        setTimeout(() => {
                            eventItem.style.height = '0';
                            eventItem.style.opacity = '0';
                            eventItem.style.padding = '0';
                            eventItem.style.margin = '0';
                            eventItem.style.overflow = 'hidden';
                            
                            setTimeout(() => {
                                eventItem.remove();
                            }, 500);
                        }, 300);
                    } else {
                        // For event list page
                        const row = element.closest('tr');
                        if (row) {
                            row.style.height = row.offsetHeight + 'px';
                            row.style.opacity = '0';
                            
                            setTimeout(() => {
                                row.remove();
                            }, 300);
                        }
                    }
                    
                    showAlert('Event deleted!', 'success');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred. Please try again.', 'danger');
            });
        }
    }

    function showAlert(message, type) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertContainer.setAttribute('role', 'alert');
        alertContainer.style.zIndex = '9999';
        alertContainer.style.maxWidth = '300px';
        alertContainer.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        alertContainer.style.opacity = '0';
        alertContainer.style.transform = 'translateY(-20px)';
        alertContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        alertContainer.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alertContainer);
        
        // Trigger animation
        setTimeout(() => {
            alertContainer.style.opacity = '1';
            alertContainer.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            alertContainer.style.opacity = '0';
            alertContainer.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                alertContainer.remove();
            }, 300);
        }, 3000);
    }

    // Priority Queue implementation for client-side task sorting
    class PriorityQueue {
        constructor() {
            this.items = [];
        }
        
        enqueue(element, priority) {
            const queueElement = { element, priority };
            let added = false;
            
            for (let i = 0; i < this.items.length; i++) {
                if (queueElement.priority < this.items[i].priority) {
                    this.items.splice(i, 0, queueElement);
                    added = true;
                    break;
                }
            }
            
            if (!added) {
                this.items.push(queueElement);
            }
        }
        
        dequeue() {
            if (this.isEmpty()) {
                return null;
            }
            return this.items.shift().element;
        }
        
        isEmpty() {
            return this.items.length === 0;
        }
        
        getAll() {
            return this.items.map(item => item.element);
        }
    }

    // Sort tasks by priority and due date (client-side)
    function sortTasks(tasks) {
        const priorityMap = {
            'High': 0,
            'Medium': 1,
            'Low': 2
        };
        
        const taskQueue = new PriorityQueue();
        
        tasks.forEach(task => {
            let priorityValue = priorityMap[task.priority] || 3;
            
            // Add due date as secondary priority
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysLeft < 0) {
                    // Overdue tasks get highest priority
                    priorityValue = -1;
                } else {
                    // Combine priority and days left
                    priorityValue = priorityValue * 100 + daysLeft;
                }
            }
            
            taskQueue.enqueue(task, priorityValue);
        });
        
        return taskQueue.getAll();
    }

    // Search functionality with animation
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // Search tasks
            const taskItems = document.querySelectorAll('.task-item, #taskTable tbody tr');
            taskItems.forEach(item => {
                const taskTitle = item.querySelector('.form-check-label, td:first-child').textContent.toLowerCase();
                
                if (taskTitle.includes(searchTerm)) {
                    item.style.display = '';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // Search events
            const eventItems = document.querySelectorAll('.event-item');
            eventItems.forEach(item => {
                const eventTitle = item.querySelector('h6').textContent.toLowerCase();
                
                if (eventTitle.includes(searchTerm)) {
                    item.style.display = '';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    }
    // Analytics chart initialization
const completionTrendChart = document.getElementById('completionTrendChart');
if (completionTrendChart) {
    const completionTrendData = JSON.parse(completionTrendChart.dataset.trend || '[]');
    
    if (completionTrendData.length > 0) {
        const ctx = completionTrendChart.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: completionTrendData.map(item => item.day),
                datasets: [{
                    label: 'Tasks Completed',
                    data: completionTrendData.map(item => item.count),
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Task Completion Trend (Last 7 Days)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
}

// Task distribution chart
const taskDistributionChart = document.getElementById('taskDistributionChart');
if (taskDistributionChart) {
    const highPriority = parseInt(taskDistributionChart.dataset.high || 0);
    const mediumPriority = parseInt(taskDistributionChart.dataset.medium || 0);
    const lowPriority = parseInt(taskDistributionChart.dataset.low || 0);
    
    const ctx = taskDistributionChart.getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                data: [highPriority, mediumPriority, lowPriority],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Task Distribution by Priority'
                }
            }
        }
    });
}

// Event distribution chart
const eventDistributionChart = document.getElementById('eventDistributionChart');
if (eventDistributionChart) {
    const workout = parseInt(eventDistributionChart.dataset.workout || 0);
    const study = parseInt(eventDistributionChart.dataset.study || 0);
    const other = parseInt(eventDistributionChart.dataset.other || 0);
    
    const ctx = eventDistributionChart.getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Workout', 'Study', 'Health', 'Social', 'Other'],
            datasets: [{
                data: [workout, study, other],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(107, 114, 128, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(107, 114, 128, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Event Distribution by Category'
                }
            }
        }
    });
}

    // Water intake functionality with animation
    const waterGlassesInput = document.getElementById("waterGlasses");
    const waterLevelVisualization = document.getElementById("waterLevelVisualization");
    const decreaseWaterBtn = document.getElementById("decreaseWater");
    const increaseWaterBtn = document.getElementById("increaseWater");

    if (waterGlassesInput) {
        waterGlassesInput.addEventListener("input", function() {
            updateWaterVisualization(this.value);
        });
    }

    if (waterLevelVisualization && decreaseWaterBtn && increaseWaterBtn) {
        function updateWaterVisualization(glasses) {
            const percentage = (glasses / 8) * 100;
            waterLevelVisualization.style.height = `${percentage}%`;
        }

        decreaseWaterBtn.addEventListener("click", () => {
            const currentGlasses = Number.parseInt(
                document.querySelector(".water-progress .progress-bar").getAttribute("aria-valuenow")
            );
            if (currentGlasses > 0) {
                updateWaterIntake(currentGlasses - 1);
            }
        });

        increaseWaterBtn.addEventListener("click", () => {
            const currentGlasses = Number.parseInt(
                document.querySelector(".water-progress .progress-bar").getAttribute("aria-valuenow")
            );
            if (currentGlasses < 20) {
                updateWaterIntake(currentGlasses + 1);
            }
        });

        function updateWaterIntake(glasses) {
            fetch("/update_water_intake", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: `glasses=${glasses}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const progressBar = document.querySelector(".water-progress .progress-bar");
                    
                    // Animate the progress bar
                    progressBar.style.transition = "width 0.5s ease";
                    progressBar.style.width = `${(data.glasses / 8) * 100}%`;
                    progressBar.setAttribute("aria-valuenow", data.glasses);
                    
                    // Update text with animation
                    const textElement = document.querySelector(".water-progress p");
                    textElement.style.opacity = "0";
                    
                    setTimeout(() => {
                        textElement.textContent = `${data.glasses} / 8 glasses`;
                        textElement.style.opacity = "1";
                    }, 300);

                    // Update visualization in modal if open
                    if (waterLevelVisualization) {
                        updateWaterVisualization(data.glasses);
                        waterGlassesInput.value = data.glasses;
                    }
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showAlert("An error occurred. Please try again.", "danger");
            });
        }
    }

    // Sleep form submission with animation
    const sleepForm = document.getElementById("sleepForm");
    if (sleepForm) {
        sleepForm.addEventListener("submit", function(e) {
            if (this.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                // If using AJAX submission
                if (e.submitter && e.submitter.getAttribute("data-ajax") === "true") {
                    e.preventDefault();

                    const formData = new FormData(this);
                    
                    // Add loading animation
                    const submitBtn = this.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...';
                    submitBtn.disabled = true;

                    fetch(this.action, {
                        method: "POST",
                        body: formData,
                        headers: {
                            "X-Requested-With": "XMLHttpRequest"
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Close modal if open
                            const logSleepModal = document.getElementById("logSleepModal");
                            if (logSleepModal) {
                                const modal = bootstrap.Modal.getInstance(logSleepModal);
                                if (modal) {
                                    modal.hide();
                                }
                            }

                            // Show success message
                            showAlert("Sleep data logged successfully!", "success");

                            // Refresh page or update UI with animation
                            setTimeout(() => {
                                document.body.classList.add('page-transition-exit-active');
                                setTimeout(() => {
                                    window.location.reload();
                                }, 300);
                            }, 1000);
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                        showAlert("An error occurred. Please try again.", "danger");
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
                }
            }

            this.classList.add("was-validated");
        });
    }

    // Calculate sleep duration based on sleep time and wake time
    function calculateSleepDuration(sleepTime, wakeTime) {
        const sleep = new Date(`2000-01-01T${sleepTime}`);
        let wake = new Date(`2000-01-01T${wakeTime}`);

        // If wake time is earlier than sleep time, it's the next day
        if (wake < sleep) {
            wake = new Date(`2000-01-02T${wakeTime}`);
        }

        const diff = (wake - sleep) / (1000 * 60 * 60); // Convert to hours
        return Math.round(diff * 10) / 10; // Round to 1 decimal place
    }

    // Update sleep duration when sleep time or wake time changes
    const sleepTimeInput = document.getElementById("sleepTime");
    const wakeTimeInput = document.getElementById("wakeTime");

    if (sleepTimeInput && wakeTimeInput) {
        const updateDuration = () => {
            const sleepTime = sleepTimeInput.value;
            const wakeTime = wakeTimeInput.value;

            if (sleepTime && wakeTime) {
                const duration = calculateSleepDuration(sleepTime, wakeTime);
                const durationDisplay = document.createElement("div");
                durationDisplay.className = "form-text text-info";
                durationDisplay.textContent = `Sleep duration: ${duration} hours`;

                // Remove any existing duration display
                const existingDisplay = sleepTimeInput.parentNode.querySelector(".text-info");
                if (existingDisplay) {
                    existingDisplay.remove();
                }

                sleepTimeInput.parentNode.appendChild(durationDisplay);
            }
        };

        sleepTimeInput.addEventListener("change", updateDuration);
        wakeTimeInput.addEventListener("change", updateDuration);
    }

    // Page load animation
    window.addEventListener('load', function() {
        document.body.classList.add('page-transition-enter-active');
    });
});