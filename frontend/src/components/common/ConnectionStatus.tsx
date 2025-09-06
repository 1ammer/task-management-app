import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import socketService from '../../services/socketService';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  className?: string;
}

interface ServerInfo {
  serverStartTime: Date;
  serverUptime: number;
  connectedUsers: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected, connectionError, ping } = useSocket();
  const [showDetails, setShowDetails] = useState(false);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [pingStatus, setPingStatus] = useState<'success' | 'pending' | 'failed'>('pending');
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // Ping every 30 seconds to check connection
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      ping();
      setLastPing(new Date());
      setPingStatus('pending');
      
      // Set a timeout to mark ping as failed if no response in 5 seconds
      setTimeout(() => {
        setPingStatus(prev => prev === 'pending' ? 'failed' : prev);
      }, 5000);
    }, 30000);

    // Setup ping response listener
    const handlePong = () => {
      setPingStatus('success');
    };
    
    // Add event listener for pong
    window.addEventListener('socket:pong', handlePong);

    return () => {
      clearInterval(interval);
      window.removeEventListener('socket:pong', handlePong);
    };
  }, [isConnected, ping]);

  // Listen for server info and reconnection events
  useEffect(() => {
    const handleServerInfo = (info: ServerInfo) => {
      setServerInfo(info);
    };
    
    const handleReconnectAttempt = (attempt: number) => {
      setReconnecting(true);
      setReconnectAttempt(attempt);
    };
    
    const handleReconnect = () => {
      setReconnecting(false);
      setReconnectAttempt(0);
    };
    
    const handleReconnectFailed = () => {
      setReconnecting(false);
    };
    
    // Add listeners
    socketService.on('server-info', handleServerInfo);
    socketService.on('reconnect_attempt', handleReconnectAttempt);
    socketService.on('reconnect', handleReconnect);
    socketService.on('reconnect_failed', handleReconnectFailed);
    
    return () => {
      // Remove listeners
      socketService.off('server-info', handleServerInfo);
      socketService.off('reconnect_attempt', handleReconnectAttempt);
      socketService.off('reconnect', handleReconnect);
      socketService.off('reconnect_failed', handleReconnectFailed);
    };
  }, []);

  const getStatusIcon = () => {
    if (reconnecting) {
      return '🟠';
    } else if (isConnected) {
      return '🟢';
    } else if (connectionError) {
      return '🔴';
    } else {
      return '🟡';
    }
  };

  const getStatusText = () => {
    if (reconnecting) {
      return `Reconnecting (${reconnectAttempt})...`;
    } else if (isConnected) {
      return 'Online';
    } else if (connectionError) {
      return 'Connection Error';
    } else {
      return 'Connecting...';
    }
  };

  const getStatusClass = () => {
    if (reconnecting) {
      return 'connection-status--reconnecting';
    } else if (isConnected) {
      return 'connection-status--online';
    } else if (connectionError) {
      return 'connection-status--error';
    } else {
      return 'connection-status--connecting';
    }
  };

  // Format server uptime
  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className={`connection-status ${getStatusClass()} ${className}`}>
      <div 
        className="connection-status__indicator"
        onClick={() => setShowDetails(!showDetails)}
        title={`Connection status: ${getStatusText()}`}
      >
        <span className="connection-status__icon">{getStatusIcon()}</span>
        <span className="connection-status__text">{getStatusText()}</span>
      </div>
      
      {showDetails && (
        <div className="connection-status__details">
          <div className="connection-status__detail">
            <strong>Status:</strong> {getStatusText()}
          </div>
          {connectionError && (
            <div className="connection-status__detail connection-status__error">
              <strong>Error:</strong> {connectionError}
            </div>
          )}
          {isConnected && (
            <>
              <div className="connection-status__detail">
                <strong>Real-time updates:</strong> Active
              </div>
              {lastPing && (
                <div className="connection-status__detail">
                  <strong>Last ping:</strong> {lastPing.toLocaleTimeString()} 
                  {pingStatus === 'success' ? ' (✓)' : pingStatus === 'failed' ? ' (✗)' : ' (...)'}
                </div>
              )}
              {serverInfo && (
                <>
                  <div className="connection-status__detail">
                    <strong>Server uptime:</strong> {formatUptime(serverInfo.serverUptime)}
                  </div>
                  <div className="connection-status__detail">
                    <strong>Connected users:</strong> {serverInfo.connectedUsers}
                  </div>
                </>
              )}
            </>
          )}
          <div className="connection-status__info">
            Real-time updates will automatically sync tasks across all your devices.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;

