import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);

  const Icons = {
    thermometer: () => (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
      </svg>
    ),
    smartphone: () => (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      </svg>
    ),
    bell: () => (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    ),
    barChart: () => (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
      </svg>
    ),
    cloud: () => (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
      </svg>
    ),
    users: () => (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  };

  const productFeatures = [
    {
      title: 'Dashboard',
      image: `${process.env.PUBLIC_URL}/Dashboard.png`,
      description: 'Get a complete overview of your farm operations with real-time KPIs, system health monitoring, and weather integration all in one place.',
      features: [
        'System health tracking',
        'Live sensor readings',
        'Weather forecast integration',
        'Recent alerts summary',
        'Critical alerts (48h)',
        'Bales monitored count'
      ]
    },
    {
      title: 'Sensors Management',
      image: `${process.env.PUBLIC_URL}/Sensors.png`,
      description: 'Monitor all your sensors with live temperature and moisture readings. Add, edit, or remove sensors with just a few clicks.',
      features: [
        'Real-time monitoring',
        'Battery status tracking',
        'Location management',
        'Quick actions',
        'Search & filter',
        'Status indicators'
      ]
    },
    {
      title: 'Sensor Details',
      image: `${process.env.PUBLIC_URL}/SensorDetails.png`,
      description: 'Deep dive into individual sensor analytics with detailed charts, historical trends, and customizable time periods.',
      features: [
        'Temperature & moisture charts',
        'Historical data (7/14/30 days)',
        'Data export functionality',
        'Alert history',
        'Optimal range indicators',
        'Auto-refresh capability'
      ]
    },
    {
      title: 'Alerts System',
      image: `${process.env.PUBLIC_URL}/Alerts.png`,
      description: 'Stay informed with real-time notifications for critical conditions. Filter by severity and manage alert status efficiently.',
      features: [
        'Severity-based filtering',
        'Instant notifications',
        'PDF export',
        'Status management',
        'Priority levels',
        'Sensor-specific alerts'
      ]
    },
    {
      title: 'Reports & Analytics',
      image: `${process.env.PUBLIC_URL}/Reports.png`,
      description: 'Generate comprehensive reports with interactive charts and trend analysis. Export data in multiple formats for further analysis.',
      features: [
        'Temperature trends',
        'Moisture analysis',
        'CSV/PDF export',
        'Summary statistics',
        'Date range filtering',
        'Sensor comparison'
      ]
    },
    {
      title: 'Team Management',
      image: `${process.env.PUBLIC_URL}/Team.png`,
      description: 'Collaborate effectively with role-based permissions, activity tracking, and easy team member management.',
      features: [
        'User management',
        'Role assignments',
        'Activity tracking',
        'Invite system',
        'Permission control',
        'Last login tracking'
      ]
    }
  ];

  const features = [
    { icon: 'thermometer', title: 'Real-Time Monitoring', description: 'Track temperature and moisture levels 24/7 with instant alerts when thresholds are exceeded.' },
    { icon: 'smartphone', title: 'Mobile Dashboard', description: 'Access your farm data anywhere with our intuitive mobile and web interface.' },
    { icon: 'bell', title: 'Instant Alerts', description: 'Receive critical notifications via SMS and push notifications before problems escalate.' },
    { icon: 'barChart', title: 'Analytics & Reports', description: 'Visualize trends and export detailed reports for better decision-making.' },
    { icon: 'cloud', title: 'Weather Integration', description: 'Location-based weather data helps you anticipate storage risks.' },
    { icon: 'users', title: 'Team Collaboration', description: 'Manage your team with role-based permissions and activity tracking.' }
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -450, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 450, behavior: 'smooth' });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    const result = await onLogin(signInEmail, signInPassword);
    if (result.success) {
      setShowSignInModal(false);
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      access_key: "8358bd98-c778-4862-b624-b26fdb103f07",
      subject: "New HayGuard Waitlist Registration",
      from_name: "HayGuard Landing Page",
      to_email: "hello@hayguard-app.com",
      farm_name: formData.get('farm_name'),
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        alert('Thank you for registering! We will contact you soon with early access details.');
        setShowRegisterModal(false);
      } else {
        alert('Registration failed. Please try again or email us directly at hello@hayguard-app.com');
      }
    } catch (error) {
      alert('Registration failed. Please try again or email us directly at hello@hayguard-app.com');
    }
  };

  const scrollToSection = (id) => {
    setShowMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showMobileMenu]);

  return (
    <div className={`landing-page ${showMobileMenu ? 'menu-open' : ''}`}>
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="logo">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="HayGuard" />
          </div>
          <div className="nav-buttons">
            <button className="btn btn-secondary" onClick={() => setShowSignInModal(true)}>Sign In</button>
            <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>Join Waitlist</button>
          </div>
          <button className="burger-menu" onClick={() => setShowMobileMenu(true)}>
            <div></div>
            <div></div>
            <div></div>
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-overlay ${showMobileMenu ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}></div>
      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="HayGuard" />
          <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>&times;</button>
        </div>
        <div className="mobile-menu-items">
          <div className="mobile-menu-item" onClick={() => scrollToSection('problem')}>The Problem</div>
          <div className="mobile-menu-item" onClick={() => scrollToSection('solution')}>Our Solution</div>
          <div className="mobile-menu-item" onClick={() => scrollToSection('features')}>Features</div>
          <div className="mobile-menu-item" onClick={() => scrollToSection('product-tour')}>Product Tour</div>
          <div className="mobile-menu-item" onClick={() => scrollToSection('how-it-works')}>How It Works</div>
        </div>
        <div className="mobile-cta-section">
          <button className="btn btn-primary" onClick={() => { setShowMobileMenu(false); setShowRegisterModal(true); }}>Join Waitlist</button>
          <button className="btn btn-secondary" onClick={() => { setShowMobileMenu(false); setShowSignInModal(true); }}>Sign In</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-modern" id="hero">
        <div className="hero-content-modern">
          <div className="hero-text-modern">
            <h1>Protect Your Harvest with <span className="highlight">Smart Monitoring</span></h1>
            <p>Affordable, plug-and-play IoT sensors that prevent spoilage, save yields, and protect your farm from fire risks. Join hundreds of farmers who have eliminated costly hay losses with our proven monitoring system.</p>
            <div className="hero-cta-modern">
              <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>Get Early Access</button>
              <button className="btn btn-secondary" onClick={() => scrollToSection('solution')}>Learn More</button>
            </div>
          </div>
          <div className="hero-app-screenshot">
            <img src={`${process.env.PUBLIC_URL}/laptop-dashboard.png`} alt="HayGuard Dashboard" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section-modern" id="problem">
        <div className="problem-container">
          <div className="problem-text">
            <h2>The Hidden Cost of Hay Storage</h2>
            <div className="stat-highlight">
              <span className="stat-number">20%</span>
              <span className="stat-label">Annual crop loss</span>
            </div>
            <p>Each year, up to 20% of baled crops spoil or lose nutrients due to undetected moisture and heat buildup. This leads to the global waste of hundreds of millions of tons of feed and food, costing farmers thousands in lost revenue and creating dangerous fire hazards.</p>
            <p>Traditional monitoring methods are time-consuming, imprecise, and often catch problems too late. Manual temperature checks with probes only measure a small area and require constant physical presence. By the time visible signs of spoilage appear, significant damage has already occurred.</p>
          </div>
          <div className="problem-phone">
            <img src={`${process.env.PUBLIC_URL}/mobile-alerts.png`} alt="Alert System" />
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section-modern" id="solution">
        <div className="solution-container">
          <h2>The HayGuard Solution</h2>
          <p className="section-intro">Our comprehensive monitoring system combines cutting-edge IoT technology with user-friendly design to give you complete control over your hay storage conditions. No technical expertise required - just plug in and start protecting your harvest.</p>
          <div className="value-props-modern">
            <div className="value-card-modern">
              <div className="value-icon">💰</div>
              <h3>Affordable Monitoring</h3>
              <p>Plug-and-play IoT solution with sensors delivering real-time moisture and temperature alerts via mobile and SMS. No expensive infrastructure needed. Our system pays for itself by preventing just one major loss event.</p>
            </div>
            <div className="value-card-modern">
              <div className="value-icon">🔥</div>
              <h3>Spoilage & Fire Prevention</h3>
              <p>Reduces 20% of hay losses per farm, protecting yields and minimizing fire risks. EU fire safety compliant. Our early warning system detects dangerous temperature rises before combustion can occur.</p>
            </div>
            <div className="value-card-modern">
              <div className="value-icon">✨</div>
              <h3>Ease of Use</h3>
              <p>Simple setup designed for non-technical farmers. Start monitoring within minutes. Each sensor comes pre-configured and ready to use - just insert into your hay bales and pair with the app.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-modern" id="features">
        <div className="features-container">
          <h2>Powerful Features for Modern Farming</h2>
          <p className="section-intro">Everything you need to maintain optimal storage conditions and protect your investment. Our platform grows with your operation, from small family farms to large commercial operations.</p>
          <div className="features-grid-modern">
            {features.map((feature, index) => {
              const IconComponent = Icons[feature.icon];
              return (
                <div className="feature-card-modern" key={index}>
                  <div className="feature-icon-modern">
                    <IconComponent />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Tour Section */}
      <section className="product-tour-section" id="product-tour">
        <div className="product-tour-container">
          <h2>Explore the HayGuard Platform</h2>
          <p className="section-intro">Take a detailed tour through every feature of our comprehensive farm monitoring system. Each module is designed to make farm management easier and more effective.</p>
          
          <div className="product-showcase">
            <button className="scroll-btn scroll-btn-left" onClick={scrollLeft} aria-label="Scroll left">‹</button>
            <button className="scroll-btn scroll-btn-right" onClick={scrollRight} aria-label="Scroll right">›</button>
            
            <div className="product-scroll-container" ref={scrollContainerRef}>
              {productFeatures.map((product, index) => (
                <div key={index} className="product-card">
                  <div className="product-image-wrapper">
                    <img src={product.image} alt={product.title} className="product-image" />
                  </div>
                  <div className="product-content">
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <div className="product-features-list">
                      {product.features.map((feature, i) => (
                        <div key={i} className="product-feature-item">
                          <span className="checkmark">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-modern" id="how-it-works">
        <div className="how-it-works-container">
          <div className="how-it-works-layout">
            <div className="how-it-works-phone">
              <img src={`${process.env.PUBLIC_URL}/mobile-sensors.png`} alt="Sensor Monitoring" />
            </div>
            <div className="how-it-works-steps">
              <h2>How It Works</h2>
              <p className="section-intro">Getting started with HayGuard is simple. Our streamlined process gets you up and running in less than 30 minutes.</p>
              <div className="step-modern">
                <div className="step-number-modern">1</div>
                <div className="step-content">
                  <h3>Install Sensors</h3>
                  <p>Place our plug-and-play sensors in your hay bales. No wiring or technical setup required. Each sensor is weatherproof, battery-powered, and designed to withstand harsh farm conditions.</p>
                </div>
              </div>
              <div className="step-modern">
                <div className="step-number-modern">2</div>
                <div className="step-content">
                  <h3>Connect & Monitor</h3>
                  <p>Sensors automatically connect to your dashboard. View real-time data on any device. Our cloud-based platform synchronizes data across all your devices.</p>
                </div>
              </div>
              <div className="step-modern">
                <div className="step-number-modern">3</div>
                <div className="step-content">
                  <h3>Get Alerted</h3>
                  <p>Receive instant notifications when temperature or moisture levels exceed safe thresholds. Customize alert settings for each sensor based on your specific hay type and storage conditions.</p>
                </div>
              </div>
              <div className="step-modern">
                <div className="step-number-modern">4</div>
                <div className="step-content">
                  <h3>Take Action</h3>
                  <p>Prevent spoilage and fire risks with timely interventions based on accurate data. Use historical trends to optimize ventilation schedules and storage practices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section className="analytics-section">
        <div className="analytics-container">
          <h2>Complete Farm Management</h2>
          <p className="section-intro">Monitor your entire operation from a single dashboard. Track multiple storage locations, manage your team, and access comprehensive analytics that help you make data-driven decisions.</p>
          <div className="analytics-phone">
            <img src={`${process.env.PUBLIC_URL}/mobile-farm-profile.png`} alt="Farm Management Dashboard" />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section-modern">
        <div className="cta-container">
          <div className="cta-text">
            <h2>Ready to Protect Your Harvest?</h2>
            <p>Join the waitlist to be among the first farmers to benefit from HayGuard's smart monitoring system. Limited spots available for early adopters who will receive exclusive launch pricing and priority support.</p>
            <button className="btn btn-primary btn-large" onClick={() => setShowRegisterModal(true)}>Register Your Farm Now</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="HayGuard" />
            </div>
            <p>Smart hay storage monitoring system designed to prevent spoilage and protect your harvest. Developed by farmers, for farmers.</p>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <a href="mailto:hello@hayguard-app.com">hello@hayguard-app.com</a>
            <p>Support available 7 days a week</p>
          </div>
          <div className="footer-section">
            <h3>Partner</h3>
            <p>Proudly part of the <a href="https://www.eitfood.eu/" target="_blank" rel="noopener noreferrer">EIT Food Accelerator Program</a></p>
            <p>Supported by the European Institute of Innovation and Technology</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 HayGuard. All rights reserved. | Part of EIT Food Accelerator</p>
        </div>
      </footer>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="modal active" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRegisterModal(false)}>&times;</button>
            <h2>Join the Waitlist</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Farm Name</label>
                <input type="text" name="farm_name" required placeholder="Enter your farm name" />
              </div>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" name="name" required placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" required placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" required placeholder="+1 (555) 123-4567" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register My Farm</button>
            </form>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="modal active" onClick={() => setShowSignInModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSignInModal(false)}>&times;</button>
            <h2>Sign In</h2>
            <form onSubmit={handleSignIn}>
              {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input type="email" required placeholder="hello@hayguard-app.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required placeholder="Enter your password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Sign In</button>
              <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                Don't have an account? <button type="button" onClick={() => { setShowSignInModal(false); setShowRegisterModal(true); }} style={{ background: 'none', border: 'none', color: '#8B4513', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Join the waitlist</button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;