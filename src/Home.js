// eslint-disable-next-line
import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';

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
  flexDirection: isMobile ? 'column' : 'row',
  justifyContent: isMobile ? 'center' : 'space-between',
  alignItems: isMobile ? 'stretch' : 'center',
  marginTop: '1.5rem',
  gap: isMobile ? '0.75rem' : '0'
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
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  backgroundColor: '#e6f2ff', // Light blue background
  background: 'linear-gradient(180deg, #e6f2ff 0%, #f5f9ff 100%)', 
  paddingTop: isMobile ? '20px' : '0',
  marginTop: isMobile ? '0' : '0',
  position: 'relative',
  overflow: 'hidden' // For cloud overlay
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
  zIndex: 1, // Ensure content appears above the cloud background
  width: '100%',
  maxWidth: '800px',
  padding: '0 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center align all content
  textAlign: 'center'
};

// Create better title styles for hero section
const createHeroTitleStyle = (isMobile = false) => ({
  fontSize: isMobile ? '3rem' : '5rem',
  marginTop: isMobile ? '1.5rem' : '0', // Reduced from 3rem to 1.5rem
  color: '#003865',
  marginBottom: '0.5rem',
  width: '100%', // Ensure full width for better centering
  textAlign: 'center'
});

// Create subtitle style for hero section
const createHeroSubtitleStyle = (isMobile = false) => ({
  fontWeight: 'normal',
  fontSize: isMobile ? '1.4rem' : '2.5rem',
  marginBottom: '1.5rem',
  color: '#003865',
  width: '100%', // Ensure full width for consistent centering
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
  width: '100%' // Ensure text spans full width of container
});

// Add new styles for the "How It Works" section
const howItWorksContainerStyle = {
  maxWidth: '600px', // Match the paragraph width in hero section
  margin: '0 auto 4rem auto',
  padding: '0 1.5rem',
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
  function toggleSelection(array, setArray, value) {
    if (array.includes(value)) {
      setArray(array.filter((item) => item !== value));
    } else {
      setArray([...array, value]);
    }
  }

  // ---------------------------
  // STEP NAVIGATION
  // ---------------------------
  function goToStep2() {
    if (!email.endsWith('@brandeis.edu')) {
      alert('Please use your brandeis email (@brandeis.edu).');
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
  
  function goToPersonalityStep() {
    if (!classLevel || selectedMajors.length === 0) {
      alert('Please select your class level and at least one major.');
      return;
    }
    setCurrentStep(3);
    setPersonalityStep(true);
  }
  
  function goToMealPreferencesStep() {
    // Check if personality questions are answered
    const missingFields = [];
    
    if (!personalityType) missingFields.push('introvert/extrovert');
    if (!humorType) missingFields.push('humor type');
    if (!conversationType) missingFields.push('conversation style');
    if (!plannerType) missingFields.push('planner/procrastinator');
    if (!hpHouse) missingFields.push('Harry Potter house');
    if (!matchPreference) missingFields.push('meet someone similar/different');
    
    if (missingFields.length > 0) {
      alert(`Please answer all personality questions. Missing: ${missingFields.join(', ')}`);
      return;
    }
    
    setCurrentStep(4);
    setPersonalityStep(false);
  }

  function goBackToStep2() {
    setCurrentStep(2);
    setPersonalityStep(false);
  }

  function goBackToPersonalityStep() {
    setCurrentStep(3);
    setPersonalityStep(true);
  }

  // ---------------------------
  // SUBMIT FORM: Sign up + Insert
  // ---------------------------
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit() {
    setLoading(true);
    
    try {
      // Basic validation
      if (!name || !email || !selectedLocations.length) {
        alert('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      
      // Simpler data structure aligned with our new table
      const userData = {
        name: name,
        email: email.trim(),
        majors: selectedMajors,
        class_level: classLevel,
        interests: selectedInterests,
        meal_plan: mealPlan,
        guest_swipe: guestSwipe,
        dining_locations: selectedLocations,
        meal_times_json: JSON.stringify(mealTimes),
        meal_times_flattened: JSON.stringify({
          tuesday_dinner_600_630: mealTimes.tuesday?.dinner?.includes('6:00-6:30 PM') || false,
          tuesday_dinner_630_700: mealTimes.tuesday?.dinner?.includes('6:30-7:00 PM') || false,
          wednesday_dinner_600_630: mealTimes.wednesday?.dinner?.includes('6:00-6:30 PM') || false,
          wednesday_dinner_630_700: mealTimes.wednesday?.dinner?.includes('6:30-7:00 PM') || false
        }),
        personality_type: personalityType,
        humor_type: humorType,
        conversation_type: conversationType,
        planner_type: plannerType,
        hp_house: hpHouse,
        match_preference: matchPreference
      };
      
      console.log('Submitting to main table:', userData);
      
      // Insert data into the main table
      const { data, error } = await supabase
        .from('main')
        .insert([userData]);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Show success message
      setSignUpSuccess(true);
      setCurrentStep(4);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}. Please try again or contact support.`);
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

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div style={{ position: 'relative' }}>
      {/* Cloud background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'linear-gradient(#a2cfff, #ffffff)',
          overflow: 'hidden',
        }}
      >
        {/* Example clouds */}
        <div
          style={{
            position: 'absolute',
            background: '#fff',
            borderRadius: '50%',
            filter: 'blur(8px)',
            opacity: 0.7,
            animation: 'floatClouds 60s linear infinite',
            width: 200,
            height: 100,
            top: '20%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            background: '#fff',
            borderRadius: '50%',
            filter: 'blur(8px)',
            opacity: 0.7,
            animation: 'floatClouds 60s linear infinite',
            width: 150,
            height: 75,
            top: '50%',
            animationDelay: '15s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            background: '#fff',
            borderRadius: '50%',
            filter: 'blur(8px)',
            opacity: 0.7,
            animation: 'floatClouds 60s linear infinite',
            width: 250,
            height: 125,
            top: '70%',
            animationDelay: '30s',
          }}
        />
      </div>

      {/* Keyframes for cloud animation (inline style fallback) */}
      <style>
        {`
          @keyframes floatClouds {
            0% { transform: translateX(-100vw); }
            100% { transform: translateX(100vw); }
          }
        `}
      </style>

      {/* Sticky Header */}
      <header style={headerStyle}>
        <div style={logoStyle}>strangers.</div>
        
        {/* Only show full navigation on desktop */}
        {!isMobile ? (
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="#problem" style={navLinkStyle}>problem</a>
            <a href="#features" style={navLinkStyle}>features</a>
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

      {/* Hero section with restored blue clouds */}
      <section id="signup" style={heroSectionStyle} className="cloud-bg">
        {/* Cloud background overlay */}
        <div style={cloudOverlayStyle}></div>
        
        {/* Content layer above clouds */}
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            {typedText}
          </h1>
          <h2 style={heroSubtitleStyle}>
            brandeis meal match
          </h2>
          <p style={heroTextStyle}>
            connecting random brandeis students for meals, because sometimes meeting strangers is exactly what you need.
          </p>
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
        </div>
      </section>

      {/* How It Works section - new compact design */}
      <section style={howItWorksContainerStyle}>
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
      </section>

      {/* Features section */}
      <section
        id="features"
        style={{
          // opacity: 0,
          transform: 'translateY(20px)',
          transition: 'opacity 0.8s, transform 0.8s',
          padding: '2rem',
          maxWidth: 1200,
          margin: '0 auto',
        }}
        className="fade-in"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '2rem',
            marginTop: '3rem',
          }}
        >
          <div style={featureCardStyle}>
            <h3 style={{ marginBottom: '1rem', textTransform: 'lowercase' }}>
              random matching
            </h3>
            <p style={{ textTransform: 'lowercase' }}>
              you'll be paired with someone new every time, broadening your
              network.
            </p>
          </div>
          <div style={featureCardStyle}>
            <h3 style={{ marginBottom: '1rem', textTransform: 'lowercase' }}>
              customize preferences
            </h3>
            <p style={{ textTransform: 'lowercase' }}>
              pick your dining halls, meal times, class level, major, and
              interests.
            </p>
          </div>
          <div style={featureCardStyle}>
            <h3 style={{ marginBottom: '1rem', textTransform: 'lowercase' }}>
              simple process
            </h3>
            <p style={{ textTransform: 'lowercase' }}>
              sign up with your brandeis email, get your match details via
              email, and show your color.
            </p>
          </div>
        </div>
      </section>

      {/* Modal Overlay */}
      {modalOpen && (
        <div
          className="modalOverlay active"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="modal"
            style={modalContainerStyle}
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
                    style={inputStyle}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '1.5rem',
                  }}
                >
                  <button onClick={goToStep2} style={btnStyle}>
                    next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div>
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
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>select interests:</label>
                  <div style={bubbleContainerStyle}>
                    {[
                      'sports',
                      'art',
                      'movies',
                      'hiking',
                      'reading',
                      'volunteering',
                      'gaming',
                      'music',
                      'dance',
                      'cooking',
                      'photography',
                      'theater',
                      'science fiction',
                      'travel',
                      'politics',
                      'poetry',
                    ].map((interest) => (
                      <div
                        key={interest}
                        style={{
                          ...bubbleStyle,
                          ...(selectedInterests.includes(interest)
                            ? bubbleSelectedStyle
                            : {}),
                        }}
                        onClick={() =>
                          toggleSelection(
                            selectedInterests,
                            setSelectedInterests,
                            interest
                          )
                        }
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={buttonsRowStyle}>
                  <button onClick={goBackToStep1} style={btnStyle}>
                    back
                  </button>
                  <button onClick={goToPersonalityStep} style={btnStyle}>
                    next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PERSONALITY QUESTIONS */}
            {currentStep === 3 && personalityStep && (
              <div style={{ animation: 'fadeIn 0.8s forwards' }}>
                <h3 style={{ marginBottom: '1.2rem', fontSize: '1.1rem' }}>
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
                  <button onClick={goBackToStep2} style={btnStyle}>
                    back
                  </button>
                  <button onClick={goToMealPreferencesStep} style={btnStyle}>
                    next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: MEAL PREFERENCES */}
            {currentStep === 4 && !personalityStep && !signUpSuccess && (
              <div style={{ animation: 'fadeIn 0.8s forwards' }}>
                <h3 style={{ marginBottom: '1.2rem', fontSize: '1.1rem' }}>
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
                  <label style={labelStyle}>preferred dining locations:</label>
                  <div style={bubbleContainerStyle}>
                    {[
                      'sherman',
                      'usdan',
                    ].map((loc) => (
                      <div
                        key={loc}
                        style={{
                          ...bubbleStyle,
                          ...(selectedLocations.includes(loc)
                            ? bubbleSelectedStyle
                            : {}),
                        }}
                        onClick={() =>
                          toggleSelection(
                            selectedLocations,
                            setSelectedLocations,
                            loc
                          )
                        }
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={labelStyle}>select meal times</label>
                  <p style={{ fontSize: '0.85rem', marginTop: '-0.5rem' }}>
                    select available 30-minute time slots (6:00-7:00 PM)
                  </p>
                  <div
                    style={{
                      ...bubbleContainerStyle,
                      justifyContent: 'center',
                    }}
                  >
                    {['tuesday', 'wednesday'].map((day) => (
                      <div
                        key={day}
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
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{day}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {['6:00-6:30 PM', '6:30-7:00 PM'].map((timeSlot) => {
                            // Create unique key for each day-time combination
                            const timeKey = `${day}-${timeSlot}`;
                            const isSelected = mealTimes[day]?.dinner?.includes(timeSlot) || false;
                            
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
                                  if (!updatedMealTimes[day]) {
                                    updatedMealTimes[day] = {};
                                  }
                                  if (!updatedMealTimes[day].dinner) {
                                    updatedMealTimes[day].dinner = [];
                                  }
                                  
                                  // Toggle time slot
                                  if (updatedMealTimes[day].dinner.includes(timeSlot)) {
                                    updatedMealTimes[day].dinner = updatedMealTimes[day].dinner.filter(
                                      time => time !== timeSlot
                                    );
                                  } else {
                                    updatedMealTimes[day].dinner.push(timeSlot);
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
                    ))}
                  </div>
                </div>
                
                <div style={buttonsRowStyle}>
                  <button onClick={goBackToPersonalityStep} style={btnStyle}>
                    back
                  </button>
                  <button
                    onClick={handleSubmit}
                    style={{
                      ...btnStyle,
                      width: isMobile ? '100%' : 'auto',
                      marginTop: isMobile ? '1rem' : '0',
                    }}
                    disabled={loading}
                  >
                    {loading ? 'submitting...' : 'sign up'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS */}
            {currentStep === 4 && signUpSuccess && (
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

      {/* Add this at the end of your component */}
      {useEffect(() => {
        // Check if we have any failed submissions to retry
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
        
        // Try to resubmit when the component mounts
        attemptToResubmitFailedEntries();
      }, [])}
    </div>
  );
}
