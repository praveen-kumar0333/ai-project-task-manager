import React, { useState } from 'react';
import { FolderGit2, Plus, Filter, Search, RotateCcw } from 'lucide-react';
import ProjectCard from '../components/ProjectCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GlassPanel from '../components/spatial/GlassPanel.jsx';

export default function ProjectsView({ 
  projects = [], 
  onViewProject, 
  onDeleteProject, 
  onOpenNewProjectModal,
  searchQuery = '',
  onClearSearch
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  const categories = ['All', 'Backend', 'Frontend', 'Security', 'Database'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesPriority = 
      selectedPriority === 'All' || p.priority?.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedPriority('All');
    if (onClearSearch) onClearSearch();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Projects Directory</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your development projects, milestone tracking, and task completion rates
          </p>
        </div>
        <button
          onClick={onOpenNewProjectModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 shrink-0 cursor-pointer self-start sm:self-auto border border-white/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Spatial Filter Toolbar */}
      <GlassPanel level="base" className="p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-500/30 text-cyan-300 border border-indigo-400/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Selector & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              {priorities.map((pri) => (
                <option key={pri} value={pri} className="bg-slate-900 text-slate-200">{pri}</option>
              ))}
            </select>
          </div>

          {(selectedCategory !== 'All' || selectedPriority !== 'All' || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </GlassPanel>

      {/* Project Cards Grid / Empty States */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={onViewProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects in workspace"
          description="You have not added any projects yet. Create your first project to start organizing tasks."
          actionLabel="Create First Project"
          onAction={onOpenNewProjectModal}
        />
      ) : searchQuery ? (
        <EmptyState
          icon={Search}
          title={`No projects match "${searchQuery}"`}
          description="We couldn't find any projects matching your search term. Clear the search or create a new project."
          secondaryActionLabel="Clear Search"
          onSecondaryAction={onClearSearch}
          actionLabel="Create Project"
          onAction={onOpenNewProjectModal}
        />
      ) : (
        <EmptyState
          icon={FolderGit2}
          title="No projects match the selected filters"
          description={`No ${selectedCategory !== 'All' ? selectedCategory : ''} projects with ${selectedPriority !== 'All' ? selectedPriority : ''} priority.`}
          secondaryActionLabel="Reset Filters"
          onSecondaryAction={handleResetFilters}
          actionLabel="Create Project"
          onAction={onOpenNewProjectModal}
        />
      )}
    </div>
  );
}
