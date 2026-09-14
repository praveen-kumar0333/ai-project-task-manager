import React from 'react';
import { 
  FolderGit2, 
  CheckSquare, 
  Sparkles, 
  TrendingUp, 
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
import GlassPanel from '../components/spatial/GlassPanel.jsx';
import FloatingOrb from '../components/spatial/FloatingOrb.jsx';
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
      {/* Spatial Welcome & Overview Hero */}
      <GlassPanel 
        level="elevated"
        className="relative overflow-hidden p-6 sm:p-8 text-white border-white/15 bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 shadow-2xl shadow-indigo-950/40"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-12 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-300 mb-3 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Spatial 3D Developer Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Project Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Track active deliverables in spatial dimension, monitor sprint velocity, and leverage Gemini AI to break down complex architectures.
            </p>

            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <button
                onClick={onOpenAiGenerator}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 hover:from-indigo-500/50 hover:to-purple-500/50 border border-indigo-400/40 text-cyan-200 hover:text-white rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-indigo-500/20"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>AI Task Generator</span>
              </button>
              <button
                onClick={onOpenNewModal}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] border border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Interactive Floating AI Core Orb Widget in Hero */}
          <div 
            onClick={() => onNavigate && onNavigate('ai-assistant')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/50 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer group shadow-inner shrink-0"
            title="Launch Gemini AI Assistant"
          >
            <FloatingOrb 
              size="lg" 
              state="active" 
              showRings={true}
            />
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Gemini AI Core
              </span>
              <p className="text-[10px] text-slate-400">Click to enter Assistant</p>
            </div>
          </div>
        </div>
      </GlassPanel>

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
                <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Recent Projects</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">Track milestones and progress indicators</p>
              </div>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer group"
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
                <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-400" />
                  <span>Active Task Queue</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">Directly toggle status or review assignments</p>
              </div>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer group"
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
          <GlassPanel level="base" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-cyan-300 border border-indigo-400/30">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-white">Recent Activity</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="space-y-3.5">
              {activities && activities.length > 0 ? (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs group">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_6px_#818cf8]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 leading-snug">{act.text}</p>
                      <div className="flex items-center gap-2 mt-1 text-slate-400 font-medium">
                        <span className="truncate text-indigo-300/80">{act.project}</span>
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
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

