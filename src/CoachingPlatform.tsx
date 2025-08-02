import React, { useState } from 'react';
import { BookOpen, FileText, MessageCircle, CheckCircle } from 'lucide-react';
import DQScoringInterface from './DQScoringInterface';
import JamieAIChat from './JamieAIChat';

// Navigation Component
const Navigation: React.FC<{ currentPage: string; setCurrentPage: (page: string) => void }> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <BookOpen className="w-6 h-6" />
            DQ Coaching Platform
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('scoring')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'scoring' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Practice Scoring
            </button>
            
            <button
              onClick={() => setCurrentPage('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'chat' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Coach with Jamie
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Home Page Component
const HomePage: React.FC<{ setCurrentPage: (page: string) => void }> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Decision Quality Coaching Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the art of decision coaching through practice and live interaction. 
            Learn the Six Dimensions of Decision Quality while coaching Jamie, 
            an AI student navigating academic and career decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Practice Scoring Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Practice Scoring</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Upload conversation files and learn to score coaching effectiveness using the Decision Quality framework. 
              Perfect for training and analyzing existing coaching sessions.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Upload CSV or Word documents
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Score against 6 DQ dimensions
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Export results for analysis
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Built-in quality checking
              </div>
            </div>
            
            <button
              onClick={() => setCurrentPage('scoring')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Practice Scoring
            </button>
          </div>

          {/* Live Coaching Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8 text-pink-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coach with Jamie</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Practice live coaching conversations with Jamie, an AI student considering switching from 
              engineering to art/design. Get real-time Decision Quality feedback on your coaching.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Real-time AI conversation
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Live DQ scoring feedback
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Realistic student persona
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Export conversation history
              </div>
            </div>
            
            <button
              onClick={() => setCurrentPage('chat')}
              className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors font-medium"
            >
              Start Coaching Session
            </button>
          </div>
        </div>

        {/* DQ Framework Overview */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Six Dimensions of Decision Quality
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">UF</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Useful Framing</h4>
              <p className="text-sm text-gray-600">Clarify decision scope and stakeholders</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">MA</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Meaningful Alternatives</h4>
              <p className="text-sm text-gray-600">Explore diverse options and possibilities</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">RI</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Reliable Information</h4>
              <p className="text-sm text-gray-600">Gather quality, unbiased information</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">CVT</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Clear Values & Tradeoffs</h4>
              <p className="text-sm text-gray-600">Understand personal values and priorities</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">SR</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sound Reasoning</h4>
              <p className="text-sm text-gray-600">Apply logical, systematic thinking</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">CA</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Commitment to Action</h4>
              <p className="text-sm text-gray-600">Move toward concrete next steps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const CoachingPlatform: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'scoring':
        return <DQScoringInterface />;
      case 'chat':
        return <JamieAIChat />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  );
};

export default CoachingPlatform;