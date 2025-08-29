'use client'

import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Function to format text with basic markdown support
  const formatText = (content) => {
    if (!content) return "";
    
    // Replace line breaks with <br> tags
    let formattedContent = content.replace(/\n/g, '<br>');
    
    // Replace **text** with <strong>text</strong>
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace *text* with <em>text</em>
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace bullet points with list items
    formattedContent = formattedContent.replace(/^\- (.*?)(<br>|$)/gm, '<li>$1</li>');
    
    // Wrap list items in <ul> tags if we find any list items
    if (formattedContent.includes('<li>')) {
      formattedContent = formattedContent.replace(/(<li>.*<\/li>)/, '<ul>$1</ul>');
    }
    
    return { __html: formattedContent };
  };

  async function generateAnswer() {
    if (!text.trim()) {
      return alert("Please enter a question or prompt");
    }
    
    try {
      setIsLoading(true);
      // Add user question to history
      const userQuestion = text;
      setHistory(prev => [...prev, { type: "user", content: userQuestion }]);
      
      const res = await axios.post(`/api/chat`, { text });
      const aiAnswer = res.data.answer || "No answer found";
      
      // Save answer from API and add to history
      setAnswer(aiAnswer);
      setHistory(prev => [...prev, { type: "ai", content: aiAnswer }]);
      setText("");
    } catch (err) {
      console.error(err);
      const errorMsg = "Error fetching answer";
      setAnswer(errorMsg);
      setHistory(prev => [...prev, { type: "ai", content: errorMsg, error: true }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      generateAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">AI Assistant</h1>
          <p className="text-gray-600">Ask anything and get intelligent responses</p>
        </header>
        
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow relative">
              <textarea
                className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows="3"
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 text-gray-400 text-sm">
                {isLoading ? '⏳' : '⮐ Enter to send'}
              </div>
            </div>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-end md:self-auto"
              disabled={isLoading || !text.trim()}
              onClick={generateAnswer}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Answer"
              )}
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversation History</h2>
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg ${item.type === 'user' ? 'bg-blue-50' : item.error ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="font-medium mb-2 text-sm flex items-center">
                    {item.type === 'user' ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        You
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        AI Assistant
                      </>
                    )}
                  </div>
                  {item.type === 'user' ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
                  ) : (
                    <div 
                      className={`text-gray-800 ${item.error ? 'text-red-600' : 'prose prose-sm max-w-none'}`}
                      dangerouslySetInnerHTML={formatText(item.content)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {answer && !history.some(item => item.type === 'ai' && item.content === answer) && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Answer</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium mb-2 text-sm flex items-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Assistant
              </div>
              <div 
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={formatText(answer)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}