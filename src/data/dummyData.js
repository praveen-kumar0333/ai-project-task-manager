export const initialUser = {
  name: 'Alex Dev',
  role: 'Full-Stack Developer Intern',
  cohort: 'Innovation Hacks #1042',
  email: 'alex.dev@internship.example',
  avatarInitials: 'AD',
  status: 'Active'
};

export const initialProjects = [
  {
    id: 'p1',
    title: 'E-Commerce API Service',
    description: 'Node.js backend with automated inventory sync, rate limiting, and Stripe webhook handling.',
    category: 'Backend',
    priority: 'High',
    status: 'in-progress',
    progress: 72,
    tasksCount: 6,
    completedTasksCount: 4,
    dueDate: '2026-09-20',
    createdAt: '2026-08-15'
  },
  {
    id: 'p2',
    title: 'Auth Microservice',
    description: 'JWT-based authentication module with password hashing, token rotation, and RBAC.',
    category: 'Security',
    priority: 'Urgent',
    status: 'in-progress',
    progress: 95,
    tasksCount: 5,
    completedTasksCount: 4,
    dueDate: '2026-09-12',
    createdAt: '2026-08-20'
  },
  {
    id: 'p3',
    title: 'Developer Metrics Dashboard',
    description: 'Responsive React productivity dashboard with real-time metrics, search, and dynamic filtering.',
    category: 'Frontend',
    priority: 'Medium',
    status: 'in-progress',
    progress: 60,
    tasksCount: 8,
    completedTasksCount: 5,
    dueDate: '2026-09-30',
    createdAt: '2026-09-01'
  },
  {
    id: 'p4',
    title: 'Cloud Database Migration',
    description: 'MySQL relational schema design, connection pooling, and normalized table relationships.',
    category: 'Database',
    priority: 'Low',
    status: 'todo',
    progress: 25,
    tasksCount: 4,
    completedTasksCount: 1,
    dueDate: '2026-10-05',
    createdAt: '2026-09-02'
  }
];

export const initialTasks = [
  {
    id: 't1',
    projectId: 'p1',
    projectTitle: 'E-Commerce API Service',
    title: 'Implement Stripe Webhook Handler',
    description: 'Safely handle payment_intent.succeeded and checkout.session.completed with signature verification.',
    status: 'in-progress',
    priority: 'High',
    dueDate: '2026-09-15',
    assignee: 'Alex Dev'
  },
  {
    id: 't2',
    projectId: 'p1',
    projectTitle: 'E-Commerce API Service',
    title: 'Add Inventory SKU Validation',
    description: 'Prevent inventory race conditions using atomic database transactions.',
    status: 'done',
    priority: 'Medium',
    dueDate: '2026-09-08',
    assignee: 'Alex Dev'
  },
  {
    id: 't3',
    projectId: 'p2',
    projectTitle: 'Auth Microservice',
    title: 'Configure Refresh Token Rotation',
    description: 'Store hashed tokens and invalidate family on token reuse detection.',
    status: 'done',
    priority: 'Urgent',
    dueDate: '2026-09-10',
    assignee: 'Alex Dev'
  },
  {
    id: 't4',
    projectId: 'p2',
    projectTitle: 'Auth Microservice',
    title: 'Setup Centralized Error Handling',
    description: 'Format standard JSON error responses with status codes and validation details.',
    status: 'done',
    priority: 'High',
    dueDate: '2026-09-11',
    assignee: 'Alex Dev'
  },
  {
    id: 't5',
    projectId: 'p3',
    projectTitle: 'Developer Metrics Dashboard',
    title: 'Responsive Mobile Navigation Drawer',
    description: 'Implement seamless slide-over drawer with accessible touch targets on small screens.',
    status: 'done',
    priority: 'Medium',
    dueDate: '2026-09-06',
    assignee: 'Alex Dev'
  },
  {
    id: 't6',
    projectId: 'p3',
    projectTitle: 'Developer Metrics Dashboard',
    title: 'Clean Minimalist UI Polish',
    description: 'Align color palettes to slate neutrals and crisp indigo accents with WCAG AA compliance.',
    status: 'in-progress',
    priority: 'Low',
    dueDate: '2026-09-14',
    assignee: 'Alex Dev'
  },
  {
    id: 't7',
    projectId: 'p4',
    projectTitle: 'Cloud Database Migration',
    title: 'Design Normalized SQL Schema',
    description: 'Write DDL for users, projects, and tasks with cascading foreign keys.',
    status: 'todo',
    priority: 'High',
    dueDate: '2026-09-18',
    assignee: 'Alex Dev'
  },
  {
    id: 't8',
    projectId: 'p4',
    projectTitle: 'Cloud Database Migration',
    title: 'Benchmark Connection Pool Limits',
    description: 'Test mysql2 connection pool sizing under concurrent Express requests.',
    status: 'todo',
    priority: 'Low',
    dueDate: '2026-09-25',
    assignee: 'Alex Dev'
  }
];

export const initialActivities = [
  {
    id: 'a1',
    type: 'task_completed',
    text: 'Completed task "Setup Centralized Error Handling"',
    timestamp: '2 hours ago',
    project: 'Auth Microservice'
  },
  {
    id: 'a2',
    type: 'ai_generated',
    text: 'AI generated 4 suggested tasks for E-Commerce API',
    timestamp: '5 hours ago',
    project: 'E-Commerce API Service'
  },
  {
    id: 'a3',
    type: 'project_created',
    text: 'Created project "Cloud Database Migration"',
    timestamp: 'Yesterday',
    project: 'Cloud Database Migration'
  },
  {
    id: 'a4',
    type: 'task_started',
    text: 'Moved "Implement Stripe Webhook Handler" to In-Progress',
    timestamp: 'Yesterday',
    project: 'E-Commerce API Service'
  }
];
