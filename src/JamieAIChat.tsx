import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Star } from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  affiliation: string;
  notes: string;
}

interface DQScore {
  framing: number;
  alternatives: number;
  information: number;
  values: number;
  reasoning: number;
  commitment: number;
}

interface Message {
  id: number;
  message: string;
  isUser: boolean;
  timestamp: string;
  userInfo?: UserInfo;
  dqScore?: DQScore;
  sessionId?: string;
  userId?: string;
  isError?: boolean;
  showDemoButton?: boolean;
}

const JamieAIChat: React.FC = () => {
  // User information state
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'testing' | 'connected' | 'failed'>('untested');
  const [demoMode, setDemoMode] = useState(false); // Start with real backend
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Test connection to backend
  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('https://jamie-backend.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: "test connection" }),
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        console.log('✅ Backend connection successful');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setConnectionStatus('failed');
    }
  };

  // Demo mode responses
  const getDemoResponse = (message: string): string => {
    const responses = [
      "I really appreciate you asking about this... it's been weighing on my mind a lot. My parents sacrificed so much to come here and they always talked about me becoming an engineer. But when I'm in my design classes, I just feel... alive, you know?",
      
      "It's really hard because I see the disappointment in their eyes when I even mention art. They keep saying 'art doesn't pay the bills' and 'we didn't come to America for you to struggle as an artist.' But I'm struggling now too, just in a different way.",
      
      "Sometimes I wonder if I'm being selfish. Like, maybe I should just push through engineering for them? But then I think about spending my whole life doing something that doesn't inspire me... that feels wrong too.",
      
      "You know what's funny? When I was little, my mom used to love my drawings. She'd put them on the fridge and brag to her friends. But somewhere along the way, that changed to 'drawing is just a hobby, focus on real subjects.'",
      
      "I've been looking at some art schools and design programs, and there are actually really good career prospects. UX design, industrial design, even engineering roles that are more creative. But how do I even start that conversation at home?",
      
      "The guilt is probably the hardest part. Like, they worked so hard to give me opportunities, and here I am wanting to 'throw it away' for something they see as frivolous. But I don't think they understand that I'm not throwing anything away - I'm trying to find where I actually belong.",
      
      "I've been doing some research on successful artists and designers, and many of them actually have technical backgrounds. Maybe there's a way to honor both parts of myself? I just don't know how to explain that to my parents without them thinking I'm making excuses.",
      
      "What really gets to me is when they compare me to my cousin who's doing well in computer science. They're like 'why can't you just be practical like her?' But they don't see how miserable I am in my current classes, or how excited I get when I'm working on creative projects."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getDemoScore = (): DQScore => ({
    framing: Math.random() * 3 + 6.5,
    alternatives: Math.random() * 3 + 5.5,
    information: Math.random() * 3 + 6.0,
    values: Math.random() * 3 + 7.0,
    reasoning: Math.random() * 3 + 6.2,
    commitment: Math.random() * 3 + 5.8
  });

  // Scroll to bottom when new messages arrive (optimized)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Test connection on mount
  useEffect(() => {
    if (!demoMode) {
      testConnection();
    }
  }, [demoMode]);

  // User info form component
  const UserInfoModal: React.FC = () => {
    const [formData, setFormData] = useState<UserInfo>({
      name: '',
      email: '',
      affiliation: '',
      notes: ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.email) return;
      setUserInfo(formData);
      setShowUserInfoModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to JamieAI</h2>
          <p className="text-gray-600 mb-6">
            You'll be coaching Jamie, a sophomore mechanical engineering student considering switching to art/design. 
            Please provide some basic information to get started.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affiliation
              </label>
              <input
                type="text"
                value={formData.affiliation}
                onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="University, Company, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any additional context or notes..."
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Start Coaching Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Decision Quality Score visualization
  const DQScoreDisplay: React.FC<{ scores: DQScore; className?: string }> = ({ scores, className = "" }) => {
    const dimensions = [
      { key: 'framing' as keyof DQScore, label: 'Framing', color: 'bg-blue-500' },
      { key: 'alternatives' as keyof DQScore, label: 'Alternatives', color: 'bg-green-500' },
      { key: 'information' as keyof DQScore, label: 'Information', color: 'bg-yellow-500' },
      { key: 'values' as keyof DQScore, label: 'Values', color: 'bg-purple-500' },
      { key: 'reasoning' as keyof DQScore, label: 'Reasoning', color: 'bg-red-500' },
      { key: 'commitment' as keyof DQScore, label: 'Commitment', color: 'bg-indigo-500' }
    ];

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;

    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">
            Decision Quality Score: {avgScore.toFixed(1)}/10
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {dimensions.map(dim => (
            <div key={dim.key} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{dim.label}</span>
                  <span>{scores[dim.key]?.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${dim.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${(scores[dim.key] / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Individual message component
  const ChatMessage: React.FC<{
    message: string;
    isUser: boolean;
    dqScore?: DQScore;
    timestamp: string;
    isError?: boolean;
    showDemoButton?: boolean;
  }> = ({ message, isUser, dqScore, timestamp, isError, showDemoButton }) => {
    return (
      <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-pink-600" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
          <div
            className={`p-4 rounded-2xl ${
              isUser
                ? 'bg-blue-600 text-white ml-auto'
                : isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="whitespace-pre-wrap">{message}</p>
            
            {showDemoButton && (
              <button
                onClick={() => setDemoMode(true)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Try Demo Mode
              </button>
            )}
          </div>
          
          {isUser && dqScore && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <DQScoreDisplay scores={dqScore} />
            </div>
          )}
          
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 order-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        )}
      </div>
    );
  };

  // Typing indicator
  const TypingIndicator: React.FC = () => (
    <div className="flex gap-3 justify-start mb-6">
      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-pink-600" />
      </div>
      <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );

  // Send message function
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const messageText = currentMessage.trim();
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now(),
      message: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
      userInfo: userInfo || undefined
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Handle demo mode
    if (demoMode) {
      setTimeout(() => {
        const dqScore = getDemoScore();
        const jamieReply = getDemoResponse(messageText);
        
        // Update user message with demo DQ score
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, dqScore }
            : msg
        ));

        // Add Jamie's demo response
        const jamieMessage: Message = {
          id: Date.now() + 1,
          message: jamieReply,
          isUser: false,
          timestamp: new Date().toISOString(),
          sessionId: "demo-session",
          userId: "demo-user"
        };

        setMessages(prev => [...prev, jamieMessage]);
        setIsLoading(false);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
      return;
    }

    try {
      console.log('Sending message to API:', messageText);
      
      const response = await fetch('https://jamie-backend.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Update user message with DQ score
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, dqScore: data.dq_score }
          : msg
      ));

      // Add Jamie's response
      const jamieMessage: Message = {
        id: Date.now() + 1,
        message: data.jamie_reply,
        isUser: false,
        timestamp: data.timestamp,
        sessionId: data.session_id,
        userId: data.user_id
      };

      setMessages(prev => [...prev, jamieMessage]);
      setConnectionStatus('connected');

    } catch (error) {
      console.error('Detailed error sending message:', error);
      setConnectionStatus('failed');
      
      // Show error message and offer demo mode
      let errorText = "I'm having trouble connecting to the backend. ";
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorText += "This might be a network issue or the backend may be sleeping. ";
        } else if (error.message.includes('500')) {
          errorText += "The backend returned an error. ";
        }
      }
      
      errorText += "Would you like to try demo mode instead?";
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: errorText,
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
        showDemoButton: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle message input change (optimized to prevent flashing)
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  // Handle enter key (optimized)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {showUserInfoModal && <UserInfoModal />}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
            <Bot className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Jamie {demoMode && <span className="text-sm text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-sm text-gray-600">Mechanical Engineering Student</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Demo mode switch */}
          {demoMode ? (
            <button
              onClick={() => {
                setDemoMode(false);
                testConnection();
              }}
              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Try Real Backend
            </button>
          ) : (
            /* Connection Status */
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'failed' ? 'bg-red-500' :
                connectionStatus === 'testing' ? 'bg-yellow-500' :
                'bg-gray-400'
              }`} />
              <span className="text-gray-600">
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'failed' ? 'Connection Failed' :
                 connectionStatus === 'testing' ? 'Testing...' :
                 'Not Connected'}
              </span>
              {connectionStatus === 'failed' && (
                <button
                  onClick={testConnection}
                  className="text-blue-600 hover:text-blue-700 text-xs underline"
                >
                  Test Again
                </button>
              )}
            </div>
          )}
          
          {userInfo && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Coach: {userInfo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-container"
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Start Coaching Jamie {demoMode && <span className="text-blue-600">(Demo Mode)</span>}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Jamie is a sophomore mechanical engineering student considering switching to art/design. 
              She's worried about disappointing her immigrant parents. How would you coach her?
            </p>
            
            {!demoMode && connectionStatus === 'failed' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                <p className="text-yellow-800 text-sm mb-3">
                  ⚠️ Can't connect to the backend. This might be because:
                </p>
                <ul className="text-yellow-700 text-xs mb-3 list-disc list-inside space-y-1">
                  <li>Backend is sleeping (Render.com free tier)</li>
                  <li>Network connectivity issue</li>
                  <li>Backend configuration problem</li>
                </ul>
                <div className="flex gap-2">
                  <button
                    onClick={testConnection}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Retry Connection
                  </button>
                  <button
                    onClick={() => setDemoMode(true)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Use Demo Mode
                  </button>
                </div>
              </div>
            )}
            
            {demoMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                <p className="text-blue-800 text-sm mb-3">
                  🎭 Demo mode active - Jamie will respond with simulated conversations and DQ scores.
                </p>
                <button
                  onClick={() => {
                    setDemoMode(false);
                    testConnection();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Try Real Backend
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            dqScore={msg.dqScore}
            timestamp={msg.timestamp}
            isError={msg.isError}
            showDemoButton={msg.showDemoButton}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            value={currentMessage}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your coaching message to Jamie..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[46px] max-h-32"
            rows={1}
            disabled={isLoading}
            style={{ 
              transition: 'none',
              height: 'auto',
              minHeight: '46px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !currentMessage.trim()}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JamieAIChat;