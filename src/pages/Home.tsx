
import { MapPin, ArrowRight, Shield, Users, Eye, Calendar, AlertTriangle, ChevronDown, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate('/map');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Recent cases data
  const recentCases = [
    { location: 'Nairobi CBD', date: '2 days ago', type: 'Assault' },
    { location: 'Mombasa Road', date: '4 days ago', type: 'Unlawful Arrest' },
    { location: 'Kisumu Central', date: '1 week ago', type: 'Harassment' },
    { location: 'Nakuru Town', date: '1 week ago', type: 'Death' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white overflow-x-hidden">
      {/* Floating Navigation Header */}
      <nav className="fixed top-4 left-4 right-4 z-50 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">REX</h1>
                <p className="text-xs text-gray-300 hidden sm:block">Police Brutality Tracker</p>
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
      <section className="relative min-h-screen flex items-center px-4 pt-24">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Main Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-red-900/30 backdrop-blur-sm border border-red-500/30 text-red-300 px-6 py-3 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Accountability Through Transparency</span>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Kenya's
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                    Justice
                  </span>
                  <br />
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

              {/* Key Metrics */}
              <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-sm text-gray-400">Live Monitoring</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-sm text-gray-400">Data Transparency</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Data Visualization & Recent Cases */}
            <div className="space-y-8 animate-fade-in lg:pl-8">
              {/* Live Stats Card */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
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
                      247
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Total Cases</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      18
                    </div>
                    <div className="text-sm text-gray-400 font-medium">This Month</div>
                  </div>
                </div>

                {/* Recent Cases */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      Recent Cases
                    </h4>
                    <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30">
                      Live Updates
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {recentCases.map((case_, index) => (
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
                    ))}
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
      <footer className="py-12 px-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">REX</span>
            </div>
            
            <p className="text-gray-400 text-sm text-center md:text-right">
              © 2024 REX. Building a safer Kenya through transparency and accountability.
              <br className="md:hidden" />
              <span className="hidden md:inline"> | </span>
              Together for justice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
