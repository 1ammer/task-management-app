import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-hero">
          <h1 className="home-title">
            Organize Your Tasks,
            <br />
            <span className="home-title-highlight">Boost Your Productivity</span>
          </h1>
          <p className="home-description">
            A simple and elegant task management application to help you stay organized
            and productive. Create, manage, and track your tasks with ease.
          </p>
          
          <div className="home-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3 className="feature-title">Task Management</h3>
            <p className="feature-description">
              Create, edit, and organize your tasks with categories, priorities, and status tracking.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Priority System</h3>
            <p className="feature-description">
              Set priorities for your tasks to focus on what matters most and stay productive.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Responsive Design</h3>
            <p className="feature-description">
              Access your tasks from any device with our mobile-first responsive design.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your tasks are private and secure with JWT-based authentication system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
