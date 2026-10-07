import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Video, Shield, ArrowRight, Eye, BarChart3, Activity, Zap, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-semibold gradient-text">FootBrain</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button className="group">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                AI-Powered Football
                <span className="block gradient-text">Analytics Platform</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 animate-fade-in">
                Predict injuries, analyze market value, and gain insights with cutting-edge AI technology and computer vision
              </p>
              <div className="flex gap-4 justify-center lg:justify-start animate-fade-in">
                <Link to="/signup">
                  <Button size="lg" className="group">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="relative rounded-xl overflow-hidden border border-border ai-glow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-background relative">
                  <img 
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop" 
                    alt="Football analysis with computer vision"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay with computer vision indicators */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full text-xs font-medium text-primary border border-primary/30">
                      <Eye className="w-3 h-3 inline mr-1" />
                      Computer Vision
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Computer Vision Showcase */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Advanced Computer Vision Technology</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes match footage in real-time, tracking player movements, ball position, and tactical patterns
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="relative rounded-xl overflow-hidden border border-border group hover:border-primary/50 transition-all">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-background relative">
                <img 
                  src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop" 
                  alt="Player tracking analysis"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Player Tracking</h3>
                    <p className="text-sm text-muted-foreground mt-1">Real-time position analysis</p>
                  </div>
                </div>
                {/* Overlay grid pattern simulating CV tracking */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
                  <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-border group hover:border-primary/50 transition-all">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-background relative">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop" 
                  alt="Tactical analysis"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Tactical Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">Formation & movement patterns</p>
                  </div>
                </div>
                {/* Tactical lines overlay */}
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full">
                    <line x1="0" y1="33%" x2="100%" y2="33%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                    <line x1="0" y1="66%" x2="100%" y2="66%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                    <line x1="33%" y1="0" x2="33%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                    <line x1="66%" y1="0" x2="66%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-border group hover:border-primary/50 transition-all">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-background relative">
                <img 
                  src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop" 
                  alt="Performance metrics"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Performance Metrics</h3>
                    <p className="text-sm text-muted-foreground mt-1">Speed, distance & acceleration</p>
                  </div>
                </div>
                {/* Data visualization overlay */}
                <div className="absolute bottom-4 left-4 right-4 opacity-40">
                  <div className="h-1 bg-primary rounded-full mb-1" style={{ width: '75%' }} />
                  <div className="h-1 bg-primary rounded-full mb-1" style={{ width: '60%' }} />
                  <div className="h-1 bg-primary rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="stat-card text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop" 
                  alt="Computer Vision"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Computer Vision</h3>
              <p className="text-muted-foreground">
                YOLOv8 detection, DeepSORT tracking, and OpenPose for real-time player analysis
              </p>
            </div>
            <div className="stat-card text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop" 
                  alt="Performance Analytics"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
              <p className="text-muted-foreground">
                Distance, speed, sprint intensity, and movement patterns extracted from video
              </p>
            </div>
            <div className="stat-card text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop" 
                  alt="Injury Prediction"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Injury Prediction</h3>
              <p className="text-muted-foreground">
                ML-powered risk assessment based on workload and movement patterns
              </p>
            </div>
            <div className="stat-card text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop" 
                  alt="Market Valuation"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Valuation</h3>
              <p className="text-muted-foreground">
                Performance-driven player value estimation using XGBoost models
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="stat-card ai-glow">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of teams using AI to make better decisions
            </p>
            <Link to="/signup">
              <Button size="lg" className="group">
                Create Your Account
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">FootBrain © 2025</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
