import React, { useState } from 'react';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import type { Task } from '../../services/api';
import './TaskCard.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

interface TaskCardProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getCategoryColor = (category: Task['category']) => {
    const colors = {
      WORK: '#3b82f6',
      PERSONAL: '#10b981',
      STUDY: '#8b5cf6',
      HEALTH: '#f59e0b',
      OTHER: '#6b7280',
    };
    return colors[category];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444',
    };
    return colors[priority];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.updateTask(task.id, {
        completed: !task.completed,
      });
      onUpdate(response.data.task);
      toast.success(`Task marked as ${!task.completed ? 'completed' : 'incomplete'}`);
    } catch (error: unknown) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await apiService.deleteTask(task.id);
      onDelete(task.id);
      toast.success('Task deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-card-header">
        <div className="task-title-section">
          <h3 className="task-title">{task.title}</h3>
          <div className="task-badges">
            <span 
              className="task-badge category"
              style={{ backgroundColor: getCategoryColor(task.category) }}
            >
              {task.category}
            </span>
            <span 
              className="task-badge priority"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
            <span className={`task-badge status ${task.status.toLowerCase()}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="task-actions">
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`task-action-btn complete-btn ${task.completed ? 'completed' : ''}`}
            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed ? '✓' : '○'}
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            className="task-action-btn delete-btn"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <span className="task-date">Created: {formatDate(task.createdAt)}</span>
        {task.updatedAt !== task.createdAt && (
          <span className="task-date">Updated: {formatDate(task.updatedAt)}</span>
        )}
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
        contentLabel="Delete Task Confirmation"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '400px',
            width: '90%',
            borderRadius: '12px',
            border: 'none',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <h4 style={{ margin: '0 0 12px 0', color: '#1f2937', fontWeight: '600' }}>
          Delete Task
        </h4>
        <p style={{ margin: '0 0 20px 0', color: '#4b5563', lineHeight: '1.5' }}>
          Are you sure you want to delete "{task.title}"? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TaskCard;
