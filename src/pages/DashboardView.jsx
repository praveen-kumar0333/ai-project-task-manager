import React from 'react';
import { 
  FolderGit2, 
  CheckSquare, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  ListTodo,
  Layers,
  Activity,
  Plus
} from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import TaskCard from '../components/TaskCard.jsx';
import AiTaskGeneratorWidget from '../components/AiTaskGeneratorWidget.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { calculateDashboardMetrics, sortTasksForDashboard } from '../utils/dashboardMetrics.js';

export default function DashboardView({ 
  projects = [], 
  tasks = [], 
  activities = [],
  onNavigate, 
  onViewProject,
  onDeleteProject,
  onTaskStatusChange,
  onDeleteTask,
  onOpenAiGenerator,
  onOpenNewModal
}) {
  const metrics = calculateDashboardMetrics(projects, tasks);
  const recentProjects = projects.slice(0, 4);
  const activeQueueTasks = sortTasksForDashboard(tasks, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Overview Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Workspace Intelligence Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Project Dashboard
            </h1>
            <p className="text-sm text-indigo-100/80 mt-1 leading-relaxed">
              Track active deliverables, monitor sprint velocity, and leverage Gemini AI to break down complex projects.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAiGenerator}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>AI Task Generator</span>
            </button>
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          label="Active Projects" 
          value={metrics.activeProjects} 
          subtext={`${metrics.totalProjects} total workspace${metrics.totalProjects === 1 ? '' : 's'}`} 
          icon={FolderGit2} 
        />
        <StatCard 
          label="Tasks Pending" 
          value={metrics.pendingTasks} 
          subtext={`${metrics.completedTasks} task${metrics.completedTasks === 1 ? '' : 's'} completed`} 
          icon={CheckSquare} 
        />
        <StatCard 
          label="AI Suggestions" 
          value={activities.filter(a => a.type === 'TASKS_CREATED_BY_AI' || a.type === 'ai_generated').length > 0
            ? String(activities.filter(a => a.type === 'TASKS_CREATED_BY_AI' || a.type === 'ai_generated').length)
            : "0"
          } 
          subtext="Saved to MySQL database" 
          icon={Sparkles} 
        />
        <StatCard 
          label="Completion Rate" 
          value={`${metrics.completionRate}%`} 
          subtext={`${metrics.completedTasks} of ${metrics.totalTasks} items`} 
          isHighlight={true}
          icon={TrendingUp} 
        />
      </div>

      {/* Main Grid: Projects / Tasks (col-span-2) + AI / Activity (col-span-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Recent Projects</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">Track milestones and progress indicators</p>
              </div>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onView={onViewProject}
                    onDelete={onDeleteProject}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={FolderGit2} 
                title="No projects yet" 
                description="Start tracking your development workflow by creating your first project."
                actionLabel="Create Project"
                onAction={onOpenNewModal}
              />
            )}
          </div>

          {/* Active Tasks Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-600" />
                  <span>Active Task Queue</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">Directly toggle status or review assignments</p>
              </div>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {activeQueueTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeQueueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onTaskStatusChange}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={ListTodo} 
                title="No active tasks" 
                description="Your task queue is clear. Use the AI generator or create a new task."
                actionLabel="Add Task"
                onAction={onOpenNewModal}
              />
            )}
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* AI Task Generator Card */}
          <AiTaskGeneratorWidget 
            projects={projects}
            onOpenGeneratorModal={onOpenAiGenerator}
          />

          {/* Recent Activity Stream */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Recent Activity</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="space-y-3.5">
              {activities && activities.length > 0 ? (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs group">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 leading-snug">{act.text}</p>
                      <div className="flex items-center gap-2 mt-1 text-slate-400 font-medium">
                        <span className="truncate">{act.project}</span>
                        <span>•</span>
                        <span>{act.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center font-medium">No recent activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

