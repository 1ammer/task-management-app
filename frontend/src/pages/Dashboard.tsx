import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Task } from '../services/api';
import TaskCard from '../components/tasks/TaskCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useDebounce } from '../utils/debounce';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('ALL');
  
  // Ref to maintain focus on search input
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use debounced search value
  const debouncedSearch = useDebounce(searchInput, 300);

  // Memoize filter object to prevent unnecessary re-renders
  const filter = useMemo(() => ({
    category,
    search: debouncedSearch
  }), [category, debouncedSearch]);

  useEffect(() => {
    const loadTasks = async () => {
      // Only show loading spinner for initial load
      if (isInitialLoad) {
        setIsLoading(true);
      }
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (filter.category !== 'ALL') {
          params.append('category', filter.category);
        }
        if (filter.search.trim()) {
          params.append('search', filter.search.trim());
        }
        
        const queryString = params.toString();
        const response = await apiService.getTasks(queryString ? `?${queryString}` : '');
        setTasks(response.data.tasks);
      } catch (error: unknown) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    
    loadTasks();
  }, [filter, isInitialLoad]);



  // Memoize task handlers to prevent re-renders
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  }, []);

  const handleTaskDelete = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  // Memoize search input handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setCategory('ALL');
  }, []);


  const filteredTasks = tasks;

  // Memoize task stats to prevent recalculation on every render
  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    high_priority: tasks.filter(task => task.priority === 'HIGH' && !task.completed).length,
  }), [tasks]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title-section">
            <h1 className="dashboard-title">Task Dashboard</h1>
            <p className="dashboard-subtitle">Manage your tasks efficiently</p>
          </div>
          <Link to="/tasks/new" className="btn btn-primary">
            + New Task
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{taskStats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{taskStats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{taskStats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card high-priority">
            <div className="stat-number">{taskStats.high_priority}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>

        <div className="dashboard-filters">
          <div className="filter-group">
            <label htmlFor="search-filter" className="filter-label">Search:</label>
            <input
              ref={searchInputRef}
              id="search-filter"
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={handleSearchChange}
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter" className="filter-label">Category:</label>
            <select
              id="category-filter"
              value={category}
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="ALL">All Categories</option>
              <option value="WORK">Work</option>
              <option value="PERSONAL">Personal</option>
              <option value="STUDY">Study</option>
              <option value="HEALTH">Health</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>

        <div className="dashboard-content">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              {tasks.length === 0 ? (
                <>
                  <h3>No tasks found with the selected filters</h3>
                  <p>Create your first task to get started!</p>
                </>
              ) : (
                <>
                  <h3>No tasks match your filters</h3>
                  <p>Try adjusting your filter criteria or create a new task.</p>
                </>
              )}
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
