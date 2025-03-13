import React, { useState, useEffect, useMemo } from 'react';
import supabase, { supabaseAdmin } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';
import config from './config'; // Import secure configuration
import './Admin.css'; // import the CSS file for styles

const Admin = () => {
  // Authentication state
  const [adminPassword, setAdminPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  
  // Data states
  const [profiles, setProfiles] = useState([]);
  const [newProfiles, setNewProfiles] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [newFeedback, setNewFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [tableInfo, setTableInfo] = useState({ exists: false, permissions: false, count: 0 });
  
  // UI states
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({});
  const [viewMode, setViewMode] = useState('all'); // 'all', 'new', 'filtered', 'feedback'
  const [expandedRow, setExpandedRow] = useState(null);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (config.validateAdminPassword(adminPassword)) {
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
    
    // Set up subscription to Supabase changes - use supabaseAdmin
    const subscription = supabaseAdmin
      .channel('main-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'main' }, 
        (payload) => {
          // Add new profile to newProfiles
          setNewProfiles(current => [payload.new, ...current]);
        }
      )
      .subscribe();
      
    // Set up subscription for feedback - use supabaseAdmin
    const feedbackSubscription = supabaseAdmin
      .channel('feedback-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback' },
        (payload) => {
          // Add new feedback to newFeedback
          setNewFeedback(current => [payload.new, ...current]);
        }
      )
      .subscribe();
      
    return () => {
      supabaseAdmin.removeChannel(subscription);
      supabaseAdmin.removeChannel(feedbackSubscription);
    };
  }, [authorized]);

  // Fetch data from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get the current time for tracking new entries
      const syncTime = new Date();
      console.log('Fetching data from Supabase using admin client...');
      
      // Initialize tableInfo
      setTableInfo({ exists: false, permissions: false, count: 0 });
      
      // Try multiple approaches to get the service key
      console.log('Admin panel: Checking for service key...');
      
      // Check for service key through various methods
      let serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
      
      // If not found in environment variables, check if manually set in runtime config
      if (!serviceKey && window.SUPABASE_SERVICE_KEY) {
        console.log('Found service key in window runtime config');
        serviceKey = window.SUPABASE_SERVICE_KEY;
      }
      
      // As a last resort, allow manual entry for testing purposes
      if (!serviceKey) {
        console.error('Service key not found in environment variables or runtime config.');
        console.error('For Vercel deployments, you need to add this in the Environment Variables section of your project settings.');
        
        // Let the user know about the missing service key and how to solve it
        const manualKey = prompt(`
          Service key missing or inaccessible.
          
          To fix this permanently:
          
          1. Go to your Supabase dashboard → Project Settings → API
          2. Copy your "service_role" key (NOT the anon/public key)
          3. Go to Vercel dashboard → Project Settings → Environment Variables
          4. Add a variable named NEXT_PUBLIC_SUPABASE_SERVICE_KEY with the service role key as value
          5. Make sure it's enabled for all environments (Production, Preview, Development)
          6. Redeploy your application
          
          For temporary testing, you can paste the service role key here:`
        );
        
        if (manualKey && manualKey.trim()) {
          console.log('Using manually entered service key for this session');
          serviceKey = manualKey.trim();
          
          // Store for future use in this session
          window.SUPABASE_SERVICE_KEY = serviceKey;
          
          // Store in runtime config for debugging
          if (window.runtimeConfig) {
            window.runtimeConfig.manualKeyProvided = true;
          }
        } else {
          console.log('No manual key provided, admin functionality will be limited');
        }
      }
      
      if (!serviceKey) {
        setLoading(false);
        setTableInfo({ exists: true, permissions: false, count: 0 });
        return;
      }
      
      console.log('Service key found! Attempting to fetch data...');
      
      // Fetch profiles - first check if the table exists
      console.log('Requesting profiles from "main" table...');
      
      try {
        // Try direct fetch first as a more reliable method
        console.log('Attempting direct fetch first...');
        const response = await fetch(
          'https://qahwzhxwqgzlfymtcnde.supabase.co/rest/v1/main?select=*',
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`
            }
          }
        );
        
        if (response.ok) {
          const directData = await response.json();
          console.log('Direct fetch successful, found', directData.length, 'profiles');
          
          // Update UI with the fetched data
          setProfiles(directData || []);
          setTableInfo({ 
            exists: true, 
            permissions: true, 
            count: directData.length
          });
          
          // Update sync time and clear pending
          setLastSyncTime(syncTime);
          setNewProfiles([]);
          
          // Skip to feedback fetch
          console.log('Skipping supabase client fetch since direct fetch succeeded');
        } else {
          console.error('Direct fetch failed with status:', response.status);
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
      } catch (directFetchError) {
        console.warn('Direct fetch failed, falling back to supabase client:', directFetchError);
        
        // Create a temporary admin client with our service key
        const tempAdmin = createClient('https://qahwzhxwqgzlfymtcnde.supabase.co', serviceKey);
        
        // Fall back to supabase client with our temporary admin client
        const { data: profileData, error: profileError, count: profileCount } = await tempAdmin
          .from('main')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });
          
        if (profileError) {
          console.error('Error fetching profiles:', profileError);
          
          // Check if the error is because the table doesn't exist
          if (profileError.code === '42P01') {
            console.error('Table "main" does not exist');
            setTableInfo(prev => ({ ...prev, exists: false }));
            
            // Show alert with SQL to create the table
            if (window.confirm('The "main" table does not exist. Would you like to see the SQL to create it?')) {
              alert(`Create the main table with this SQL in Supabase SQL Editor:
              
CREATE TABLE public.main (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT,
    email TEXT,
    majors TEXT[] DEFAULT '{}'::TEXT[],
    class_level TEXT,
    interests TEXT[] DEFAULT '{}'::TEXT[],
    meal_plan BOOLEAN DEFAULT false,
    guest_swipe BOOLEAN DEFAULT false,
    dining_locations TEXT[] DEFAULT '{}'::TEXT[],
    meal_times_json JSONB,
    meal_times_flattened JSONB,
    personality_type TEXT,
    humor_type TEXT,
    conversation_type TEXT,
    planner_type TEXT,
    hp_house TEXT,
    match_preference TEXT
);

-- Enable RLS
ALTER TABLE public.main ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to insert their own profiles" 
ON public.main FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow admin read access" 
ON public.main FOR SELECT TO authenticated USING (true);

-- Grant permissions
GRANT INSERT ON public.main TO anon;
GRANT INSERT ON public.main TO authenticated;
GRANT ALL ON public.main TO service_role;`);
            }
          } else {
            // Other error - likely permissions
            setTableInfo(prev => ({ ...prev, exists: true, permissions: false }));
          }
          
          // Still set an empty profiles array
          setProfiles([]);
        } else {
          // Debug raw data
          console.log('Raw profile data response:', JSON.stringify(profileData).substring(0, 100) + '...');
          
          console.log(`Received ${profileData?.length || 0} profiles from "main" table`);
          setTableInfo({ 
            exists: true, 
            permissions: true, 
            count: profileCount || 0 
          });
          
          if (profileData && profileData.length > 0) {
            console.log('First profile sample:', JSON.stringify(profileData[0], null, 2));
            // Log array type to debug issues
            console.log('Profile data type:', Array.isArray(profileData) ? 'Array' : typeof profileData);
            console.log('Profile count from response:', profileData.length);
          } else {
            console.log('No profiles found in "main" table');
          }
          
          // Store profiles
          setProfiles(profileData || []);
        }
      }
      
      // Fetch feedback
      console.log('Requesting feedback data...');
      try {
        // Try direct fetch for feedback too
        const feedbackResponse = await fetch(
          'https://qahwzhxwqgzlfymtcnde.supabase.co/rest/v1/feedback?select=*',
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`
            }
          }
        );
        
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          console.log('Direct fetch for feedback successful, found', feedbackData.length, 'entries');
          setFeedback(feedbackData || []);
          setNewFeedback([]);
        } else {
          throw new Error('Direct fetch for feedback failed');
        }
      } catch (directFeedbackError) {
        console.warn('Direct fetch for feedback failed, falling back to supabase client:', directFeedbackError);
        
        // Create a temporary admin client with our service key
        const tempAdmin = createClient('https://qahwzhxwqgzlfymtcnde.supabase.co', serviceKey);
        
        const { data: feedbackData, error: feedbackError } = await tempAdmin
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (feedbackError) {
          console.error('Error fetching feedback:', feedbackError);
          
          // Check if the error is because the table doesn't exist
          if (feedbackError.code === '42P01') {
            console.error('Table "feedback" does not exist');
            
            // Show alert with SQL to create the feedback table
            if (window.confirm('The "feedback" table does not exist. Would you like to see the SQL to create it?')) {
              alert(`Create the feedback table with this SQL in Supabase SQL Editor:
              
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous inserts" 
ON public.feedback FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow admin full access" 
ON public.feedback USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.feedback TO anon;
GRANT ALL ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;`);
            }
          }
          
          // Still set an empty feedback array
          setFeedback([]);
        } else {
          console.log(`Received ${feedbackData?.length || 0} feedback entries`);
          setFeedback(feedbackData || []);
        }
      }
      
      // Update sync time if not already updated
      if (!lastSyncTime) {
        setLastSyncTime(syncTime);
      }
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
  
  // Handle marking feedback as viewed
  const markFeedbackAsViewed = () => {
    if (!newFeedback.length) return;
    
    setFeedback(prev => [...newFeedback, ...prev]);
    setNewFeedback([]);
  };
  
  // Filtered and sorted data for display
  const displayedProfiles = useMemo(() => {
    // If we're in feedback mode, return an empty array
    if (viewMode === 'feedback') {
      return [];
    }
    
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
  
  // Calculate displayed feedback
  const displayedFeedback = useMemo(() => {
    // Only return feedback if we're in feedback mode
    if (viewMode !== 'feedback') {
      return [];
    }
    
    let result = [...feedback];
    
    // Apply search if needed
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.text?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      return sortConfig.direction === 'asc'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    });
    
    return result;
  }, [feedback, viewMode, searchQuery, sortConfig]);
  
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
          
          {/* Add a way to set the service key if missing */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={() => {
                const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || window.SUPABASE_SERVICE_KEY;
                if (!serviceKey) {
                  const manualKey = prompt(
                    "No Supabase service key found. You can manually enter your Supabase service role key for testing purposes.\n\n" +
                    "For production, add NEXT_PUBLIC_SUPABASE_SERVICE_KEY to your Vercel environment variables.\n\n" +
                    "Service Role Key:"
                  );
                  
                  if (manualKey && manualKey.trim()) {
                    window.SUPABASE_SERVICE_KEY = manualKey.trim();
                    alert('Service key set successfully. You can now log in to the admin panel.');
                  }
                } else {
                  alert('Service key is already set.');
                }
              }}
              style={{ 
                backgroundColor: '#6b7280', 
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Set Service Key
            </button>
          </div>
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
          <button 
            onClick={async () => {
              console.log('Testing Supabase connection...');
              try {
                // Get the current service key
                let serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || window.SUPABASE_SERVICE_KEY;
                
                // If no service key is available, offer to set it manually
                if (!serviceKey) {
                  const manualKey = prompt(
                    "No service key found. You can manually enter your Supabase service role key for testing purposes.\n\n" +
                    "For production, add NEXT_PUBLIC_SUPABASE_SERVICE_KEY to your Vercel environment variables.\n\n" +
                    "Service Role Key:"
                  );
                  
                  if (manualKey && manualKey.trim()) {
                    serviceKey = manualKey.trim();
                    window.SUPABASE_SERVICE_KEY = serviceKey;
                    console.log('Using manually entered service key');
                    
                    // Reload the data with the new key
                    if (confirm('Service key set successfully. Would you like to reload the data now?')) {
                      fetchData();
                      return;
                    }
                  } else {
                    console.log('No manual key provided');
                  }
                }
                
                // Create a temporary client with the service key if available
                const client = serviceKey 
                  ? createClient('https://qahwzhxwqgzlfymtcnde.supabase.co', serviceKey) 
                  : supabaseAdmin;
                
                // Test direct access to the main table
                const { data, error, count } = await client
                  .from('main')
                  .select('*', { count: 'exact', head: true });
                
                if (error) {
                  console.error('Error accessing main table:', error);
                  
                  // Check if the error indicates the table doesn't exist
                  if (error.code === '42P01') {
                    alert('The "main" table does not exist in your database. Please create it using the SQL commands provided.');
                  } else {
                    alert(`Error accessing "main" table: ${error.message}`);
                  }
                } else {
                  console.log('Main table accessible, count:', count);
                  
                  if (count === 0) {
                    alert('The "main" table exists but contains no data yet.');
                  } else {
                    alert(`Successfully connected to "main" table.\nFound ${count} user profiles.`);
                  }
                  
                  // Now check feedback table
                  const { data: feedbackData, error: feedbackError, count: feedbackCount } = await client
                    .from('feedback')
                    .select('*', { count: 'exact', head: true });
                    
                  if (feedbackError) {
                    console.error('Error accessing feedback table:', feedbackError);
                  } else {
                    console.log(`Feedback table accessible, count: ${feedbackCount}`);
                  }
                }
              } catch (err) {
                console.error('Debug test failed:', err);
                alert(`Debug test failed: ${err.message}`);
              }
            }}
            className="sync-button"
            style={{ backgroundColor: '#6b7280', marginLeft: '10px' }}
          >
            Debug Connection
          </button>
          {lastSyncTime && (
            <span className="last-sync">
              Last synced: {formatDate(lastSyncTime)}
            </span>
          )}
        </div>
      </header>
      
      {/* Add diagnostic alerts */}
      {tableInfo.exists === false && (
        <div className="admin-alert" style={{ 
          backgroundColor: '#FFEBEE', 
          color: '#C62828', 
          padding: '10px 15px',
          borderRadius: '5px',
          margin: '15px 0',
          fontSize: '0.9rem'
        }}>
          ⚠️ The 'main' table doesn't exist in your database. Click "Debug Connection" and follow the prompts to create it.
        </div>
      )}
      
      {tableInfo.exists && !tableInfo.permissions && (
        <div className="admin-alert" style={{ 
          backgroundColor: '#FFF8E1', 
          color: '#F57F17', 
          padding: '10px 15px',
          borderRadius: '5px',
          margin: '15px 0',
          fontSize: '0.9rem'
        }}>
          ⚠️ Your API key doesn't have sufficient permissions to access the 'main' table. The service_role key should be set correctly.
        </div>
      )}
      
      {tableInfo.exists && tableInfo.permissions && tableInfo.count === 0 && (
        <div className="admin-alert" style={{ 
          backgroundColor: '#E3F2FD', 
          color: '#1565C0', 
          padding: '10px 15px',
          borderRadius: '5px',
          margin: '15px 0',
          fontSize: '0.9rem'
        }}>
          ℹ️ The 'main' table exists but contains no data. This is normal if you haven't had any sign-ups yet. When sign-ups are enabled and users register, data will appear here.
        </div>
      )}
      
      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            type="text"
            placeholder={viewMode === 'feedback' ? "Search feedback..." : "Search users..."}
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
          <button 
            className={`view-button ${viewMode === 'feedback' ? 'active' : ''}`}
            onClick={() => setViewMode('feedback')}
          >
            Feedback
            {newFeedback.length > 0 && <span className="badge">{newFeedback.length}</span>}
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
          {newFeedback.length > 0 && viewMode === 'feedback' && (
            <button onClick={markFeedbackAsViewed} className="action-button mark-viewed-button">
              Mark Feedback As Viewed
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
      
      {!loading && viewMode === 'feedback' ? (
        // Feedback display section
        <div className="data-table-container">
          {displayedFeedback.length === 0 ? (
            <div className="no-data-message">No feedback available.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => requestSort('created_at')}>
                    Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {displayedFeedback.map((item, index) => (
                  <tr key={item.id || index} className={newFeedback.some(f => f.id === item.id) ? 'new-entry' : ''}>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : !loading && displayedProfiles.length === 0 ? (
        // No data message for profiles
        <div className="no-data-message">
          {viewMode === 'new' 
            ? "No new users since last sync." 
            : viewMode === 'filtered'
              ? "No users match your current filters."
              : "No user data available."}
        </div>
      ) : (
        // Profiles display section
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
