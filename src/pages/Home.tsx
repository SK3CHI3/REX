
import { MapPin, ArrowRight, Shield, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">REX</h1>
            <p className="text-sm text-gray-600 hidden sm:block">Police Brutality Tracker</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Accountability Through Transparency</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Kenya's Police
              <br />
              <span className="text-red-600">Brutality Tracker</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              An interactive platform documenting and mapping incidents of police brutality across Kenya. 
              Promoting justice, accountability, and human rights protection.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">47</div>
              <div className="text-sm text-gray-600">Counties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">150+</div>
              <div className="text-sm text-gray-600">Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">2024</div>
              <div className="text-sm text-gray-600">Updated</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button
              onClick={handleEnterApp}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <span>Explore The Map</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-sm text-gray-500">
              Click to view documented cases on an interactive map
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Interactive Mapping</h3>
              <p className="text-sm text-gray-600">Precise geolocation of incidents across Kenya</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Transparency</h3>
              <p className="text-sm text-gray-600">Open data promoting accountability</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Community Driven</h3>
              <p className="text-sm text-gray-600">Empowering citizens to report incidents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center">
        <p className="text-xs text-gray-500">
          © 2024 REX. Building a safer Kenya through transparency and accountability.
        </p>
      </footer>
    </div>
  );
};

export default Home;
