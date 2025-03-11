import React, { useState, useEffect, useMemo } from 'react';
import supabase from './supabaseClient';
import './Admin.css'; // import the CSS file for styles

const Admin = () => {
  // Authentication state
  const [adminPassword, setAdminPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  
  // Data states
  const [profiles, setProfiles] = useState([]);
  const [newProfiles, setNewProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // UI states
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({});
  const [viewMode, setViewMode] = useState('all'); // 'all', 'new', 'filtered'
  const [expandedRow, setExpandedRow] = useState(null);
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === 'zachisking') {
      setAuthorized(true);
    } else {
      alert('Incorrect admin password.');
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (authorized) {
      fetchData();
    }
  }, [authorized]);
  
  // Set up real-time subscriptions for new data
  useEffect(() => {
    if (!authorized) return;
    
    // Set up subscription to Supabase changes
    const subscription = supabase
      .channel('main-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'main' }, 
        (payload) => {
          // Add new profile to newProfiles
          setNewProfiles(current => [payload.new, ...current]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [authorized]);

  // Fetch data from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get the current time for tracking new entries
      const syncTime = new Date();
      
      const { data, error } = await supabase
        .from('main')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Store all profiles
      setProfiles(data || []);
      setLastSyncTime(syncTime);
      
      // Clear any pending "new" profiles since we just did a full sync
      setNewProfiles([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle row selection
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };
  
  // Handle bulk selection
  const selectAllRows = () => {
    if (selectedRows.length === displayedProfiles.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedProfiles.map(profile => profile.id));
    }
  };
  
  // Handle row expansion
  const toggleRowExpansion = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!selectedRows.length) return;
    
    if (window.confirm(`Are you sure you want to remove ${selectedRows.length} entries from the dashboard view? This won't affect the database.`)) {
      setProfiles(prev => prev.filter(profile => !selectedRows.includes(profile.id)));
      setNewProfiles(prev => prev.filter(profile => !selectedRows.includes(profile.id)));
      setSelectedRows([]);
    }
  };
  
  // Handle marking as viewed (moving from new to regular)
  const markAsViewed = () => {
    if (!newProfiles.length) return;
    
    setProfiles(prev => [...newProfiles, ...prev]);
    setNewProfiles([]);
  };
  
  // Filtered and sorted data for display
  const displayedProfiles = useMemo(() => {
    let result = [];
    
    // Determine which dataset to use
    if (viewMode === 'new') {
      result = [...newProfiles];
    } else if (viewMode === 'all') {
      result = [...profiles];
    } else if (viewMode === 'filtered') {
      result = [...profiles.filter(profile => {
        // Apply all active filters
        for (const [key, value] of Object.entries(filterConfig)) {
          if (value && profile[key] !== value) {
            return false;
          }
        }
        return true;
      })];
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(profile => 
        profile.name?.toLowerCase().includes(query) ||
        profile.email?.toLowerCase().includes(query) ||
        profile.majors?.some(major => major.toLowerCase().includes(query)) ||
        profile.interests?.some(interest => interest.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle different data types
        if (typeof a[sortConfig.key] === 'string') {
          return sortConfig.direction === 'asc'
            ? (a[sortConfig.key] || '').localeCompare(b[sortConfig.key] || '')
            : (b[sortConfig.key] || '').localeCompare(a[sortConfig.key] || '');
        } else if (Array.isArray(a[sortConfig.key])) {
          return sortConfig.direction === 'asc'
            ? (a[sortConfig.key]?.length || 0) - (b[sortConfig.key]?.length || 0)
            : (b[sortConfig.key]?.length || 0) - (a[sortConfig.key]?.length || 0);
        } else {
          return sortConfig.direction === 'asc'
            ? (a[sortConfig.key] || 0) - (b[sortConfig.key] || 0)
            : (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0);
        }
      });
    }
    
    return result;
  }, [profiles, newProfiles, viewMode, filterConfig, searchQuery, sortConfig]);
  
  // Request a sort by column
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Set a filter value
  const setFilter = (key, value) => {
    setFilterConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setViewMode('filtered');
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilterConfig({});
    setViewMode('all');
  };
  
  // Helper to format array data
  const formatArrayField = (array, limit = 3) => {
    if (!Array.isArray(array) || array.length === 0) return 'None';
    
    const displayed = array.slice(0, limit);
    const extras = array.length > limit ? `+${array.length - limit} more` : '';
    
    return (
      <div className="array-data">
        {displayed.map((item, index) => (
          <span key={index} className="array-item">{item}</span>
        ))}
        {extras && <span className="array-extras">{extras}</span>}
      </div>
    );
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Login screen if not authorized
  if (!authorized) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handlePasswordSubmit} className="admin-login-form">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="admin-password-input"
            />
            <button type="submit" className="admin-submit-button">
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main admin dashboard
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Strangers Admin Panel</h1>
        <div className="admin-controls">
          <button onClick={fetchData} disabled={loading} className="sync-button">
            {loading ? 'Syncing...' : 'Sync Data'}
          </button>
          {lastSyncTime && (
            <span className="last-sync">
              Last synced: {formatDate(lastSyncTime)}
            </span>
          )}
        </div>
      </header>
      
      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="admin-view-options">
          <button 
            className={`view-button ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            All Users ({profiles.length})
          </button>
          <button 
            className={`view-button ${viewMode === 'new' ? 'active' : ''}`}
            onClick={() => setViewMode('new')}
          >
            New Users
            {newProfiles.length > 0 && <span className="badge">{newProfiles.length}</span>}
          </button>
          <button 
            className={`view-button ${viewMode === 'filtered' ? 'active' : ''}`}
            onClick={() => setViewMode('filtered')}
            disabled={Object.keys(filterConfig).length === 0}
          >
            Filtered
          </button>
        </div>
        
        <div className="admin-actions">
          {selectedRows.length > 0 && (
            <button onClick={handleDelete} className="action-button delete-button">
              Remove ({selectedRows.length})
            </button>
          )}
          {newProfiles.length > 0 && viewMode === 'new' && (
            <button onClick={markAsViewed} className="action-button mark-viewed-button">
              Mark All As Viewed
            </button>
          )}
          {Object.keys(filterConfig).length > 0 && (
            <button onClick={clearFilters} className="action-button clear-filters-button">
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {loading && <div className="loading-indicator">Loading data...</div>}
      
      {!loading && displayedProfiles.length === 0 ? (
        <div className="no-data-message">
          {viewMode === 'new' 
            ? "No new users since last sync." 
            : viewMode === 'filtered'
              ? "No users match your current filters."
              : "No user data available."}
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input 
                    type="checkbox" 
                    checked={selectedRows.length === displayedProfiles.length && displayedProfiles.length > 0}
                    onChange={selectAllRows}
                  />
                </th>
                <th className="sortable" onClick={() => requestSort('name')}>
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sortable" onClick={() => requestSort('email')}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sortable" onClick={() => requestSort('class_level')}>
                  Class {sortConfig.key === 'class_level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Majors</th>
                <th>Interests</th>
                <th className="sortable" onClick={() => requestSort('dining_locations')}>
                  Dining {sortConfig.key === 'dining_locations' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sortable" onClick={() => requestSort('created_at')}>
                  Created {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProfiles.map(profile => (
                <React.Fragment key={profile.id}>
                  <tr className={`data-row ${selectedRows.includes(profile.id) ? 'selected' : ''} ${newProfiles.some(p => p.id === profile.id) ? 'new-entry' : ''}`}>
                    <td className="checkbox-column">
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(profile.id)}
                        onChange={() => toggleRowSelection(profile.id)}
                      />
                    </td>
                    <td>{profile.name || 'Not specified'}</td>
                    <td>{profile.email}</td>
                    <td>
                      <span 
                        className="filterable-value"
                        onClick={() => setFilter('class_level', profile.class_level)}
                      >
                        {profile.class_level || 'Not specified'}
                      </span>
                    </td>
                    <td>{formatArrayField(profile.majors)}</td>
                    <td>{formatArrayField(profile.interests)}</td>
                    <td>
                      {formatArrayField(profile.dining_locations)}
                    </td>
                    <td>{formatDate(profile.created_at)}</td>
                    <td>
                      <button 
                        className="expand-button"
                        onClick={() => toggleRowExpansion(profile.id)}
                      >
                        {expandedRow === profile.id ? 'Collapse' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded row with details */}
                  {expandedRow === profile.id && (
                    <tr className="expanded-row">
                      <td colSpan={9}>
                        <div className="expanded-content">
                          <div className="detail-section">
                            <h3>Personal</h3>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Personality Type:</label>
                                <span>{profile.personality_type || 'Not specified'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Humor Type:</label>
                                <span>{profile.humor_type || 'Not specified'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Conversation Type:</label>
                                <span>{profile.conversation_type || 'Not specified'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Planner Type:</label>
                                <span>{profile.planner_type || 'Not specified'}</span>
                              </div>
                              <div className="detail-item">
                                <label>HP House:</label>
                                <span>{profile.hp_house || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="detail-section">
                            <h3>Meal Preferences</h3>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Meal Plan:</label>
                                <span>{profile.meal_plan ? 'Yes' : 'No'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Guest Swipe:</label>
                                <span>{profile.guest_swipe ? 'Yes' : 'No'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Match Preference:</label>
                                <span>{profile.match_preference || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="detail-section">
                            <h3>Meal Times</h3>
                            <div className="meal-times-display">
                              {profile.meal_times_json && renderMealTimes(JSON.parse(profile.meal_times_json))}
                            </div>
                          </div>
                          
                          <div className="detail-section">
                            <h3>Full Interests</h3>
                            <div className="interests-grid">
                              {profile.interests?.map((interest, index) => (
                                <span key={index} className="interest-tag">
                                  {interest}
                                </span>
                              ))}
                              {(!profile.interests || profile.interests.length === 0) && 
                                <span className="no-data">No interests specified</span>
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper function to render meal times
const renderMealTimes = (mealTimes) => {
  if (!mealTimes || typeof mealTimes !== 'object') {
    return <span className="no-data">No meal times specified</span>;
  }

  return Object.entries(mealTimes).map(([day, meals]) => {
    if (!meals || typeof meals !== 'object') {
      return null;
    }
    
    // Filter only the meals that have times
    const validMeals = Object.entries(meals)
      .filter(([, times]) => Array.isArray(times) && times.length > 0)
      .map(([meal, times]) => (
        <div key={meal} className="meal">
          <span className="meal-label">{meal}:</span> {times.join(', ')}
        </div>
      ));
        
    if (validMeals.length > 0) {
      return (
        <div key={day} className="meal-day">
          <div className="day-label">{day}:</div>
          <div className="meals-container">{validMeals}</div>
        </div>
      );
    }
    return null;
  }).filter(Boolean);
};

export default Admin;
