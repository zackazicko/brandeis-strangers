// eslint-disable-next-line
import React, { useState, useEffect, useRef } from 'react';
import supabase, { localAdmin } from './supabaseClient';

// Move these style creator functions to the top, outside component
const createBtnStyle = (isMobile = false) => ({
  padding: isMobile ? '0.6rem 1.5rem' : '0.7rem 2rem',
  backgroundColor: '#003865',
  border: 'none',
  color: '#fff',
  borderRadius: 30,
  cursor: 'pointer',
  fontSize: isMobile ? '0.9rem' : '1rem',
  transition: 'background-color 0.3s ease',
  fontFamily: '"Courier New", Courier, monospace',
  textTransform: 'lowercase',
  marginLeft: isMobile ? '0' : '0.5rem',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
});

const createBubbleStyle = (isMobile = false) => ({
  cursor: 'pointer',
  padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
  borderRadius: 20,
  backgroundColor: '#fff',
  border: '2px solid #003865',
  color: '#003865',
  transition: 'all 0.3s ease',
  userSelect: 'none',
  fontSize: isMobile ? '0.8rem' : '0.9rem',
  marginBottom: '0.5rem',
  whiteSpace: 'nowrap'
});

const createButtonsRowStyle = (isMobile = false) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '1.5rem',
  width: '100%',
  gap: '0.8rem'
});

const createBackBtnStyle = (isMobile = false) => ({
  padding: isMobile ? '0.6rem 0' : '0.7rem 2rem',
  backgroundColor: '#ffffff',
  border: '2px solid #003865',
  color: '#003865',
  borderRadius: 30,
  cursor: 'pointer',
  fontSize: isMobile ? '0.9rem' : '1rem',
  transition: 'background-color 0.3s ease',
  fontFamily: '"Courier New", Courier, monospace',
  textTransform: 'lowercase',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  flex: isMobile ? 1 : 'none',
  textAlign: 'center'
});

const createNextBtnStyle = (isMobile = false) => ({
  padding: isMobile ? '0.6rem 0' : '0.7rem 2rem',
  backgroundColor: '#003865',
  border: 'none',
  color: '#fff',
  borderRadius: 30,
  cursor: 'pointer',
  fontSize: isMobile ? '0.9rem' : '1rem',
  transition: 'background-color 0.3s ease',
  fontFamily: '"Courier New", Courier, monospace',
  textTransform: 'lowercase',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  flex: isMobile ? 1 : 'none',
  textAlign: 'center'
});

const createHeaderStyle = (isMobile = false) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: isMobile ? '1rem 1.2rem' : '1.2rem 4rem',
  backgroundColor: 'white',
  zIndex: 100,
  boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
  height: isMobile ? '60px' : '70px',
});

const createLogoStyle = (isMobile = false) => ({
  fontWeight: 'bold',
  fontSize: isMobile ? '1.4rem' : '1.6rem',
  letterSpacing: '-0.5px',
  color: '#003865',
});

// These non-responsive styles don't need to be functions
const navLinkStyle = {
  textDecoration: 'none',
  color: '#003865',
  fontSize: '1rem',
  transition: 'color 0.3s',
};

// eslint-disable-next-line no-unused-vars
const featureCardStyle = {
  background: '#fff',
  borderRadius: '1rem',
  padding: '2rem',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  textAlign: 'center',
  transition: 'transform 0.3s',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#003865',
};

const bubbleSelectedStyle = {
  backgroundColor: '#003865',
  color: '#fff',
};

// Create a better style for the hero section to add spacing below header
const createHeroSectionStyle = (isMobile = false) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  backgroundColor: '#e6f2ff',
  background: 'linear-gradient(180deg, #e6f2ff 0%, #f5f9ff 100%)', 
  paddingTop: isMobile ? '70px' : '80px',
  paddingBottom: '4rem',
  marginTop: isMobile ? '0' : '0',
  position: 'relative',
  overflow: 'hidden'
});

// Add cloud decorative elements
const cloudOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none', // So clicks pass through
  opacity: 0.8,
  zIndex: 0,
  backgroundImage: 'url("https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  mixBlendMode: 'overlay' // Creates a nice blended effect with the text
};

// Make content appear above the clouds
const heroContentStyle = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: '800px',
  padding: '0 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
};

// Create better title styles for hero section
const createHeroTitleStyle = (isMobile = false) => ({
  fontSize: isMobile ? '3rem' : '5rem',
  marginTop: isMobile ? '2.5rem' : '2rem',
  color: '#003865',
  marginBottom: '0.5rem',
  width: '100%',
  textAlign: 'center'
});

// Create subtitle style for hero section
const createHeroSubtitleStyle = (isMobile = false) => ({
  fontWeight: 'normal',
  fontSize: isMobile ? '1.4rem' : '2.5rem',
  marginBottom: '1.5rem',
  color: '#003865',
  width: '100%',
  textAlign: 'center'
});

// Create paragraph style for hero section
const createHeroTextStyle = (isMobile = false) => ({
  maxWidth: isMobile ? '300px' : '600px',
  marginBottom: '2rem',
  lineHeight: 1.6,
  fontSize: isMobile ? '0.95rem' : '1.1rem',
  padding: isMobile ? '0' : '0',
  textAlign: 'center',
  width: '100%'
});

// Add new styles for the "How It Works" section
const howItWorksContainerStyle = {
  maxWidth: '600px',
  marginTop: '6rem',
  padding: '0 1rem',
  position: 'relative',
  zIndex: 1
};

const howItWorksTitleStyle = {
  fontSize: '1.8rem',
  color: '#003865',
  textAlign: 'center',
  marginBottom: '1.5rem',
  fontWeight: 'bold'
};

const problemStatementStyle = {
  textAlign: 'center',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  marginBottom: '2.5rem',
  color: '#444'
};

const stepsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const stepStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  background: 'white',
  padding: '1rem',
  borderRadius: '0.8rem',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
};

const stepNumberStyle = {
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  backgroundColor: '#003865',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'bold',
  flexShrink: 0
};

const stepContentStyle = {
  flex: 1
};

const stepTitleStyle = {
  fontWeight: 'bold',
  marginBottom: '0.25rem',
  color: '#003865'
};

const stepDescriptionStyle = {
  fontSize: '0.9rem',
  lineHeight: 1.5,
  color: '#555'
};

// Add this style definition for category headers
const categoryHeaderStyle = {
  display: 'block',
  marginTop: '1.8rem', // More space above each category
  marginBottom: '0.8rem', // Consistent spacing below headers
  fontWeight: 'bold',
  color: '#003865',
  fontSize: '0.95rem', // Matches the labelStyle fontSize
  textTransform: 'lowercase' // Consistent with the app's style
};

// First, let's create a style for the submit button that handles the loading state
const createSubmitBtnStyle = (isMobile = false, isLoading = false) => ({
  ...createNextBtnStyle(isMobile),
  opacity: isLoading ? 0.7 : 1,
  cursor: isLoading ? 'wait' : 'pointer'
});

export default function Home() {
  // ---------------------------
  // TYPED TEXT EFFECT (HERO)
  // ---------------------------
  const [typedText, setTypedText] = useState('');
  const fullText = 'strangers.';
  
  useEffect(() => {
    // Reset the text first
    setTypedText('');
    
    // Type each character one at a time with no initial delay
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 150); // Slightly faster typing speed
    
    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // RESPONSIVE STATE - KEEP ONLY ONE DECLARATION!
  // ---------------------------
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // eslint-disable-next-line no-unused-vars
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 375);
  
  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 375);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // ---------------------------
  // CREATE RESPONSIVE STYLES - Do this right after isMobile declaration
  // ---------------------------
  // Create responsive styles based on isMobile state
  const btnStyle = createBtnStyle(isMobile);
  const bubbleStyle = createBubbleStyle(isMobile);
  const buttonsRowStyle = createButtonsRowStyle(isMobile);
  const headerStyle = createHeaderStyle(isMobile);
  const logoStyle = createLogoStyle(isMobile);
  const heroSectionStyle = createHeroSectionStyle(isMobile);
  const heroTitleStyle = createHeroTitleStyle(isMobile);
  const heroSubtitleStyle = createHeroSubtitleStyle(isMobile);
  const heroTextStyle = createHeroTextStyle(isMobile);
  
  // Add these two lines to fix the undefined variables
  const backBtnStyle = createBackBtnStyle(isMobile);
  const nextBtnStyle = createNextBtnStyle(isMobile);

  // Add touch-friendly animations
  useEffect(() => {
    // Inject these styles for smooth mobile animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @media (max-width: 768px) {
        /* Overscroll behavior to prevent page bouncing on iOS */
        body {
          overscroll-behavior-y: none;
        }
        
        /* Make form elements larger on mobile */
        input, select, button {
          font-size: 16px !important; /* Prevents iOS zoom on focus */
        }
        
        /* Add momentum scrolling for modal on mobile */
        .modal-content {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Improve button press effect */
        button:active {
          transform: scale(0.98);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add this effect to improve mobile touch feedback
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        /* Improve touch feedback */
        button:active {
          transform: scale(0.98);
          transition: transform 0.1s;
        }
        
        /* Fix spacing for mobile view */
        #root {
          padding-top: 60px; /* Match header height */
        }
        
        /* Improve spacing of modal on mobile */
        .modal-content {
          padding-top: 20px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ---------------------------
  // MODAL STATE
  // ---------------------------
  const [modalOpen, setModalOpen] = useState(false);
  
  function openModal() {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  }

  // Fix invalid href in navigation links
  const handleNavClick = (e) => {
    e.preventDefault();
    // Handle navigation or scroll logic
  };

  // ---------------------------
  // MULTI-STEP FORM STATES
  // ---------------------------
  const [currentStep, setCurrentStep] = useState(1);

  // Basic info - name is now properly declared as a state variable
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Update name when first or last name changes
  useEffect(() => {
    setName(`${firstName} ${lastName}`.trim());
  }, [firstName, lastName]);

  // Step 2: major, class level, interests
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [classLevel, setClassLevel] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Step 3: meal plan, guest swipe, locations, meal times
  const [mealPlan, setMealPlan] = useState(false);
  const [guestSwipe, setGuestSwipe] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null); // track which day bubble is open
  const [mealTimes, setMealTimes] = useState({
    tuesday: { dinner: [] },
    wednesday: { dinner: [] }
  });

  // Final: show success message
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Add state variables for personality questions
  const [personalityStep, setPersonalityStep] = useState(false);
  const [personalityType, setPersonalityType] = useState('');
  const [humorType, setHumorType] = useState('');
  const [conversationType, setConversationType] = useState('');
  const [plannerType, setPlannerType] = useState('');
  const [hpHouse, setHpHouse] = useState('');
  const [matchPreference, setMatchPreference] = useState('');

  // Add state for major search
  const [majorSearch, setMajorSearch] = useState('');
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);

  // Updated majors list
  const majors = [
    'African and African American Studies',
    'American Studies',
    'Anthropology',
    'Applied Mathematics',
    'Art History',
    'Biochemistry',
    'Biological Physics',
    'Biology',
    'Business',
    'Chemistry',
    'Classical and Early Mediterranean Studies',
    'Comparative Literature and Culture',
    'Computer Science',
    'Creative Writing',
    'East Asian Studies',
    'Economics',
    'Education',
    'Engineering Science',
    'Environmental Studies',
    'European Cultural Studies',
    'Film, Television and Interactive Media',
    'French and Francophone Studies',
    'German Studies',
    'Health: Science, Society, and Policy',
    'Hispanic Studies',
    'History',
    'Independent Interdisciplinary Major',
    'International and Global Studies',
    'Latin American, Caribbean and Latinx Studies',
    'Linguistics',
    'Mathematics',
    'Music',
    'Near Eastern and Judaic Studies',
    'Neuroscience',
    'Philosophy',
    'Physics',
    'Politics',
    'Psychology',
    'Russian Studies',
    'Sociology',
    'Studio Art',
    'Theater Arts',
    'Women\'s, Gender and Sexuality Studies'
  ];

  // Filter majors based on search input
  const filteredMajors = majors.filter(major => 
    major.toLowerCase().includes(majorSearch.toLowerCase())
  );

  // Add this useEffect to handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showMajorDropdown && !event.target.closest('.major-search-container')) {
        setShowMajorDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMajorDropdown]);

  // ---------------------------
  // HELPER: Toggle bubble selection
  // ---------------------------
  function toggleSelection(currentSelections, setSelections, item) {
    if (currentSelections.includes(item)) {
      setSelections(currentSelections.filter((i) => i !== item));
    } else {
      // No limit check - allow unlimited selections
      setSelections([...currentSelections, item]);
    }
  }

  // ---------------------------
  // STEP NAVIGATION
  // ---------------------------
  function isValidBrandeisEmail(email) {
    // First normalize the email by trimming
    const emailInput = email.trim();
    
    // Hardcoded check for multiple capitalization variants
    return emailInput.endsWith('@brandeis.edu') || 
           emailInput.endsWith('@Brandeis.edu') || 
           emailInput.endsWith('@BRANDEIS.edu') || 
           emailInput.endsWith('@BRANDEIS.EDU') || 
           emailInput.endsWith('@Brandeis.EDU') || 
           emailInput.toLowerCase().endsWith('@brandeis.edu'); // Catch-all
  }

  function goToStep2() {
    if (!isValidBrandeisEmail(email)) {
      alert('please use your brandeis.edu email address.');
      return;
    }
    
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please provide both first and last name.');
      return;
    }
    setCurrentStep(2);
  }
  
  function goBackToStep1() {
    setCurrentStep(1);
  }
  
  function goToStep3() {
    setCurrentStep(3);
  }
  
  function goBackToStep2() {
    setCurrentStep(2);
  }
  
  function goToPersonalityStep() {
    if (!classLevel || selectedMajors.length === 0) {
      alert('Please select your class level and at least one major.');
      return;
    }
    setCurrentStep(4);
    setPersonalityStep(true);
  }
  
  function goToMealPreferencesStep() {
    setCurrentStep(5);
    setPersonalityStep(false);
  }

  function goBackToStep3() {
    setCurrentStep(3);
  }

  function goBackToPersonalityStep() {
    setCurrentStep(4);
    setPersonalityStep(true);
  }

  // ---------------------------
  // SUBMIT FORM: Sign up + Insert
  // ---------------------------
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit() {
    setLoading(true);
    let userData = {}; // Initialize outside try block so it's accessible in catch
    
    try {
      const emailInput = email.trim();
      const emailLower = emailInput.toLowerCase();
      
      if (!isValidBrandeisEmail(email)) {
        alert('please use your brandeis.edu email address.');
      setLoading(false);
      return;
    }
      
      // Basic validation
      if (!name || !emailInput || !mealTimes.wednesday?.dinner?.length) {
        alert('Please fill in all required fields and select at least one time slot.');
      setLoading(false);
      return;
    }
      
      // Force Sherman as the only location for the pilot
      userData = {
        name: name,
        email: emailLower, // Always store lowercase email for consistency
        majors: selectedMajors,
        class_level: classLevel,
        interests: selectedInterests,
        meal_plan: mealPlan,
        guest_swipe: guestSwipe,
        dining_locations: ['sherman'], // Force Sherman as the only location
        meal_times_json: JSON.stringify(mealTimes),
        meal_times_flattened: JSON.stringify({
          wednesday_dinner_600_630: mealTimes.wednesday?.dinner?.includes('6:00-6:30 pm') || false,
          wednesday_dinner_630_700: mealTimes.wednesday?.dinner?.includes('6:30-7:00 pm') || false
        }),
        personality_type: personalityType,
        humor_type: humorType,
        conversation_type: conversationType,
        planner_type: plannerType,
        hp_house: hpHouse,
        match_preference: matchPreference
      };
      
      console.log('Submitting data to main table:', userData);
      
      const { data, error } = await supabase
        .from('main')
        .insert([userData]);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Store in local admin storage regardless of Supabase success
      localAdmin.storeProfile(userData);
      
      // Show success message
      setSignUpSuccess(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Now userData is accessible here
      try {
        // Store in failed submissions for retry
        const failedSubmissions = JSON.parse(localStorage.getItem('brandeis_strangers_submissions') || '[]');
        failedSubmissions.push(userData);
        localStorage.setItem('brandeis_strangers_submissions', JSON.stringify(failedSubmissions));
        console.log('Stored failed submission for later retry');
        
        // Also store in admin local storage so it's visible there
        localAdmin.storeProfile(userData);
      } catch (storageError) {
        console.error('Failed to store submission for retry:', storageError);
      }
      
      alert(`Error: ${error.message}. We've saved your submission and will try again when you return to the site.`);
    } finally {
    setLoading(false);
    }
  }

  // Fix the color for selected time slots - should be white text on dark background
  const timeSlotSelectedStyle = {
    backgroundColor: '#003865',
    color: 'white'
  };

  // Style updates for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on window resize to update mobile-specific components
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 375);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Modal container style
  const modalContainerStyle = {
    backgroundColor: '#fff',
    borderRadius: '1rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    width: isMobile ? '95%' : '500px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: isMobile ? '1.2rem' : '2rem',
    position: 'relative',
    textTransform: 'lowercase',
    animation: 'fadeIn 0.8s forwards',
  };

  // Update input style for mobile
  const inputStyle = {
    width: '100%',
    padding: isMobile ? '0.6rem' : '0.7rem',
    fontSize: isMobile ? '0.9rem' : '1rem',
    border: '1px solid #cccccc',
    borderRadius: 4,
    fontFamily: '"Courier New", Courier, monospace',
  };

  // Make bubble container wrap better on mobile
  const bubbleContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: isMobile ? 'center' : 'flex-start',
  };

  // Add this effect for CSS-based cloud background
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .cloud-bg {
        background-color: #e6f2ff;
        background-image: 
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 25%),
          radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 35%),
          radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 30%),
          radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 25%);
        animation: moveClouds 60s infinite alternate ease-in-out;
      }
      
      @keyframes moveClouds {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Inside your component, add:
  const submitBtnStyle = createSubmitBtnStyle(isMobile, loading);

  // Add a ref for the modal content
  const modalContentRef = useRef(null);
  
  // Add an effect that scrolls to top when step changes
  useEffect(() => {
    if (modalContentRef.current) {
      // Smooth scroll animation
      modalContentRef.current.scrollTo({
          top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentStep, personalityStep]); // Trigger on step changes

  // Add signup toggle state - set to false to disable signups
  const [isSignupEnabled, setIsSignupEnabled] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add function to handle feedback submission
  async function submitFeedback() {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    const feedbackData = { 
      text: feedbackText,
      created_at: new Date().toISOString()
    };
    
    try {
      // Submit feedback to the database
      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData]);
        
      if (error) throw error;
      
      // Also store locally for admin viewing
      localAdmin.storeFeedback(feedbackData);
      
      setFeedbackSubmitted(true);
      setFeedbackText('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Still store locally even if Supabase fails
      localAdmin.storeFeedback(feedbackData);
      
      alert('Failed to submit feedback to server, but it has been stored locally.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div style={{ 
      fontFamily: '"Courier New", Courier, monospace',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      {/* Sticky Header */}
      <header style={headerStyle}>
        <div style={logoStyle}>strangers.</div>
        
        {/* Only show full navigation on desktop */}
        {!isMobile ? (
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="#signup" onClick={openModal} style={navLinkStyle}>sign up</a>
          </nav>
        ) : (
          <button 
            onClick={openModal}
        style={{
              ...btnStyle,
              padding: '0.5rem 1.2rem',
              fontSize: '0.85rem',
              marginLeft: 0
            }}
          >
            sign up
          </button>
        )}
      </header>

      {/* Hero section with integrated "How It Works" */}
      <section id="signup" style={heroSectionStyle} className="cloud-bg">
        {/* Cloud background overlay */}
        <div style={cloudOverlayStyle}></div>
        
        {/* Content layer above clouds */}
        <div style={heroContentStyle}>
          {/* Hero content */}
          <h1 style={heroTitleStyle}>
          {typedText}
        </h1>
          <h2 style={heroSubtitleStyle}>
          brandeis meal match
        </h2>
          <p style={heroTextStyle}>
            {isSignupEnabled 
              ? "answer a few questions, and we'll match you with someone new." 
              : "our sign-ups are temporarily closed while we prepare for our next round."}
          </p>
          <p style={{
            fontSize: isMobile ? '0.9rem' : '1rem',
            color: '#003865',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            maxWidth: '100%',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🚀 pilot launch 2: next week, starting march 17th!
        </p>
        {isSignupEnabled ? (
        <button
          onClick={openModal}
          style={{
                ...btnStyle,
                padding: '0.8rem 2.5rem',
                fontSize: isMobile ? '1rem' : '1.1rem',
                marginLeft: 0,
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 4px 15px rgba(0,56,101,0.2)'
          }}
        >
          sign up
        </button>
        ) : (
          <div>
            <div style={{...btnStyle, cursor: 'default'}}>
              back soon!
            </div>
            <div style={{
              marginTop: '20px',
              maxWidth: '500px',
              textAlign: 'center'
            }}>
              {!feedbackSubmitted ? (
                <>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => {
                      // Limit to 200 characters
                      if (e.target.value.length <= 200) {
                        setFeedbackText(e.target.value);
                      }
                    }}
                    placeholder="Have feedback? Let us know! (200 character limit)"
          style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontFamily: 'inherit',
                      marginBottom: '10px',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      {feedbackText.length}/200
                    </div>
                    <button
                      onClick={submitFeedback}
                      disabled={isSubmitting || !feedbackText.trim()}
            style={{
                        padding: '8px 16px',
                        backgroundColor: '#003865',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: feedbackText.trim() ? 'pointer' : 'not-allowed',
                        opacity: feedbackText.trim() ? 1 : 0.6,
                        fontFamily: 'inherit'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
        </div>
                </>
              ) : (
                <div style={{
                  backgroundColor: '#e6f7eb',
                  padding: '15px',
                  borderRadius: '8px',
                  color: '#2e7d32',
                  textAlign: 'center'
                }}>
                  Thanks for your feedback! We'll see you when sign-ups reopen.
                </div>
              )}
            </div>
          </div>
        )}
          
          {/* How It Works section integrated into hero */}
          <div style={howItWorksContainerStyle}>
            <h2 style={howItWorksTitleStyle}>how it works</h2>
            
            <p style={problemStatementStyle}>
              being on campus can be lonely. schedules rarely align, and it's tough finding new friends beyond your classes or clubs.
            </p>
            
            <div style={stepsContainerStyle}>
              <div style={stepStyle}>
                <div style={stepNumberStyle}>1</div>
                <div style={stepContentStyle}>
                  <div style={stepTitleStyle}>quick sign up</div>
                  <div style={stepDescriptionStyle}>
                    sign up with your brandeis email, tell us your availability and meal preferences
          </div>
          </div>
              </div>
              
              <div style={stepStyle}>
                <div style={stepNumberStyle}>2</div>
                <div style={stepContentStyle}>
                  <div style={stepTitleStyle}>get matched</div>
                  <div style={stepDescriptionStyle}>
                    we match you with someone new based on your compatible meal times and preferences
          </div>
          </div>
              </div>
              
              <div style={stepStyle}>
                <div style={stepNumberStyle}>3</div>
                <div style={stepContentStyle}>
                  <div style={stepTitleStyle}>meet for a meal</div>
                  <div style={stepDescriptionStyle}>
                    show the matching color on your phone to find each other and enjoy your meal together
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div onClick={closeModal} style={{
            position: 'fixed',
            top: 0,
            left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div 
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()} 
            style={{
              backgroundColor: '#fff',
              borderRadius: '1rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              width: isMobile ? '90%' : '500px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
              textTransform: 'lowercase',
              animation: 'fadeIn 0.5s'
            }}
            className="modal-content"
          >
            <button
              className="close-button"
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: '#003865',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '2rem',
                fontSize: '1.5rem',
              }}
            >
              sign up
            </div>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div style={{ animation: 'fadeIn 0.8s forwards' }}>
                <h3 style={{ 
                  marginBottom: '1.2rem', 
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  basic info
                </h3>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>first name:</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>last name:</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>brandeis email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      fontSize: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                    required
                  />
                </div>
                <div style={buttonsRowStyle}>
                  <div style={{ flex: isMobile ? 1 : 'none', visibility: 'hidden' }}></div>
                  <button onClick={goToStep2} style={nextBtnStyle}>
                    next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div style={{ animation: 'fadeIn 0.8s forwards' }}>
                <h3 style={{ 
                  marginBottom: '1.2rem', 
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  academic info
                </h3>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>choose your major(s):</label>
                  <div className="major-search-container" style={{ position: 'relative' }}>
                  <input
                      type="text"
                      style={{
                        ...inputStyle,
                        marginBottom: '0.5rem'
                      }}
                      value={majorSearch}
                      onChange={(e) => {
                        setMajorSearch(e.target.value);
                        setShowMajorDropdown(true);
                      }}
                      onFocus={() => setShowMajorDropdown(true)}
                      placeholder="Search for majors..."
                    />
                    
                    {showMajorDropdown && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          zIndex: 10,
                          background: 'white'
                        }}
                      >
                        {filteredMajors.length === 0 ? (
                          <div style={{ padding: '0.5rem', color: '#999', textAlign: 'center' }}>
                            No matching majors found
                </div>
                        ) : (
                          filteredMajors.map(major => (
                <div
                              key={major}
                  style={{
                                padding: '0.5rem',
                                cursor: 'pointer',
                                background: selectedMajors.includes(major) ? '#e6f7ff' : 'white',
                                borderBottom: '1px solid #eee'
                              }}
                              onClick={() => {
                                toggleSelection(selectedMajors, setSelectedMajors, major);
                                setMajorSearch('');
                                setShowMajorDropdown(false);
                              }}
                            >
                              {major}
                </div>
                          ))
                        )}
              </div>
            )}
                  </div>
                  
                  {/* Display selected majors as bubbles */}
                  <div style={bubbleContainerStyle}>
                    {selectedMajors.map((major) => (
                      <div
                        key={major}
                        style={{
                          ...bubbleStyle,
                          ...bubbleSelectedStyle,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {major}
                        <span 
                          style={{ marginLeft: '5px', cursor: 'pointer' }}
                          onClick={() => setSelectedMajors(selectedMajors.filter(m => m !== major))}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>class level:</label>
                  <div style={bubbleContainerStyle}>
                    {[
                      'freshman',
                      'sophomore',
                      'junior',
                      'senior',
                      'graduate',
                    ].map((level) => (
                      <div
                        key={level}
                        style={{
                          ...bubbleStyle,
                          ...(classLevel === level ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setClassLevel(level)}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={buttonsRowStyle}>
                  <button onClick={goBackToStep1} style={backBtnStyle}>
                    back
                  </button>
                  <button onClick={goToStep3} style={nextBtnStyle}>
                    next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div style={{ animation: 'fadeIn 0.8s forwards' }}>
                <h3 style={{ 
                  marginBottom: '1.2rem', 
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  interests
                </h3>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>select your interests - as many as you want! </label>
                  
                  {/* Entertainment & Media */}
                  <p style={categoryHeaderStyle}>
                    Entertainment & Media
                  </p>
                  <div style={bubbleContainerStyle}>
                    {[
                      'anime & manga',
                      'k-pop & k-dramas',
                      'taylor swift',
                      'marvel & dc',
                      'reality tv',
                      'tiktok'
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest) ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => toggleSelection(selectedInterests, setSelectedInterests, interest)}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                  
                  {/* Activities */}
                  <p style={categoryHeaderStyle}>
                    Activities
                  </p>
                  <div style={bubbleContainerStyle}>
                    {[
                      'thrifting',
                      'foodie adventures',
                      'gym & fitness',
                      'coffee shop hopping',
                      'boston exploring'
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest) ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => toggleSelection(selectedInterests, setSelectedInterests, interest)}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                  
                  {/* Arts & Culture */}
                  <p style={categoryHeaderStyle}>
                    Arts & Culture
                  </p>
                  <div style={bubbleContainerStyle}>
                    {[
                      'photography',
                      'music production',
                      'fashion',
                      'creative writing',
                      'theater & improv'
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest) ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => toggleSelection(selectedInterests, setSelectedInterests, interest)}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                  
                  {/* Academic & Intellectual */}
                  <p style={categoryHeaderStyle}>
                    Academic & Intellectual
                  </p>
                  <div style={bubbleContainerStyle}>
                    {[
                      'social justice',
                      'entrepreneurship',
                      'climate activism',
                      'research',
                      'debate & politics'
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest) ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => toggleSelection(selectedInterests, setSelectedInterests, interest)}
                      >
                        {interest}
                </div>
                    ))}
                  </div>
                  
                  {/* Social & Campus Life */}
                  <p style={categoryHeaderStyle}>
                    Social & Campus Life
                  </p>
                  <div style={bubbleContainerStyle}>
                    {[
                      'cultural clubs',
                      'greek life',
                      'club sports',
                      'student government',
                      'volunteering'
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest) ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => toggleSelection(selectedInterests, setSelectedInterests, interest)}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                  
                  {/* Tech & Gaming */}
                  <p style={categoryHeaderStyle}>
                    Tech & Gaming
                  </p>
                  <div style={bubbleContainerStyle}>
                    {[
                      'video games',
                      'coding & tech',
                      'crypto & nfts',
                      'ai & chatgpt'
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest) ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => toggleSelection(selectedInterests, setSelectedInterests, interest)}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                  
                  {/* Lifestyle */}
                  <p style={categoryHeaderStyle}>
                    Lifestyle
                  </p>
                  <div style={bubbleContainerStyle}>
                    {[
                      'plant parent',
                      'cooking & baking',
                      'mental health',
                      'spirituality',
                      'sustainability'
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest) ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => toggleSelection(selectedInterests, setSelectedInterests, interest)}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={buttonsRowStyle}>
                  <button onClick={goBackToStep2} style={backBtnStyle}>
                    back
                  </button>
                  <button onClick={goToPersonalityStep} style={nextBtnStyle}>
                    next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && personalityStep && (
              <div style={{ animation: 'fadeIn 0.8s forwards' }}>
                <h3 style={{ 
                  marginBottom: '1.2rem', 
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  personality questions
                </h3>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>are you an introvert or an extrovert?</label>
                  <div style={bubbleContainerStyle}>
                    {['introvert', 'extrovert'].map((type) => (
                      <div
                        key={type}
                        style={{
                          ...bubbleStyle,
                          ...(personalityType === type ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setPersonalityType(type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>dark humor or wholesome laughs?</label>
                  <div style={bubbleContainerStyle}>
                    {['dark humor', 'wholesome laughs'].map((type) => (
                      <div
                        key={type}
                        style={{
                          ...bubbleStyle,
                          ...(humorType === type ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setHumorType(type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>small talk or tackling big problems?</label>
                  <div style={bubbleContainerStyle}>
                    {['small talk', 'tackling big problems'].map((type) => (
                      <div
                        key={type}
                        style={{
                          ...bubbleStyle,
                          ...(conversationType === type ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setConversationType(type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>planner or procrastinator?</label>
                  <div style={bubbleContainerStyle}>
                    {['planner', 'procrastinator'].map((type) => (
                      <div
                        key={type}
                        style={{
                          ...bubbleStyle,
                          ...(plannerType === type ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setPlannerType(type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>which harry potter house are you in?</label>
                  <div style={bubbleContainerStyle}>
                    {['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin', "haven't watched"].map((house) => (
                      <div
                        key={house}
                        style={{
                          ...bubbleStyle,
                          ...(hpHouse === house ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setHpHouse(house)}
                      >
                        {house}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>want to meet someone similar or different?</label>
                  <div style={bubbleContainerStyle}>
                    {['similar', 'different'].map((pref) => (
                      <div
                        key={pref}
                        style={{
                          ...bubbleStyle,
                          ...(matchPreference === pref ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setMatchPreference(pref)}
                      >
                        {pref}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={buttonsRowStyle}>
                  <button onClick={goBackToStep3} style={backBtnStyle}>
                    back
                  </button>
                  <button onClick={goToMealPreferencesStep} style={nextBtnStyle}>
                    next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && !personalityStep && !signUpSuccess && (
              <div style={{ animation: 'fadeIn 0.8s forwards' }}>
                <h3 style={{ 
                  marginBottom: '1.2rem', 
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  meal preferences
                </h3>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>do you have a meal plan?</label>
                  <div style={bubbleContainerStyle}>
                    <div
                      style={{
                        ...bubbleStyle,
                        ...(mealPlan ? bubbleSelectedStyle : {}),
                      }}
                      onClick={() => setMealPlan(true)}
                    >
                      yes
                    </div>
                    <div
                      style={{
                        ...bubbleStyle,
                        ...(!mealPlan ? bubbleSelectedStyle : {}),
                      }}
                      onClick={() => setMealPlan(false)}
                    >
                      no
                    </div>
                  </div>
                </div>
                
                {mealPlan && (
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={labelStyle}>
                      would you give your match a guest swipe?
                    </label>
                    <div style={bubbleContainerStyle}>
                      <div
                        style={{
                          ...bubbleStyle,
                          ...(guestSwipe ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setGuestSwipe(true)}
                      >
                        yes
                      </div>
                      <div
                        style={{
                          ...bubbleStyle,
                          ...(!guestSwipe ? bubbleSelectedStyle : {}),
                        }}
                        onClick={() => setGuestSwipe(false)}
                      >
                        no
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>dining location:</label>
                  <div style={bubbleContainerStyle}>
                    <div
                        style={{
                          ...bubbleStyle,
                        ...bubbleSelectedStyle,
                        pointerEvents: 'none'
                      }}
                    >
                      sherman
                      </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
                    for our pilot, we're starting with sherman dining hall only.
                  </p>
                </div>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>select meal times</label>
                  <p style={{ fontSize: '0.85rem', marginTop: '-0.5rem' }}>
                    wednesday, march 12th dinner time slots (6:00-7:00 pm)
                  </p>
                  <div
                    style={{
                      ...bubbleContainerStyle,
                      justifyContent: 'center',
                    }}
                  >
                    <div
                        style={{
                        position: 'relative',
                        margin: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                            alignItems: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>wednesday, march 12th</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['6:00-6:30 pm', '6:30-7:00 pm'].map((timeSlot) => {
                          // Create unique key for each time slot
                          const timeKey = `wednesday-${timeSlot}`;
                          const isSelected = mealTimes.wednesday?.dinner?.includes(timeSlot) || false;
                          
                                return (
                            <div
                              key={timeKey}
                                style={{
                                  ...bubbleStyle,
                                backgroundColor: isSelected ? '#003865' : '#f0f0f0',
                                color: isSelected ? 'white' : '#333',
                                fontSize: '0.85rem',
                                padding: '0.4rem 0.8rem',
                                }}
                                onClick={() => {
                                // Create a deep copy of mealTimes
                                const updatedMealTimes = { ...mealTimes };
                                
                                // Initialize day and meal if needed
                                if (!updatedMealTimes.wednesday) {
                                  updatedMealTimes.wednesday = {};
                                }
                                if (!updatedMealTimes.wednesday.dinner) {
                                  updatedMealTimes.wednesday.dinner = [];
                                }
                                
                                // Toggle time slot (with lowercase time periods)
                                if (updatedMealTimes.wednesday.dinner.includes(timeSlot)) {
                                  updatedMealTimes.wednesday.dinner = updatedMealTimes.wednesday.dinner.filter(
                                    time => time !== timeSlot
                                  );
                                } else {
                                  updatedMealTimes.wednesday.dinner.push(timeSlot);
                                }
                                
                                setMealTimes(updatedMealTimes);
                              }}
                            >
                              {timeSlot}
                              </div>
                          );
                        })}
                        </div>
                    </div>
                </div>
                </div>
                
                <div style={buttonsRowStyle}>
                  <button onClick={goBackToPersonalityStep} style={backBtnStyle}>
                    back
                  </button>
                  <button
                    onClick={handleSubmit}
                    style={submitBtnStyle}
                    disabled={loading}
                  >
                    {loading ? 'submitting...' : 'sign up'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && signUpSuccess && (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.8s forwards' }}>
                <h2 style={{ fontSize: '1.5rem' }}>success!</h2>
                <p style={{ marginTop: '1rem' }}>
                  thank you for signing up. keep an eye on your brandeis email
                  for your random meal match time, location, and the color to
                  show!
                </p>
                <div
                  style={{
                    marginTop: '1rem',
                    width: 100,
                    height: 150,
                    backgroundColor: '#003865',
                    margin: '1rem auto',
                    borderRadius: 10,
                  }}
                ></div>
                <p>
                  (this box simulates the color you will display on your phone.)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Resubmission logic */}
      {useEffect(() => {
        const attemptToResubmitFailedEntries = async () => {
          const failedSubmissions = JSON.parse(localStorage.getItem('brandeis_strangers_submissions') || '[]');
          
          if (failedSubmissions.length > 0) {
            console.log(`Attempting to resubmit ${failedSubmissions.length} failed entries`);
            
            for (let i = 0; i < failedSubmissions.length; i++) {
              const entry = failedSubmissions[i];
              
              try {
                const { error } = await supabase.from('main').insert([entry]);
                
                if (!error) {
                  // Remove this entry from failed submissions
                  failedSubmissions.splice(i, 1);
                  i--; // Adjust index
                  console.log('Successfully resubmitted an entry');
                }
              } catch (err) {
                console.error('Failed to resubmit entry:', err);
              }
            }
            
            // Update local storage with remaining failed submissions
            localStorage.setItem('brandeis_strangers_submissions', JSON.stringify(failedSubmissions));
          }
        };
        
        attemptToResubmitFailedEntries();
      }, [])}
    </div>
  );
}
