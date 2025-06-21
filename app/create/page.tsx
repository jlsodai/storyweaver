"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Send, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface StoryData {
  childName?: string;
  childAge?: number;
  mainCharacter?: string;
  setting?: string;
  storyType?: string;
  moralLesson?: string;
  interests?: string[];
  otherCharacters?: string[];
  storyLength?: string;
}

export default function CreateStory() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm so excited to help you create a magical story for your child! ✨ To get started, could you tell me your child's name and age?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStory, setCurrentStory] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<StoryData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate API delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          storyData
        })
      });

      console.log(response);

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();

      console.log(data);
      
      setIsTyping(false);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.storyData) {
        setStoryData(prev => ({ ...prev, ...data.storyData }));
      }
      
      if (data.story) {
        setCurrentStory(data.story);
      }
    } catch (error) {
      console.log("Error message will be displayed here")
      console.log(error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Could you please try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-playful font-bold text-gray-800">Story Creator</h1>
              </div>
            </div>
            {storyData.childName && (
              <div className="text-sm text-purple-700 font-medium">
                Creating a story for {storyData.childName}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!currentStory ? (
          /* Chat Interface */
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white border border-purple-100 text-gray-800'
                      }`}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-purple-100 rounded-2xl p-4 text-gray-800">
                      <div className="flex space-x-1">
                        <div className="typing-indicator"></div>
                        <div className="typing-indicator"></div>
                        <div className="typing-indicator"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-purple-100 p-6">
                <div className="flex space-x-4">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border-purple-200 focus:border-purple-500 rounded-xl"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Story Display */
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Your Story is Ready!</span>
                </div>
                <h2 className="text-3xl font-playful font-bold text-gray-800 mb-2">
                  {storyData.childName}'s Adventure
                </h2>
                <p className="text-gray-600">A personalized story just for them</p>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <div className="story-text font-playful text-gray-800 leading-relaxed">
                  {currentStory.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-purple-100">
                <Button
                  onClick={() => {
                    setCurrentStory(null);
                    setMessages(prev => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        type: 'assistant',
                        content: "That was a wonderful story! Would you like to create another story or modify this one? I'm here to help! ✨",
                        timestamp: new Date()
                      }
                    ]);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-playful font-semibold rounded-xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Another Story
                </Button>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 font-playful font-semibold rounded-xl">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Save Story
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}