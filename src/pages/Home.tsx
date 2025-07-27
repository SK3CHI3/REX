import React, { useState, useRef } from 'react';
import { MapPin, ArrowRight, Shield, Users, Eye, Calendar, AlertTriangle, ChevronDown, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useCases } from '@/hooks/useCases';

// Helper functions - defined outside component to avoid hoisting issues
const formatRelativeDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const formatCaseType = (type: string | null | undefined) => {
  if (!type) return 'Unknown';
  return type.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const Home = () => {
  const navigate = useNavigate();
  const { data: cases, isLoading, error } = useCases();

  // Secret admin access state
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnterApp = () => {
    navigate('/map');
  };

  // Secret admin access handler
  const handleLiveIndicatorClick = () => {
    setTapCount(prev => prev + 1);

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Set new timeout to reset tap count
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 500); // Reset after 500ms

    // Check for double tap
    if (tapCount + 1 >= 2) {
      setTapCount(0);
      navigate('/admin/login');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate statistics from real data
  const totalCases = cases?.length || 0;
  const thisMonthCases = cases?.filter(c => {
    const caseDate = new Date(c.incident_date);
    const now = new Date();
    return caseDate.getMonth() === now.getMonth() && caseDate.getFullYear() === now.getFullYear();
  }).length || 0;

  // Show error state if data fails to load
  if (error) {
    console.error('Error loading cases:', error);
  }

  // Get recent cases from real data
  const recentCases = cases
    ?.sort((a, b) => new Date(b.incident_date || '').getTime() - new Date(a.incident_date || '').getTime())
    .slice(0, 6)
    .map(case_ => ({
      location: case_.location || 'Unknown location',
      date: formatRelativeDate(case_.incident_date),
      type: formatCaseType(case_.case_type)
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white overflow-x-hidden">
      {/* Floating Navigation Header */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl max-w-7xl w-full">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                {/* Police shield with crack/slash SVG */}
                <span className="text-2xl" role="img" aria-label="Scales of Justice">⚖️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">REX</h1>
                <p className="text-xs text-gray-300 hidden sm:block">Justice through visibility</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('impact')}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
              >
                Impact
              </button>
            </div>

            <Button
              onClick={handleEnterApp}
              size="sm"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 transform duration-200"
            >
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-[80vh] flex items-center px-2 sm:px-4 pt-24 pb-10 sm:pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center min-h-[60vh]">
            
            {/* Left Side - Main Content */}
            <div className="space-y-8 animate-fade-in flex flex-col justify-center h-full">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-red-900/30 backdrop-blur-sm border border-red-500/30 text-red-300 px-6 py-3 rounded-full text-sm font-medium w-fit">
                <Shield className="w-4 h-4" />
                <span>Brutality Marked On Map</span>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Kenya's
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent block ml-4 sm:ml-6">
                    Justice
                  </span>
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Tracker
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed font-light">
                  An interactive platform documenting police brutality incidents across Kenya. 
                  <span className="text-red-400 font-medium"> Empowering communities through data transparency.</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <Button
                  onClick={handleEnterApp}
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 group"
                >
                  <span>Explore Interactive Map</span>
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <button 
                  onClick={() => scrollToSection('about')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-lg font-medium group"
                >
                  <span>Learn More</span>
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Key Metrics - No background card, moved up */}
              <div className="mt-6 mb-4">
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col items-start">
                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-sm text-gray-400">Live Monitoring</div>
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-sm text-gray-400">Data Transparency</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Data Visualization & Recent Cases */}
            <div className="animate-fade-in lg:pl-8 flex items-center justify-center">
              {/* Live Stats Card - Responsive width */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg flex flex-col">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold">Live Statistics</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      47
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Counties</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {isLoading ? '...' : error ? '--' : totalCases}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Total Cases</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {isLoading ? '...' : error ? '--' : thisMonthCases}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">This Month</div>
                  </div>
                </div>

                {/* Recent Cases */}
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      Recent Cases
                    </h4>
                    <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30">
                      Live Updates
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                      <div className="text-center text-gray-400 py-4">Loading recent cases...</div>
                    ) : error ? (
                      <div className="text-center text-gray-400 py-4">Unable to load cases</div>
                    ) : recentCases.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">No cases found</div>
                    ) : (
                      recentCases.slice(0, 3).map((case_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            <div>
                              <p className="text-sm font-medium text-white">{case_.location}</p>
                              <p className="text-xs text-gray-400">{case_.type}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{case_.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Our Mission
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              REX exists to create transparency and accountability in law enforcement through 
              comprehensive documentation and community empowerment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Why This Matters</h3>
              <p className="text-gray-300 leading-relaxed">
                Police brutality cases often go undocumented or unreported, making it difficult 
                to understand patterns and hold authorities accountable. Our platform bridges 
                this gap by providing a comprehensive, transparent view of incidents across Kenya.
              </p>
              <div className="flex items-center space-x-3 text-red-400">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Real-time incident tracking</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/20 to-black/40 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
              <h4 className="text-xl font-bold text-white mb-4">Data-Driven Justice</h4>
              <p className="text-gray-300 mb-6">
                Every pin on our map represents a human story. By visualizing these incidents, 
                we help communities, activists, and policymakers make informed decisions.
              </p>
              <Button 
                onClick={handleEnterApp}
                variant="outline" 
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                View Data Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Platform Features
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Interactive Mapping",
                description: "Precise geolocation of incidents with detailed filtering and search capabilities across all 47 counties.",
                color: "from-red-500 to-orange-500"
              },
              {
                icon: Eye,
                title: "Transparency First",
                description: "Open data approach ensuring all information is accessible, verifiable, and contributes to accountability.",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Empowering citizens to report incidents and contribute to a comprehensive database of events.",
                color: "from-green-500 to-teal-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 px-4 bg-gradient-to-r from-red-900/10 to-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Creating Real Impact
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of Kenyans working together to build a more transparent 
            and accountable society through data-driven advocacy.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">{isLoading ? '...' : error ? '--' : totalCases}</div>
              <div className="text-gray-300">Cases Documented</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">47</div>
              <div className="text-gray-300">Counties Covered</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">24/7</div>
              <div className="text-gray-300">Live Monitoring</div>
            </div>
          </div>
          
          <Button
            onClick={handleEnterApp}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Start Exploring
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                  <span className="text-2xl" role="img" aria-label="Scales of Justice">⚖️</span>
                </div>
                <span className="text-xl font-bold">REX</span>
              </div>
              <p className="text-gray-400 text-sm">
                Justice through visibility
              </p>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Platform</h4>
              <div className="space-y-2">
                <button onClick={handleEnterApp} className="block text-gray-400 hover:text-white text-sm transition-colors">
                  Interactive Map
                </button>
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-white text-sm transition-colors">
                  About
                </button>
                <button onClick={() => scrollToSection('features')} className="block text-gray-400 hover:text-white text-sm transition-colors">
                  Features
                </button>
              </div>
            </div>

            {/* Data */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Data</h4>
              <div className="space-y-2">
                <div className="text-gray-400 text-sm">Total Cases: {isLoading ? '...' : error ? '--' : totalCases}</div>
                <div className="text-gray-400 text-sm">Counties: 47</div>
                <div className="text-gray-400 text-sm">Last Updated: Today</div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Support</h4>
              <div className="space-y-2">
                <div className="text-gray-400 text-sm">Report an Issue</div>
                <div className="text-gray-400 text-sm">Community Guidelines</div>
                <div className="text-gray-400 text-sm">Privacy Policy</div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
                © {new Date().getFullYear()} REX. Building a safer Kenya through transparency and accountability.
              </p>
              <div className="flex items-center space-x-6">
                <span className="text-gray-400 text-sm">Together for justice</span>
                <button
                  onClick={handleLiveIndicatorClick}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
