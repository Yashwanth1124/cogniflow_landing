import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import HeroSection from "@/components/ui/hero-section";
import FeaturesSection from "@/components/ui/features-section";
import ComparisonTable from "@/components/ui/comparison-table";
import DemoSection from "@/components/ui/demo-section";
import TestimonialsSection from "@/components/ui/testimonials-section";
import FaqSection from "@/components/ui/faq-section";
import Footer from "@/components/ui/footer";
import { useTheme } from "@/context/theme-provider";

export default function LandingPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  // Check if user is logged in and redirect to dashboard if needed
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Function to navigate to auth page
  const navigateToAuth = (defaultTab: string = "login") => {
    // You could store the default tab in session/local storage here if needed
    // and then read it on the auth page to determine which tab to show
    setLocation("/auth");
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navigation */}
      <header className="fixed w-full bg-white dark:bg-gray-900 shadow-sm z-50 transition-all duration-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Logo className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-primary">Cogniflow</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => setCurrentSection("hero")}>Home</Button>
              <Button variant="ghost" onClick={() => setCurrentSection("features")}>Features</Button>
              <Button variant="ghost" onClick={() => setCurrentSection("why")}>Why Cogniflow</Button>
              <Button variant="ghost" onClick={() => setCurrentSection("demo")}>Demo</Button>
              <Button variant="ghost" onClick={() => setCurrentSection("testimonials")}>Testimonials</Button>
              <Button variant="ghost" onClick={() => setCurrentSection("faq")}>FAQ</Button>
            </nav>
            
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigateToAuth("login")}>Log In</Button>
              <Button onClick={() => navigateToAuth("register")}>Get Started</Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                  </svg>
                )}
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 shadow-md">
            <div className="px-4 py-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentSection("hero"); setMobileMenuOpen(false); }}>Home</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentSection("features"); setMobileMenuOpen(false); }}>Features</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentSection("why"); setMobileMenuOpen(false); }}>Why Cogniflow</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentSection("demo"); setMobileMenuOpen(false); }}>Demo</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentSection("testimonials"); setMobileMenuOpen(false); }}>Testimonials</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentSection("faq"); setMobileMenuOpen(false); }}>FAQ</Button>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" onClick={() => { navigateToAuth("login"); setMobileMenuOpen(false); }}>Log In</Button>
                <Button onClick={() => { navigateToAuth("register"); setMobileMenuOpen(false); }}>Get Started</Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page Sections */}
      {currentSection === "hero" && <HeroSection onGetStarted={() => navigateToAuth("register")} onWatchDemo={() => setCurrentSection("demo")} />}
      {currentSection === "features" && <FeaturesSection />}
      {currentSection === "why" && <ComparisonTable onStartTrial={() => navigateToAuth("register")} />}
      {currentSection === "demo" && <DemoSection onScheduleDemo={() => navigateToAuth("register")} />}
      {currentSection === "testimonials" && <TestimonialsSection onJoinCustomers={() => navigateToAuth("register")} />}
      {currentSection === "faq" && <FaqSection />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
