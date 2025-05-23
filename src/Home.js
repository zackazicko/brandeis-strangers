// eslint-disable-next-line
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import supabase from './supabaseClient';
import { useNavigate } from 'react-router-dom';

// SITE CONFIGURATION - CHANGE ONLY THIS LINE TO TOGGLE SIGNUP STATUS
const CONFIG = {
  SIGNUP_ENABLED: true  // Set to true to enable signups, false to lock the site
};

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

// Add additional styles for the lock overlay
const lockOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 56, 101, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000,
  padding: '2rem',
  textAlign: 'center',
  color: 'white',
  backdropFilter: 'blur(5px)'
};

// Calendar styles
const calendarContainerStyle = {
  width: '100%',
  marginBottom: '1.5rem',
  fontFamily: '"Courier New", Courier, monospace',
};

const calendarHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.8rem',
};

const calendarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '0.5rem',
};

const calendarDayStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '2.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'normal',
  transition: 'all 0.3s ease',
};

const calendarDayNameStyle = {
  textAlign: 'center',
  fontSize: '0.8rem',
  marginBottom: '0.5rem',
  color: '#666',
  textTransform: 'lowercase',
};

const createDayButtonStyle = (isAvailable, isSelected) => ({
  ...calendarDayStyle,
  backgroundColor: isSelected ? '#003865' : isAvailable ? '#e6f7ff' : '#f0f0f0',
  color: isSelected ? 'white' : isAvailable ? '#003865' : '#999',
  border: isAvailable ? '1px solid #003865' : '1px solid transparent',
  cursor: isAvailable ? 'pointer' : 'default',
});

const timeSelectionContainerStyle = {
  marginTop: '1.5rem',
};

// Export the Home component with forwardRef to allow ref access from parent components
export default forwardRef(function Home(props, ref) {
  // Extract props with defaults
  const { forceSignupEnabled = false, onClose = null } = props;
  
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
  // Use forceSignupEnabled from props if provided, otherwise use CONFIG
  const [isSignupEnabled, setIsSignupEnabled] = useState(forceSignupEnabled || CONFIG.SIGNUP_ENABLED);
  
  // Expose methods via ref for parent components to call
  useImperativeHandle(ref, () => ({
    openModalForTesting: () => {
      // This method is called by the Admin component to open the signup modal
      setModalOpen(true);
      document.body.style.overflow = 'hidden';
    }
  }));
  
  function openModal() {
    if (forceSignupEnabled || isSignupEnabled) {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
    } else {
      // If signups are disabled, don't open the modal
      alert('Signups are currently closed. Please check back later!');
  }
  }
  
  function closeModal() {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
    
    // If onClose prop was provided, call it
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
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
  const [phone, setPhone] = useState(''); // Add phone number state

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
  const [wakuWaku, setWakuWaku] = useState(false); // Set Waku Waku to false by default since we removed the question
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null); // track which day bubble is open
  const [mealTimes, setMealTimes] = useState({
    thursday: { dinner: [] } // Only dinner slots available
  });
  // New state for time preferences text field
  const [timePreferences, setTimePreferences] = useState('');

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
  
  // Add state variables for housing questions
  const [housingStep, setHousingStep] = useState(false);
  const [housingStatus, setHousingStatus] = useState('');
  const [roommateGenderPreference, setRoommateGenderPreference] = useState('');
  const [cleanlinessLevel, setCleanlinessLevel] = useState('');
  const [housingTimePeriod, setHousingTimePeriod] = useState('');
  const [housingNumber, setHousingNumber] = useState('');

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

  // Function to validate US phone number
  function isValidPhoneNumber(phoneNumber) {
    // Simple validation - requires at least 10 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return digitsOnly.length >= 10;
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
    
    if (!isValidPhoneNumber(phone)) {
      alert('Please provide a valid phone number (at least 10 digits).');
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
    // No longer need housing validation since we're skipping that step
    setCurrentStep(5);
    setPersonalityStep(false);
    setHousingStep(false);
  }

  function goBackToStep3() {
    setCurrentStep(3);
  }

  function goBackToPersonalityStep() {
    setCurrentStep(4);
    setPersonalityStep(true);
    setHousingStep(false);
  }
  
  function goToHousingStep() {
    setCurrentStep(4);
    setPersonalityStep(false);
    setHousingStep(true);
  }
  
  function goBackToHousingStep() {
    setCurrentStep(4);
    setPersonalityStep(false);
    setHousingStep(true);
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
      
      // Check if user has selected any dinner times
      const hasSelectedMealTimes = mealTimes.thursday?.dinner?.length > 0;
      
      if (!name || !emailInput || !phone || !hasSelectedMealTimes) {
        alert('Please fill in all required fields and select at least one dinner time slot.');
      setLoading(false);
      return;
    }

      // Deep copy the meal times
      const mealTimesWithDates = JSON.parse(JSON.stringify(mealTimes));
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Update date assignment for May 1st
      if (mealTimesWithDates.thursday) {
        mealTimesWithDates.thursday.date = `May 1, ${currentYear}`;
      }
      
      // Build flattened meal times object for easier querying
      const flattenedMealTimes = {};
      
      // Thursday slots (May 1st)
      flattenedMealTimes.thursday_dinner_600_630 = mealTimes.thursday?.dinner?.includes('6:00-6:30 pm') || false;
      flattenedMealTimes.thursday_dinner_700_730 = mealTimes.thursday?.dinner?.includes('7:00-7:30 pm') || false;
      
      // Force Sherman as the only location for the pilot
      userData = {
        name: name,
        email: emailLower, // Always store lowercase email for consistency
        phone: phone, // Add phone to the userData
        majors: selectedMajors,
        class_level: classLevel,
        interests: selectedInterests,
        meal_plan: mealPlan,
        guest_swipe: guestSwipe,
        waku_waku: false, // Set Waku Waku to false by default since we removed the question
        dining_locations: ['sherman'], // Force Sherman as the only location
        meal_times_json: JSON.stringify(mealTimesWithDates),
        meal_times_flattened: JSON.stringify(flattenedMealTimes),
        personality_type: personalityType,
        humor_type: humorType,
        conversation_type: conversationType,
        planner_type: plannerType,
        hp_house: hpHouse,
        match_preference: matchPreference,
        time_preferences: timePreferences, // Add the new field for time preferences
        housing_status: housingStatus,
        roommate_gender_preference: roommateGenderPreference,
        cleanliness_level: cleanlinessLevel,
        housing_time_period: housingTimePeriod,
        housing_number: housingNumber
      };
      
      console.log('Submitting data to main table:', userData);
      
      // Add detailed logging for network requests
      console.log('Starting Supabase insert request...');
      
      // Try first with a direct fetch - most robust method for user submissions
      try {
        console.log('Attempting direct fetch submission...');
        const response = await fetch('https://qahwzhxwqgzlfymtcnde.supabase.co/rest/v1/main', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaHd6aHh3cWd6bGZ5bXRjbmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzIyNjksImV4cCI6MjA1ODcwODI2OX0.msCVyE6tBzPIPAccyDbNsnAFxCtCLmM4Ab4fYnk3R-E',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaHd6aHh3cWd6bGZ5bXRjbmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzIyNjksImV4cCI6MjA1ODcwODI2OX0.msCVyE6tBzPIPAccyDbNsnAFxCtCLmM4Ab4fYnk3R-E`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(userData) // Send as single object, not array
        });
        
        if (response.ok) {
          console.log('Direct fetch submission successful!');
          // Show success message
          setSignUpSuccess(true);
      setLoading(false);
          return; // Exit early on success
        } else {
          const errorText = await response.text();
          console.error('Direct fetch error:', response.status, errorText);
          
          // Special handling for common errors
          if (response.status === 401 || response.status === 403) {
            console.error('This appears to be a permission issue (RLS policy)');
          }
          
          console.log('Falling back to Supabase client...');
          // Continue to the supabase client approach below
        }
      } catch (directFetchError) {
        console.error('Direct fetch attempt failed:', directFetchError);
        console.log('Falling back to Supabase client...');
        // Continue to the supabase client approach below
      }
      
      // Test Supabase connection before insert (fallback approach)
      console.log('Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('main')
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      if (connectionError) {
        console.error('Connection test error:', connectionError);
        throw new Error(`Connection error: ${connectionError.message}`);
      }
      
      console.log('Connection test successful, proceeding with Supabase insert...');
      
      // Attempt submission via Supabase client
      const { data, error } = await supabase
        .from('main')
        .insert([userData]);
      
      if (error) {
        console.error('Insert error details:', error);
        // Log more details about the type of error
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        
        // For permission errors, try another approach
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('access')) {
          console.log('Permission error detected, checking the error details...');
          
          // Check if it might be an RLS policy issue
          if (error.message.includes('row-level security')) {
            console.error('This appears to be a Row Level Security (RLS) policy issue');
            throw new Error('Database permission error. This is likely due to Row Level Security (RLS) policies. Please contact the administrator.');
          }
          
          throw new Error('Permission error: ' + error.message);
        }
        
        throw new Error(error.message);
      }
      
      console.log('Insert successful!', data);
      
      // Show success message
    setSignUpSuccess(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Check if it's a network error
      if (error.message && (error.message.includes('NetworkError') || error.message.includes('Failed to fetch'))) {
        console.error('Network error detected - check internet connection');
      }
      
      // Store for later retry
      try {
        const failedSubmissions = JSON.parse(localStorage.getItem('brandeis_strangers_submissions') || '[]');
        failedSubmissions.push(userData);
        localStorage.setItem('brandeis_strangers_submissions', JSON.stringify(failedSubmissions));
        console.log('Stored failed submission for later retry');
        
        // Show a more helpful message to users
        alert(`We couldn't submit your sign-up information right now. This could be due to network connectivity or server issues. Don't worry - we've saved your information locally and will try again next time you visit the site.`);
      } catch (storageError) {
        console.error('Failed to store submission for retry:', storageError);
        alert(`Error: ${error.message}. Please try again later or contact support.`);
      }
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

  // Add an effect for success page animation styles
  useEffect(() => {
    if (signUpSuccess) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [signUpSuccess]);

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
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add function to handle feedback submission
  async function submitFeedback() {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Submit feedback to the database
      const { error } = await supabase
        .from('feedback')
        .insert([
          { 
            text: feedbackText,
            created_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      setFeedbackSubmitted(true);
      setFeedbackText('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  
  // Format date helper function
  const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Initialize available dates for Pilot 10 (May 15, Senior Week Special)
  useEffect(() => {
    // Get current system date to determine the appropriate year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); // Will be 2025
    
    // Set available date for May 15 (Thursday)
    setAvailableDates([
      new Date(currentYear, 4, 15), // May 15, current year (Thursday)
    ]);
    
    // Set current month to May of the current year
    setCurrentMonth(new Date(currentYear, 4, 1));
  }, []);
  
  // Date selection handler
  const handleDateSelect = (date) => {
    // Check if the date is available
    const isAvailable = availableDates.some(
      availableDate => formatDateToYYYYMMDD(availableDate) === formatDateToYYYYMMDD(date)
    );
    
    if (isAvailable) {
      setSelectedDate(date);
      
      // Map the selected date to the corresponding day key
      // For current year May, May 1 is Thursday
      const day = date.getDate();
      const month = date.getMonth();
      let dayKey = '';
      
      // Map May date to Thursday
      if (month === 4 && day === 1) { // May is month 4 in JS
        dayKey = 'thursday';
      } else {
        // Fallback to day of week if not May 1
        const dayOfWeek = date.getDay();
        switch (dayOfWeek) {
          case 4: dayKey = 'thursday'; break;
          default: dayKey = ''; break;
        }
      }
      
      setSelectedDay(dayKey);
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options).toLowerCase();
  };
  
  // Check if a date is available
  const isDateAvailable = (date) => {
    // Get the current date, reset time to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the available dates in YYYYMMDD format for easier comparison
    const availableDatesFormatted = availableDates.map(d => formatDateToYYYYMMDD(d));
    
    // Check if the date is in the formatted available dates list
    const dateFormatted = formatDateToYYYYMMDD(date);
    return availableDatesFormatted.includes(dateFormatted);
  };
  
  // Check if a date is selected
  const isDateSelected = (date) => {
    if (!selectedDate || !date) return false;
    return formatDateToYYYYMMDD(selectedDate) === formatDateToYYYYMMDD(date);
  };

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
            {isSignupEnabled && <a href="#signup" onClick={openModal} style={navLinkStyle}>sign up</a>}
          </nav>
        ) : (
          isSignupEnabled && (
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
          )
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
              ? "connecting random brandeis students for meals, because sometimes meeting strangers is exactly what you need." 
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
            👥 pilot 10: senior week special! dinner on thursday 5/15 - grab one last meal before graduation
          </p>
          
          {/* Finals Week Special Banner */}
          <div style={{
            backgroundColor: '#2ecc71',
            color: 'white',
            padding: '1rem',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            marginBottom: '2rem',
            transform: 'rotate(-1deg)',
            maxWidth: '90%',
            animation: 'pulse 2s infinite',
            border: '2px dashed #fff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <style>{`
              @keyframes pulse {
                0% { transform: scale(1) rotate(-1deg); }
                50% { transform: scale(1.03) rotate(-1deg); }
                100% { transform: scale(1) rotate(-1deg); }
              }
              @keyframes shine {
                0% { left: -100px; }
                20% { left: 100%; }
                100% { left: 100%; }
              }
            `}</style>
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100px',
              width: '50px',
              height: '100%',
              background: 'rgba(255,255,255,0.3)',
              transform: 'skewX(-20deg)',
              animation: 'shine 3s infinite 1s'
            }}></div>
            <h3 style={{
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              fontWeight: 'bold',
              margin: 0,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}>✨ SENIOR WEEK SPECIAL ✨</h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              textAlign: 'center',
              margin: '0.5rem 0',
              fontWeight: 'bold'
            }}>
              One last chance to meet someone new at Brandeis!
            </p>
            <p style={{
              fontSize: isMobile ? '0.9rem' : '1rem',
              textAlign: 'center',
              margin: '0.5rem 0'
            }}>
              Share your wisdom, make a new connection, and pass down your knowledge before graduation
            </p>
            <p style={{
              fontSize: '0.9rem',
              textAlign: 'center',
              fontStyle: 'italic',
              marginTop: '0.5rem'
            }}>
              Leave your mark on Brandeis by connecting with underclassmen!
            </p>
          </div>
          
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
            <div style={{...btnStyle, cursor: 'default'}}>
              back soon!
            </div>
          )}
          
          {/* Reviews Carousel Section - Moved up */}
          <section style={{
            width: '100%',
            padding: '4rem 0',
            background: 'none',
            position: 'relative',
            zIndex: 1,
            marginTop: '3rem'
          }}>
            <div style={{
              maxWidth: '1200px',
            margin: '0 auto',
              padding: '0 1rem'
            }}>
              <h2 style={{
                textAlign: 'center',
                fontSize: isMobile ? '1.5rem' : '2rem',
                color: '#003865',
                marginBottom: '2rem',
                fontFamily: '"Courier New", Courier, monospace'
              }}>
                what students are saying
          </h2>
              
              <div className="reviews-carousel" style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '1rem 0'
              }}>
                <div className="reviews-track" style={{
                  display: 'flex',
                  gap: '1.5rem',
                  transition: 'transform 0.5s ease',
                  padding: '0.5rem',
                  animation: 'slideTrack 35s linear infinite',
                  width: 'fit-content'
                }}>
                  {[
                    { text: "met my new best friend here. **loved it!** definitely coming back next week.", stars: "★★★★★" },
                    { text: "such a cool way to meet people. **amazing experience!** the matching system works great.", stars: "★★★★★" },
                    { text: "**fantastic idea!** broke out of my comfort zone and had the best dinner conversation.", stars: "★★★★★" },
                    { text: "**will do it again!** met someone from my major i never would have met otherwise.", stars: "★★★★★" },
                    { text: "**so much fun!** great way to meet new people without the pressure.", stars: "★★★★★" },
                    { text: "**perfect for busy students!** made a friend while having dinner anyway.", stars: "★★★★★" },
                    { text: "**brilliant concept!** finally found people who share my interests.", stars: "★★★★★" },
                    { text: "dinner flew by! **can't wait** to do it again next thursday.", stars: "★★★★★" },
                    { text: "**exactly what brandeis needed!** making friends as a transfer just got easier.", stars: "★★★★★" },
                    { text: "**best decision ever!** stepped out of my bubble and met amazing people.", stars: "★★★★★" }
                  ].map((review, index) => (
                    <div key={index} className="review-card" style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      minWidth: '300px',
                      boxShadow: '0 4px 15px rgba(0, 56, 101, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      fontFamily: '"Courier New", Courier, monospace',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                      backdropFilter: 'blur(5px)'
                    }}>
                      <div style={{
                        color: '#003865',
                        fontSize: '0.9rem',
                        lineHeight: '1.5'
                      }}>
                        {review.text.split('**').map((part, i) => 
                          i % 2 === 0 ? part : <strong key={i} style={{ color: '#003865' }}>{part}</strong>
                        )}
        </div>
                      <div style={{
                        color: '#FFD700',
                        fontSize: '1.2rem',
                        letterSpacing: '2px',
                        textShadow: '0 0 1px rgba(0,0,0,0.1)'
                      }}>
                        {review.stars}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <style>
              {`
                @keyframes slideTrack {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(calc(-300px * 5 - 1.5rem * 5));
                  }
                }
                
                .reviews-track {
                  will-change: transform;
                  mask-image: linear-gradient(
                    to right,
                    transparent,
                    black 10%,
                    black 90%,
                    transparent
                  );
                  -webkit-mask-image: linear-gradient(
                    to right,
                    transparent,
                    black 10%,
                    black 90%,
                    transparent
                  );
                }
                
                .reviews-track:hover {
                  animation-play-state: paused;
                }
                
                .review-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 8px 20px rgba(0, 56, 101, 0.1);
                }
                
                @media (max-width: 768px) {
                  .reviews-track {
                    animation-duration: 25s;
                  }
                  
                  .review-card {
                    min-width: 250px;
                  }
                }
              `}
            </style>
      </section>

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
                {/* Add phone number field */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>phone number: (to find your match)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      fontSize: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                    placeholder="(123) 456-7890"
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
            {currentStep === 5 && !personalityStep && !housingStep && !signUpSuccess && (
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
                    select any time slots you are available
                  </p>
                  
                  {/* Calendar for date selection */}
                  <div style={calendarContainerStyle}>
                    <div style={calendarHeaderStyle}>
                      <button 
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(newMonth.getMonth() - 1);
                          setCurrentMonth(newMonth);
                        }}
                    style={{
                          ...backBtnStyle,
                          padding: '0.3rem 0.8rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        Previous
                      </button>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase()}
                      </h3>
                      <button 
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(newMonth.getMonth() + 1);
                          setCurrentMonth(newMonth);
                        }}
                        style={{
                          ...nextBtnStyle,
                          padding: '0.3rem 0.8rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        Next
                      </button>
                    </div>
                    
                    <div style={calendarGridStyle}>
                      {/* Day names */}
                      {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                        <div key={day} style={calendarDayNameStyle}>
                        {day}
                      </div>
                    ))}
                      
                      {/* Calendar days */}
                      {(() => {
                        // Get the first day of the month and the number of days
                        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                        
                        // Create an array for all days in the grid
                        const days = [];
                        
                        // Add empty cells for days before the first day of the month
                        for (let i = 0; i < firstDay.getDay(); i++) {
                          days.push(<div key={`empty-${i}`} style={calendarDayStyle}></div>);
                        }
                        
                        // Add days of the month
                        for (let day = 1; day <= lastDay.getDate(); day++) {
                          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                          const available = isDateAvailable(date);
                          const selected = isDateSelected(date);
                          
                          days.push(
                            <div 
                              key={`day-${day}`} 
                              style={createDayButtonStyle(available, selected)}
                              onClick={() => available && handleDateSelect(date)}
                            >
                              {day}
                  </div>
                          );
                        }
                        
                        return days;
                      })()}
                    </div>
                  </div>
                  
                  {/* Time slots selection for the selected date */}
                  {selectedDate && (
                    <div style={timeSelectionContainerStyle}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', textAlign: 'center' }}>
                        {formatDate(selectedDate)}
                      </h4>
                      
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
                        {/* Lunch times - hidden for now */}
                        <div style={{ display: 'none' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>lunch</div>
                          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['12:00-12:30 pm', '12:30-1:00 pm'].map((timeSlot) => {
                              const dayKey = selectedDay;
                              const timeKey = `${dayKey}-lunch-${timeSlot}`;
                              const isSelected = mealTimes[dayKey]?.lunch?.includes(timeSlot) || false;
                              
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
                                    if (!dayKey) return;
                                    
                                    const updatedMealTimes = { ...mealTimes };
                                    
                                    if (!updatedMealTimes[dayKey]) {
                                      updatedMealTimes[dayKey] = {};
                                    }
                                    if (!updatedMealTimes[dayKey].lunch) {
                                      updatedMealTimes[dayKey].lunch = [];
                                    }
                                    
                                    if (updatedMealTimes[dayKey].lunch.includes(timeSlot)) {
                                      updatedMealTimes[dayKey].lunch = updatedMealTimes[dayKey].lunch.filter(
                                        time => time !== timeSlot
                                      );
                                    } else {
                                      updatedMealTimes[dayKey].lunch.push(timeSlot);
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
                        
                        {/* Dinner times */}
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>dinner</div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {['6:00-6:30 pm', '7:00-7:30 pm'].map((timeSlot) => {
                            const dayKey = selectedDay;
                            const timeKey = `${dayKey}-dinner-${timeSlot}`;
                            const isSelected = mealTimes[dayKey]?.dinner?.includes(timeSlot) || false;
                            
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
                                  if (!dayKey) return;
                                  
                                  // Create a deep copy of mealTimes
                                  const updatedMealTimes = { ...mealTimes };
                                  
                                  // Initialize day and meal if needed
                                  if (!updatedMealTimes[dayKey]) {
                                    updatedMealTimes[dayKey] = {};
                                  }
                                  if (!updatedMealTimes[dayKey].dinner) {
                                    updatedMealTimes[dayKey].dinner = [];
                                  }
                                  
                                  // Toggle time slot
                                  if (updatedMealTimes[dayKey].dinner.includes(timeSlot)) {
                                    updatedMealTimes[dayKey].dinner = updatedMealTimes[dayKey].dinner.filter(
                                      time => time !== timeSlot
                                    );
                                  } else {
                                    updatedMealTimes[dayKey].dinner.push(timeSlot);
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
                  )}
                </div>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>any other time preferences? (max 100 chars)</label>
                  <textarea
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '60px',
                      fontFamily: '"Courier New", Courier, monospace',
                    }}
                    placeholder="e.g., 'I prefer lunch meetings' or 'I'm flexible on weekends'"
                    maxLength={100}
                    value={timePreferences}
                    onChange={(e) => setTimePreferences(e.target.value)}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'right' }}>
                    {timePreferences.length}/100
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
                <div style={{ 
                  margin: '0 auto 1.5rem',
                  fontSize: '3rem'
                }}>
                  🍽️
                </div>
                
                <h2 style={{ fontSize: '1.5rem' }}>you're all set!</h2>
                <p style={{ marginTop: '1rem', lineHeight: '1.5' }}>
                  thank you for signing up. keep an eye on your brandeis email
                  for your meal match details. we'll connect you and provide contact information so you
                  can coordinate meeting up together!
                </p>
                
                <p style={{ 
                  marginTop: '1.5rem', 
                  fontSize: '0.9rem', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  excited to help you meet new people at brandeis!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add lock overlay when site is locked */}
      {!isSignupEnabled && !modalOpen && (
        <div 
          style={lockOverlayStyle} 
          onClick={() => document.body.style.overflow = 'auto'}
          className="lock-overlay"
        >
          <div className="lock-content" style={{
            opacity: 0,
            animation: 'fadeIn 1s forwards 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
  textAlign: 'center',
            width: '100%',
            maxWidth: '600px'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '2rem',
  fontWeight: 'bold',
              color: 'white',
              animation: 'floatText 3s ease-in-out infinite',
              opacity: 0,
              transform: 'translateY(20px)',
              animationDelay: '0.5s',
              animationFillMode: 'forwards'
            }}>
              strangers.
            </div>
            
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1.5rem',
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeSlideUp 0.8s forwards 0.7s',
              textTransform: 'lowercase'
            }}>
              signups temporarily closed
            </h2>
            
            <p style={{ 
              fontSize: '1.2rem', 
              maxWidth: '600px', 
              lineHeight: '1.6',
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeSlideUp 0.8s forwards 0.9s',
              textTransform: 'lowercase'
            }}>
              our meal matching service is currently preparing for the next round. 
              please check back soon to sign up!
            </p>
            
            <button 
              onClick={() => document.body.style.overflow = 'auto'}
              style={{
                marginTop: '2rem',
                padding: '0.8rem 2rem',
                backgroundColor: 'white',
  color: '#003865',
  border: 'none',
                borderRadius: '30px',
                fontSize: '1.1rem',
  cursor: 'pointer',
  fontFamily: '"Courier New", Courier, monospace',
                opacity: 0,
                transform: 'translateY(20px)',
                animation: 'fadeSlideUp 0.8s forwards 1.1s',
                textTransform: 'lowercase'
              }}
            >
              close
            </button>
          </div>
        </div>
      )}

      {/* Add animation styles for lock screen */}
      {useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeSlideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes floatText {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          
          .lock-overlay {
            backdrop-filter: blur(5px);
            animation: fadeIn 0.5s ease-in-out;
          }
          
          .lock-content {
            transition: all 0.3s ease;
          }
        `;
        document.head.appendChild(style);
        
        return () => {
          document.head.removeChild(style);
        };
      }, [])}
      
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
});
