import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService, { type Task } from '../services/api';
import TaskForm from '../components/tasks/TaskForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) {
        setError('Task ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getTask(id);
        setTask(response.data.task);
      } catch (error: unknown) {
        console.error('Error fetching task:', error);
        const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load task';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTask(updatedTask);
    navigate('/dashboard');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !task) {
    return (
      <div className="error-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
          {error || 'Task not found'}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          The task you're trying to edit could not be found or loaded.
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <TaskForm 
      task={task} 
      onSubmit={handleTaskUpdate}
    />
  );
};

export default EditTask;
