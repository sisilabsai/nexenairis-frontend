'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Typewriter } from 'react-simple-typewriter';

export default function LandingPage() {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional logic or early returns
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Bar chart data for animation and tooltips
  const barData = [
    { x: 80, height: 80, color: '#6366f1', value: 'Revenue: UGX 120,000' },
    { x: 160, height: 150, color: '#22d3ee', value: 'Profit: UGX 45,000' },
    { x: 240, height: 200, color: '#a21caf', value: 'Expenses: UGX 30,000' },
    { x: 320, height: 120, color: '#2563eb', value: 'Growth: 12%' },
    { x: 400, height: 170, color: '#f59e42', value: 'Cashflow: UGX 60,000' },
    { x: 480, height: 90, color: '#10b981', value: 'Savings: UGX 25,000' },
    { x: 560, height: 140, color: '#f43f5e', value: 'Investments: UGX 80,000' },
  ];
  // For infinite scroll, repeat the bars
  const repeatedBars = [...barData, ...barData];
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: '' });

  // Redirect logic
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Magical counter animation effect
  useEffect(() => {
    // Only run if we're showing the landing page
    if (isLoading || isAuthenticated) return;
    
    const animateCounters = () => {
      const counters = document.querySelectorAll('.magical-counter');
      
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = Math.floor(current).toString();
        }, 16);
      });
    };

    // Start animation after a small delay
    const timeout = setTimeout(animateCounters, 800);
    return () => clearTimeout(timeout);
  }, [isLoading, isAuthenticated]);

  // CONDITIONAL RENDERING AFTER ALL HOOKS
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NEXEN AIRIS
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="#modules" className="text-gray-700 hover:text-blue-600 transition-colors">Modules</a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
            <Link
              href="/login"
              className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        {/* Finance/Business SVG Background */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-30"
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Line Graph */}
          <polyline
            className="svg-graph-line animate-graph-line"
            points="0,500 100,400 200,420 300,300 400,350 500,200 600,250 700,180 800,220 900,100 1000,180 1100,120 1200,200"
            stroke="url(#lineGrad)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="0.5" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#a21caf" />
            </linearGradient>
          </defs>
          {/* Animated Bar Chart */}
          <g className="bar-group-animate">
            {repeatedBars.map((bar, i) => (
              <g key={i}>
                <rect
                  x={bar.x + i * 80}
                  y={500 - bar.height}
                  width="32"
                  height={bar.height}
                  rx="8"
                  fill={bar.color}
                  opacity="0.7"
                  onMouseEnter={e => setTooltip({ show: true, x: bar.x + i * 80 + 16, y: 500 - bar.height - 10, value: bar.value })}
                  onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                  onTouchStart={e => setTooltip({ show: true, x: bar.x + i * 80 + 16, y: 500 - bar.height - 10, value: bar.value })}
                  onTouchEnd={() => setTooltip({ ...tooltip, show: false })}
                  style={{ transition: 'fill 0.3s' }}
                />
              </g>
            ))}
          </g>
          {/* Tooltip (SVG foreignObject for best compatibility) */}
          {tooltip.show && (
            <foreignObject x={tooltip.x - 60} y={tooltip.y - 40} width="120" height="32">
              <div style={{
                background: 'rgba(30,41,59,0.95)',
                color: '#fff',
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 14,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                pointerEvents: 'none',
                fontFamily: 'inherit',
              }}>
                {tooltip.value}
              </div>
            </foreignObject>
          )}
          {/* Coins/Currency Symbols (unchanged) */}
          <g className="float-fast">
            <circle cx="180" cy="120" r="28" fill="#facc15" opacity="0.7" />
            <text x="180" y="130" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff">$</text>
          </g>
          <g className="float-medium">
            <circle cx="900" cy="80" r="22" fill="#a3e635" opacity="0.7" />
            <text x="900" y="90" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#2563eb">€</text>
          </g>
          <g className="float-slow">
            <circle cx="1100" cy="300" r="32" fill="#2563eb" opacity="0.7" />
            <text x="1100" y="312" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff">UGX</text>
          </g>
        </svg>
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              The Future of
              <span className="block relative">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  <Typewriter
                    words={['Business Management', 'AI-Powered Finance', 'African Innovation', 'Self-Driving ERP', 'Predictive Insights']}
                    loop={0}
                    cursor
                    cursorStyle="_"
                    typeSpeed={70}
                    deleteSpeed={40}
                    delaySpeed={1500}
                  />
                </span>
                <span className="absolute left-0 right-0 bottom-0 h-2">
                  <svg width="100%" height="12" viewBox="0 0 400 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 10 Q200 20 400 10" stroke="url(#grad)" strokeWidth="4" fill="none"/>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2563eb" />
                        <stop offset="0.5" stopColor="#6366f1" />
                        <stop offset="1" stopColor="#a21caf" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
              is Here
              </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Self-driving, intelligent, and hyper-localized ERP system designed specifically for 
              <span className="font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-size-200 animate-shimmer"> Ugandan and African businesses</span>. 
              Automate operations, get predictive insights, and scale effortlessly.
            </p>

            {/* Magical Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/30">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    <span className="magical-counter" data-target="95">0</span>%
                  </div>
                  <div className="text-sm text-gray-600">Faster Operations</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/30">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    <span className="magical-counter" data-target="500">0</span>+
                  </div>
                  <div className="text-sm text-gray-600">African Businesses</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/30">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    UGX <span className="magical-counter" data-target="2">0</span>M+
                  </div>
                  <div className="text-sm text-gray-600">Processed Daily</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <div className="relative group">
                {/* Floating micro-particles around CTA */}
                <div className="absolute -inset-4 opacity-30 group-hover:opacity-70 transition-opacity duration-500">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float-micro"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
                
                <Link
                  href="/register"
                  className="magical-cta relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Free Trial
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </div>

              <div className="relative group">
                <button className="relative inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-lg transform hover:scale-105 overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Demo
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="relative px-6 py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        {/* AI Particle Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="ai-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="ai-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              AI-Powered Intelligence
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powered by <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Artificial Intelligence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of business management with our AI-powered autonomous core that learns and adapts to your business
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* AI Core Feature */}
            <div className="group relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="12" cy="12" r="3" className="animate-pulse"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  AI-Powered Autonomous Core
                </h3>
                <p className="text-gray-600 text-center leading-relaxed mb-6">
                  AIDA Assistant provides conversational AI for business queries and decision support
                </p>
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span className="ai-counter" data-target="99">0</span>% Accuracy
                  </div>
                </div>
              </div>
              </div>

            {/* Predictive Insights Feature */}
            <div className="group relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    <path className="animate-pulse" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Predictive Business Insights
                </h3>
                <p className="text-gray-600 text-center leading-relaxed mb-6">
                  Get AI-powered recommendations to make better business decisions
                </p>
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    <span className="ai-counter" data-target="85">0</span>% Forecast Precision
                  </div>
                </div>
              </div>
              </div>

            {/* Automated Workflows Feature */}
            <div className="group relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    <circle cx="12" cy="12" r="2" className="animate-spin" style={{animationDuration: '3s'}}/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Automated Workflows
                </h3>
                <p className="text-gray-600 text-center leading-relaxed mb-6">
                  Self-learning business processes that adapt to your operations
                </p>
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <span className="ai-counter" data-target="75">0</span>% Time Saved
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced AIDA Assistant Showcase */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto backdrop-blur-sm">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-pulse"/>
                </svg>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-center">
                Meet AIDA, Your AI Business Assistant
              </h3>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed text-center">
                Ask questions, get insights, and automate tasks with conversational AI designed specifically 
                for African business operations.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <div className="text-sm text-blue-200 mb-2">Try asking AIDA:</div>
                <div className="space-y-3">
                  <div className="aida-demo-query bg-white/20 rounded-lg p-3 text-white cursor-pointer hover:bg-white/30 transition-colors">
                    💬 "Show me today's sales performance"
                  </div>
                  <div className="aida-demo-query bg-white/20 rounded-lg p-3 text-white cursor-pointer hover:bg-white/30 transition-colors">
                    📊 "Forecast next month's inventory needs"
                  </div>
                  <div className="aida-demo-query bg-white/20 rounded-lg p-3 text-white cursor-pointer hover:bg-white/30 transition-colors">
                    💰 "Reconcile mobile money transactions"
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  AIDA is online and ready to help
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Modules Section */}
      <section className="relative px-6 py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
              Complete ERP Suite
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Complete Business Management Suite
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Everything you need to run your business efficiently, from finance to HR, all integrated into one powerful platform designed for African businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Finance & Accounting Module */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">CORE</div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Finance & Accounting</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Complete financial management with bank reconciliation and mobile money integration</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Chart of Accounts
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Bank Integration
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Mobile Money
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Tax Compliance
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Integration Level</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Management Module */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">AI</div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Inventory Management</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Smart inventory tracking with AI-powered demand forecasting</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Stock Management
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    AI Forecasting
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Barcode System
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Supplier Management
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">AI Integration</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    ))}
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CRM & Sales Module */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">SALES</div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">CRM & Sales</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Customer relationship management with African business context</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Contact Management
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Sales Pipeline
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Customer Analytics
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Marketing Campaigns
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Market Focus</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* HR & Payroll Module */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">HR</div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">HR & Payroll</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Complete human resource management with local compliance</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Employee Management
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Payroll Processing
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Leave Management
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Performance Reviews
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Compliance</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Management Module */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">PRO</div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Project Management</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Professional project management with resource allocation</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Task Management
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Resource Planning
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Time Tracking
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Project Analytics
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Productivity</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    ))}
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Intelligence Module */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">BI</div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Business Intelligence</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Advanced analytics and reporting for data-driven decisions</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Custom Dashboards
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Real-time Reports
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Data Visualization
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Predictive Analytics
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Intelligence</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* African Localization Section */}
      <section className="relative px-6 py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 overflow-hidden">
        {/* African Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="african-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0l20 20-20 20-20-20z" fill="#16a34a" opacity="0.3"/>
              <circle cx="20" cy="20" r="8" fill="#059669" opacity="0.2"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#african-pattern)"/>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-medium mb-6">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              🌍 Built for Africa
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Hyper-Localized
              </span>{' '}
              for African Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Designed specifically for the unique needs of African businesses, with local compliance, 
              mobile money integration, and cultural context built-in from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Side */}
            <div className="space-y-8">
              {/* Impact Statistics */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    <span className="counter" data-target="95">0</span>%
                  </div>
                  <div className="text-sm text-gray-600">Mobile Money Coverage</div>
                </div>
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    <span className="counter" data-target="15">0</span>+
                  </div>
                  <div className="text-sm text-gray-600">African Countries</div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">MTN MoMo & Airtel Money</div>
                    <div className="text-sm text-gray-600">Seamless Integration</div>
                  </div>
                </div>

                <div className="group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">URA EFRIS Compliance</div>
                    <div className="text-sm text-gray-600">Automated Tax Filing</div>
                  </div>
                </div>

                <div className="group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Multi-Currency Support</div>
                    <div className="text-sm text-gray-600">UGX, USD, KES, TZS</div>
                  </div>
                </div>

                <div className="group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Offline-Capable</div>
                    <div className="text-sm text-gray-600">Works Without Internet</div>
                  </div>
                </div>

                <div className="group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mobile-First Design</div>
                    <div className="text-sm text-gray-600">Optimized for Africa</div>
                  </div>
                </div>

                <div className="group flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-green-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Local Templates</div>
                    <div className="text-sm text-gray-600">African Business Models</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Dashboard Demo */}
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time African Business Dashboard</h3>
                  <p className="text-sm text-gray-600">Live transaction processing across East Africa</p>
                </div>
                
                <div className="space-y-4">
                  {/* Mobile Money Transactions */}
                  <div className="group p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">MTN</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">MTN MoMo Payment</div>
                          <div className="text-xs text-gray-600">+256 783 123 456</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">UGX 250,000</div>
                        <div className="text-xs text-gray-500">Just now</div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-xs">AIRTEL</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Airtel Money Payment</div>
                          <div className="text-xs text-gray-600">+256 701 987 654</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">UGX 125,000</div>
                        <div className="text-xs text-gray-500">2 min ago</div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Bank Transfer</div>
                          <div className="text-xs text-gray-600">Stanbic Bank Uganda</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">UGX 500,000</div>
                        <div className="text-xs text-gray-500">5 min ago</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">URA Tax Calculation</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Auto-Calculated</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">VAT (18%): UGX 157,500</span>
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Live Status Indicator */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center px-4 py-2 bg-green-100 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">Live African Business Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative px-6 py-20 bg-gradient-to-b from-white via-gray-50 to-blue-50 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              💰 Transparent Pricing
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Simple, Transparent
              </span>{' '}
              Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the plan that fits your business needs. No hidden fees, no surprises. 
              Start with a 30-day free trial on any plan.
            </p>
            
            {/* Currency Toggle */}
            <div className="inline-flex items-center p-1 bg-white rounded-lg shadow-md border border-gray-200">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                UGX (Uganda)
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                USD (International)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">UGX 50K</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  Up to 5 users
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  Core modules (3)
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  Basic AI features
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  Email support
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full block text-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white transform scale-105 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full mb-4">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <div className="text-4xl font-bold mb-2">UGX 150K</div>
                <div className="text-blue-100">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-blue-100">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full mr-3"></div>
                  Up to 25 users
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full mr-3"></div>
                  All modules
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full mr-3"></div>
                  Advanced AI features
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full mr-3"></div>
                  Priority support
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full mr-3"></div>
                  Custom integrations
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full block text-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
                <div className="text-gray-600">Contact us</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  Unlimited users
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  Custom modules
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  White-label solution
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  Dedicated support
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                  On-premise option
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full block text-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join hundreds of African businesses that have already modernized their operations 
            with NEXEN AIRIS. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">S</span>
                </div>
                <span className="text-2xl font-bold">NEXEN AIRIS</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering Africa's next generation of businesses with intelligent, 
                autonomous ERP solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Modules</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 NEXEN AIRIS. All rights reserved. Built with ❤️ for Africa.</p>
        </div>
      </div>
      </footer>
      <style>{`
        /* Line graph draw animation */
        .svg-graph-line {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: graphLineDraw 2.5s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes graphLineDraw {
          to { stroke-dashoffset: 0; }
        }
        /* Bar chart group infinite left-to-right scroll */
        .bar-group-animate {
          transform: translateX(0);
          animation: barGroupScroll 12s linear infinite;
        }
        @keyframes barGroupScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(320px); }
        }
        /* Floating coins/currency symbols */
        .float-slow { animation: floatY 7s ease-in-out infinite; }
        .float-medium { animation: floatY 4.5s ease-in-out infinite; }
        .float-fast { animation: floatY 2.8s ease-in-out infinite; }
        @keyframes floatY {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-32px); }
          100% { transform: translateY(0px); }
        }
        /* AI Particles Animation */
        .ai-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .ai-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: linear-gradient(45deg, #3b82f6, #6366f1);
          border-radius: 50%;
          opacity: 0.6;
          animation: aiParticleFloat linear infinite;
        }
        @keyframes aiParticleFloat {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
            transform: scale(1);
          }
          90% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
          }
        }
        /* AI Counter Animation */
        .ai-counter {
          display: inline-block;
          font-variant-numeric: tabular-nums;
        }
        /* Magical Hero Enhancements */
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .magical-counter {
          display: inline-block;
          font-variant-numeric: tabular-nums;
          transition: all 0.3s ease;
        }
        .animate-float-micro {
          animation: floatMicro linear infinite;
        }
        @keyframes floatMicro {
          0% { 
            transform: translateY(0px) scale(0);
            opacity: 0;
          }
          20% {
            transform: scale(1);
            opacity: 0.8;
          }
          80% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% { 
            transform: translateY(-20px) scale(0);
            opacity: 0;
          }
        }
        .magical-cta:hover {
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
        }
        .bg-size-200 {
          background-size: 200% 100%;
        }
      `}</style>
    </div>
  );
}
