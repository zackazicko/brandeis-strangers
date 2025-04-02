import React, { useState, useEffect, useMemo } from 'react';
import supabase, { supabaseAdmin } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';
import config from './config'; // Import secure configuration
import './Admin.css'; // import the CSS file for styles
import Home from './Home'; // Import Home component for sign-up functionality

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
  const [viewMode, setViewMode] = useState('all'); // 'all', 'new', 'filtered', 'feedback', 'analytics'
  const [expandedRow, setExpandedRow] = useState(null);
  
  // State for analytics view
  const [selectedAnalytic, setSelectedAnalytic] = useState('overview'); // 'overview', 'signups', 'mealTimes'
  
  // State for matching groups
  const [userMatchingGroups, setUserMatchingGroups] = useState({});
  const [maxMatchingGroup, setMaxMatchingGroup] = useState(1);
  
  // State for sign-up modal
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  
  // Reference to Home component
  const homeRef = React.useRef(null);
  
  // Function to update a user's matching group
  const updateUserMatchingGroup = (userId, groupNumber) => {
    // Convert to number, ensuring it's at least 0
    const numGroup = Math.max(0, parseInt(groupNumber, 10) || 0);
    
    // Update the max group number if needed
    if (numGroup > maxMatchingGroup) {
      setMaxMatchingGroup(numGroup);
    }
    
    // Update the matching group for this user
    setUserMatchingGroups(prev => ({
      ...prev,
      [userId]: numGroup
    }));
  };
  
  // Function to get a user's matching group
  const getUserMatchingGroup = (userId) => {
    return userMatchingGroups[userId] || 0;
  };
  
  // Function to get color for a matching group
  const getMatchingGroupColor = (groupNumber) => {
    if (groupNumber === 0) return 'transparent'; // No group
    
    // Define an array of light pastel colors for different groups
    const colors = [
      '#E6F7FF', // Light blue
      '#F6FFED', // Light green
      '#FFF7E6', // Light yellow
      '#FCF5FF', // Light purple
      '#FFF0F6', // Light pink
      '#E6FFFB', // Light cyan
      '#FCFFE6', // Light lime
      '#FFF1F0', // Light red
      '#F0F5FF', // Light blue-purple
      '#FFF2E8'  // Light orange
    ];
    
    // Use modulo to cycle through colors if we have more groups than colors
    return colors[(groupNumber - 1) % colors.length];
  };
  
  // Initialize tree view functionality
  useEffect(() => {
    if (viewMode === 'analytics' && selectedAnalytic === 'mealTimes') {
      // Initialize all tree nodes
      const dayContents = document.querySelectorAll('.day-content');
      dayContents.forEach(element => {
        element.style.display = 'block'; // Show day content by default
      });
      
      const mealContents = document.querySelectorAll('.meal-content');
      mealContents.forEach(element => {
        element.style.display = 'block'; // Show meal content by default
      });
      
      const timeSlotContents = document.querySelectorAll('.time-slot-content');
      timeSlotContents.forEach(element => {
        element.style.display = 'block'; // Show time slot content by default
      });
      
      // Update arrow icons to show expanded state
      const toggleHeaders = document.querySelectorAll('.day-header, .meal-header, .time-slot-header');
      toggleHeaders.forEach(header => {
        const arrow = header.querySelector('.expand-icon');
        if (arrow) {
          arrow.style.transform = 'rotate(90deg)';
        }
        
        // Add rotation to arrows when expanding/collapsing
        header.addEventListener('click', function() {
          const arrow = this.querySelector('.expand-icon');
          
          // Find the content div that corresponds to this header
          const contentId = this.nextElementSibling.id;
          const contentDiv = document.getElementById(contentId);
          
          if (contentDiv) {
            // Toggle display
            const isHidden = contentDiv.style.display === 'none';
            contentDiv.style.display = isHidden ? 'block' : 'none';
            
            // Rotate arrow
            arrow.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
          }
        });
      });
    }
  }, [viewMode, selectedAnalytic]);

  // Function to open sign-up modal through Home component
  const testSignUp = () => {
    // If we have a reference to the Home component
    if (homeRef.current && typeof homeRef.current.openModalForTesting === 'function') {
      homeRef.current.openModalForTesting();
    } else {
      // Create a temporary Home instance for testing
      setShowSignUpModal(true);
    }
  };
  
  // Close sign-up modal
  const closeSignUpModal = () => {
    setShowSignUpModal(false);
  };

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
    phone TEXT, /* Phone number stored as text */
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
    match_preference TEXT,
    housing_status TEXT, /* For housing status: "looking to pull a roommate", "need to be pulled into a group", "all set!" */
    roommate_gender_preference TEXT, /* For gender preference: "male", "female", "no preference" */
    cleanliness_level TEXT, /* For cleanliness levels */
    housing_time_period TEXT, /* For housing time period: "fall only", "spring only", "full year" */
    housing_number TEXT /* Optional housing number */
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
    // If we're in feedback mode or analytics mode, return an empty array
    if (viewMode === 'feedback' || viewMode === 'analytics') {
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
        (profile.phone && profile.phone.includes(query)) ||
        profile.majors?.some(major => major.toLowerCase().includes(query)) ||
        profile.interests?.some(interest => interest.toLowerCase().includes(query)) ||
        profile.housing_status?.toLowerCase().includes(query) ||
        profile.roommate_gender_preference?.toLowerCase().includes(query) ||
        profile.cleanliness_level?.toLowerCase().includes(query) ||
        profile.housing_time_period?.toLowerCase().includes(query) ||
        profile.housing_number?.toLowerCase().includes(query)
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
  
  // Convert profiles data to CSV and download it
  const downloadCSV = async () => {
    // Don't attempt to download if no data
    if (!profiles || profiles.length === 0) {
      alert('No data available to download.');
      return;
    }

    try {
      // Get all unique column names from all profile objects
      const allKeys = new Set();
      profiles.forEach(profile => {
        Object.keys(profile).forEach(key => allKeys.add(key));
      });
      
      const columns = Array.from(allKeys);
      
      // Create CSV header row
      let csv = columns.join(',') + '\n';
      
      // Add data rows
      profiles.forEach(profile => {
        const row = columns.map(column => {
          // Handle different data types
          const value = profile[column];
          
          if (value === null || value === undefined) {
            return '';
          }
          
          if (Array.isArray(value)) {
            // Convert arrays to quoted strings with semicolon separators
            return `"${value.join(';')}"`;
          }
          
          if (typeof value === 'object') {
            // Convert objects to JSON strings
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          
          // Handle strings that might contain commas or quotes
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          
          // Other primitive values
          return value;
        }).join(',');
        
        csv += row + '\n';
      });
      
      // Create a download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Get current date for filename
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `strangers sign up data (${dateStr}).csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error creating CSV file:', error);
      alert('Failed to generate CSV file. Please try again.');
    }
  };
  
  // Analytics helper functions
  
  // Process data for overview stats
  const getOverviewStats = () => {
    if (!profiles || profiles.length === 0) return null;
    
    // Total signups
    const totalSignups = profiles.length;
    
    // Signups by class level
    const signupsByClass = profiles.reduce((acc, profile) => {
      const classLevel = profile.class_level || 'Not specified';
      acc[classLevel] = (acc[classLevel] || 0) + 1;
      return acc;
    }, {});
    
    // Has meal plan
    const hasMealPlan = profiles.filter(p => p.meal_plan).length;
    
    // Has guest swipe
    const hasGuestSwipe = profiles.filter(p => p.guest_swipe).length;
    
    // Signups by day/date created
    const signupsByDate = profiles.reduce((acc, profile) => {
      if (!profile.created_at) return acc;
      
      const date = new Date(profile.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalSignups,
      signupsByClass,
      hasMealPlan,
      hasGuestSwipe,
      signupsByDate
    };
  };
  
  // Process data for meal times visualization
  const getMealTimesData = () => {
    if (!profiles || profiles.length === 0) return null;
    
    // Compile all meal time selections
    const days = ['sunday', 'thursday', 'friday', 'saturday'];
    const meals = ['lunch', 'dinner'];
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Add date information for each day with current year
    const dayLabels = {
      thursday: `Thursday (Apr 4, ${currentYear})`,
      friday: `Friday (Apr 5, ${currentYear})`,
      saturday: `Saturday (Apr 6, ${currentYear})`
    };
    
    // Structure: days -> meals -> timeSlots -> users
    const mealTimesTree = {};
    
    days.forEach(day => {
      mealTimesTree[day] = {
        userCount: 0,
        meals: {}
      };
      
      meals.forEach(meal => {
        mealTimesTree[day].meals[meal] = {
          userCount: 0,
          timeSlots: {}
        };
      });
    });
    
    // Process each profile's meal times
    profiles.forEach(profile => {
      if (!profile.meal_times_json) return;
      
      // Try to parse the meal times JSON
      let mealTimesObj;
      try {
        mealTimesObj = typeof profile.meal_times_json === 'string' 
          ? JSON.parse(profile.meal_times_json) 
          : profile.meal_times_json;
      } catch (e) {
        console.error('Error parsing meal_times_json for profile:', profile.id);
        return;
      }
      
      // For each day and meal, count the user's selections
      days.forEach(day => {
        const dayData = mealTimesObj[day];
        if (!dayData) return;
        
        let userCountedForDay = false;
        
        meals.forEach(meal => {
          const mealData = dayData[meal];
          if (!Array.isArray(mealData) || mealData.length === 0) return;
          
          // Count user for this day if not already counted
          if (!userCountedForDay) {
            mealTimesTree[day].userCount++;
            userCountedForDay = true;
          }
          
          // Count user for this meal
          mealTimesTree[day].meals[meal].userCount++;
          
          // Count user for each time slot
          mealData.forEach(timeSlot => {
            if (!mealTimesTree[day].meals[meal].timeSlots[timeSlot]) {
              mealTimesTree[day].meals[meal].timeSlots[timeSlot] = {
                userCount: 0,
                users: [],
                timeDisplay: timeSlot // Store the original time display for rendering
              };
            }
            
            mealTimesTree[day].meals[meal].timeSlots[timeSlot].userCount++;
            // Include more user details with a matchingGroup field (default is 0 - no group assigned)
            mealTimesTree[day].meals[meal].timeSlots[timeSlot].users.push({
              id: profile.id,
              name: profile.name || 'Anonymous',
              email: profile.email,
              interests: profile.interests || [],
              majors: profile.majors || [],
              class_level: profile.class_level || 'Not specified',
              matchingGroup: profile.matchingGroup || 0 // Default to no group
            });
          });
        });
      });
    });
    
    return mealTimesTree;
  };
  
  // Render a simple bar chart using DOM elements
  const renderBarChart = (data, title, colorClass = 'primary') => {
    if (!data || Object.keys(data).length === 0) {
      return <div className="no-data-message">No data available for this chart.</div>;
    }
    
    // Find the maximum value for scaling
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="bar-chart">
          {Object.entries(data).map(([label, value], index) => (
            <div key={index} className="bar-container">
              <div className="bar-label">{label}</div>
              <div className="bar-wrapper">
                <div 
                  className={`bar bar-${colorClass}`} 
                  style={{ width: `${(value / maxValue) * 100}%` }}
                >
                  <span className="bar-value">{value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
          <button 
            onClick={testSignUp} 
            className="sync-button"
            style={{ backgroundColor: '#28a745', marginLeft: '10px' }}
          >
            Test Sign Up
          </button>
          <button
            onClick={downloadCSV}
            className="sync-button"
            style={{ backgroundColor: '#4a6da7', marginLeft: '10px' }}
          >
            Download CSV
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
          <button 
            className={`view-button ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => setViewMode('analytics')}
          >
            Analytics
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
      
      {!loading && viewMode === 'analytics' ? (
        // Analytics view section
        <div className="analytics-container">
          <div className="analytics-tabs">
            <button 
              className={`analytics-tab ${selectedAnalytic === 'overview' ? 'active' : ''}`}
              onClick={() => setSelectedAnalytic('overview')}
            >
              Overview
            </button>
            <button 
              className={`analytics-tab ${selectedAnalytic === 'signups' ? 'active' : ''}`}
              onClick={() => setSelectedAnalytic('signups')}
            >
              Signups by Date
            </button>
            <button 
              className={`analytics-tab ${selectedAnalytic === 'mealTimes' ? 'active' : ''}`}
              onClick={() => setSelectedAnalytic('mealTimes')}
            >
              Meal Times
            </button>
          </div>
          
          <div className="analytics-content">
            {selectedAnalytic === 'overview' && (
              <div className="overview-analytics">
                <h3>Overview Statistics</h3>
                
                {!profiles || profiles.length === 0 ? (
                  <div className="no-data-message">No user data available for analytics.</div>
                ) : (
                  <>
                    {/* Stats cards */}
                    <div className="stats-cards">
                      <div className="stat-card">
                        <div className="stat-value">{profiles.length}</div>
                        <div className="stat-label">Total Signups</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-value">
                          {getOverviewStats()?.hasMealPlan || 0}
                        </div>
                        <div className="stat-label">Have Meal Plan</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-value">
                          {getOverviewStats()?.hasGuestSwipe || 0}
                        </div>
                        <div className="stat-label">Have Guest Swipes</div>
                      </div>
                    </div>
                    
                    {/* Class level breakdown */}
                    {renderBarChart(
                      getOverviewStats()?.signupsByClass || {}, 
                      'Signups by Class Level',
                      'blue'
                    )}
                  </>
                )}
              </div>
            )}
            
            {selectedAnalytic === 'signups' && (
              <div className="signups-analytics">
                <h3>Signups by Date</h3>
                
                {!profiles || profiles.length === 0 ? (
                  <div className="no-data-message">No user data available for analytics.</div>
                ) : (
                  <>
                    {renderBarChart(
                      getOverviewStats()?.signupsByDate || {}, 
                      'User Registrations by Date',
                      'green'
                    )}
                    
                    <div className="analytics-info">
                      <p>
                        This chart shows the number of user signups per day.
                        Days with higher signup rates might indicate increased marketing efforts
                        or specific events that drove traffic to the application.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {selectedAnalytic === 'mealTimes' && (
              <div className="meal-times-analytics">
                <h3>Meal Times Analysis</h3>
                
                {!profiles || profiles.length === 0 ? (
                  <div className="no-data-message">No user data available for analytics.</div>
                ) : (
                  <>
                    <div className="matching-groups-controls">
                      <h4>Matching Groups</h4>
                      <p className="matching-instructions">
                        Assign users to matching groups by entering a group number (1, 2, 3, etc.).
                        Users with the same group number will be highlighted with the same color for easy matching.
                      </p>
                      <button 
                        className="reset-groups-button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reset all matching groups?')) {
                            setUserMatchingGroups({});
                            setMaxMatchingGroup(1);
                          }
                        }}
                      >
                        Reset All Groups
                      </button>
                    </div>

                    <div className="meal-times-tree">
                      {/* Tree visualization for meal times */}
                      {Object.entries(getMealTimesData() || {}).map(([day, dayData]) => (
                        <div key={day} className="day-node">
                          <div className="day-header" onClick={() => {
                            // Toggle expand/collapse for this day
                            const dayElement = document.getElementById(`day-content-${day}`);
                            if (dayElement) {
                              dayElement.style.display = 
                                dayElement.style.display === 'none' ? 'block' : 'none';
                            }
                          }}>
                            <span className="expand-icon">▶</span>
                            <span className="day-name">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </span>
                            <span className="day-count">
                              {dayData.userCount} {dayData.userCount === 1 ? 'user' : 'users'}
                            </span>
                          </div>
                          
                          <div id={`day-content-${day}`} className="day-content">
                            {Object.entries(dayData.meals).map(([meal, mealData]) => (
                              <div key={`${day}-${meal}`} className="meal-node">
                                <div className="meal-header" onClick={() => {
                                  // Toggle expand/collapse for this meal
                                  const mealElement = document.getElementById(`meal-content-${day}-${meal}`);
                                  if (mealElement) {
                                    mealElement.style.display = 
                                      mealElement.style.display === 'none' ? 'block' : 'none';
                                  }
                                }}>
                                  <span className="expand-icon">▶</span>
                                  <span className="meal-name">
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                  </span>
                                  <span className="meal-count">
                                    {mealData.userCount} {mealData.userCount === 1 ? 'user' : 'users'}
                                  </span>
                                </div>
                                
                                <div id={`meal-content-${day}-${meal}`} className="meal-content">
                                  {Object.entries(mealData.timeSlots).map(([timeSlot, slotData]) => (
                                    <div key={`${day}-${meal}-${timeSlot}`} className="time-slot-node">
                                      <div className="time-slot-header" onClick={() => {
                                        // Toggle expand/collapse for this time slot
                                        const slotElement = document.getElementById(`slot-content-${day}-${meal}-${timeSlot.replace(/:/g, '-').replace(/\s/g, '-')}`);
                                        if (slotElement) {
                                          slotElement.style.display = 
                                            slotElement.style.display === 'none' ? 'block' : 'none';
                                        }
                                      }}>
                                        <span className="expand-icon">▶</span>
                                        <span className="time-slot-name">{timeSlot}</span>
                                        <span className="time-slot-count">
                                          {slotData.userCount} {slotData.userCount === 1 ? 'user' : 'users'}
                                        </span>
                                      </div>
                                      
                                      <div 
                                        id={`slot-content-${day}-${meal}-${timeSlot.replace(/:/g, '-').replace(/\s/g, '-')}`} 
                                        className="time-slot-content"
                                      >
                                        <table className="users-matching-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                                              <th>Class</th>
                                              <th width="100">Group</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* Sort users by matching group to keep grouped users together */}
                                            {[...slotData.users]
                                              .sort((a, b) => {
                                                const groupA = getUserMatchingGroup(a.id);
                                                const groupB = getUserMatchingGroup(b.id);
                                                
                                                // First sort by group (0 last)
                                                if (groupA === 0 && groupB !== 0) return 1;
                                                if (groupA !== 0 && groupB === 0) return -1;
                                                if (groupA !== groupB) return groupA - groupB;
                                                
                                                // Then by name
                                                return a.name.localeCompare(b.name);
                                              })
                                              .map((user, index) => {
                                                const matchingGroup = getUserMatchingGroup(user.id);
                                                const groupColor = getMatchingGroupColor(matchingGroup);
                                                
                                                return (
                                                  <tr 
                                                    key={`${user.id}-${index}`} 
                                                    style={{ backgroundColor: groupColor }}
                                                    className={matchingGroup > 0 ? 'matched-user' : ''}
                                                  >
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.class_level}</td>
                                                    <td className="matching-group-cell">
                                                      <input 
                                                        type="number" 
                                                        min="0" 
                                                        max="99"
                                                        className="matching-group-input"
                                                        value={matchingGroup || ""}
                                                        onChange={(e) => updateUserMatchingGroup(user.id, e.target.value)}
                                                        placeholder="Group #"
                                                      />
                                                    </td>
                                                  </tr>
                                                );
                                              })
                                            }
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="matching-summary">
                      <h4>Matching Groups Summary</h4>
                      <div className="matching-groups-legend">
                        {Array.from({ length: maxMatchingGroup }, (_, i) => i + 1).map(groupNum => (
                          <div key={groupNum} className="matching-group-item">
                            <div 
                              className="color-swatch" 
                              style={{ backgroundColor: getMatchingGroupColor(groupNum) }}
                            ></div>
                            <span>Group {groupNum}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : !loading && viewMode === 'feedback' ? (
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
                <th className="sortable" onClick={() => requestSort('phone')}>
                  Phone {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sortable" onClick={() => requestSort('class_level')}>
                  Class {sortConfig.key === 'class_level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sortable" onClick={() => requestSort('housing_status')}>
                  Housing {sortConfig.key === 'housing_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                    <td>{profile.phone || 'Not specified'}</td>
                    <td>
                      <span 
                        className="filterable-value"
                        onClick={() => setFilter('class_level', profile.class_level)}
                      >
                        {profile.class_level || 'Not specified'}
                      </span>
                  </td>
                    <td>
                      <span 
                        className="filterable-value"
                        onClick={() => setFilter('housing_status', profile.housing_status)}
                      >
                        {profile.housing_status || 'Not specified'}
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
                      <td colSpan={10}>
                        <div className="expanded-content">
                          <div className="detail-section">
                            <h3>Personal</h3>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Phone:</label>
                                <span>{profile.phone || 'Not specified'}</span>
                              </div>
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
                            <h3>Housing Information</h3>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Housing Status:</label>
                                <span>{profile.housing_status || 'Not specified'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Housing Time Period:</label>
                                <span>{profile.housing_time_period || 'Not specified'}</span>
                              </div>
                              {(profile.housing_status === 'looking to pull a roommate' || profile.housing_status === 'need to be pulled into a group') && (
                                <div className="detail-item">
                                  <label>Roommate Gender Preference:</label>
                                  <span>{profile.roommate_gender_preference || 'No preference'}</span>
                                </div>
                              )}
                              <div className="detail-item">
                                <label>Cleanliness Level:</label>
                                <span>{profile.cleanliness_level || 'Not specified'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Housing Number:</label>
                                <span>{profile.housing_number || 'Not specified'}</span>
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
                              <div className="detail-item">
                                <label>Time Preferences:</label>
                                <span>{profile.time_preferences || 'Not specified'}</span>
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
      
      {/* Render the Home component in a hidden div to access its methods */}
      {showSignUpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <Home forceSignupEnabled={true} onClose={closeSignUpModal} />
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

  // Get current year
  const currentYear = new Date().getFullYear();

  // Add date information for each day
  const dayLabels = {
    thursday: `Thursday (Apr 4, ${currentYear})`,
    friday: `Friday (Apr 5, ${currentYear})`,
    saturday: `Saturday (Apr 6, ${currentYear})`
  };

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
          <div className="day-label">{dayLabels[day] || day.charAt(0).toUpperCase() + day.slice(1)}:</div>
          <div className="meals-container">{validMeals}</div>
        </div>
      );
    }
    return null;
  }).filter(Boolean);
};

export default Admin;
