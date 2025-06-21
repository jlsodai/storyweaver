"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Sparkles, Heart, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-playful font-bold text-gray-800">StoryWeaver</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-purple-100">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">AI-Powered Story Creation</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-playful font-bold text-gray-800 mb-6 leading-tight">
            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Magical Stories</span> 
            <br />for Your Child
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform bedtime into an adventure with personalized stories tailored to your child's interests, 
            age, and imagination. Every story is unique and crafted with love.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-playful font-semibold px-8 py-6 text-lg rounded-2xl transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <BookOpen className={`w-5 h-5 mr-2 transition-transform duration-200 ${isHovered ? 'rotate-12' : ''}`} />
                Start Creating Stories
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-playful font-semibold px-8 py-6 text-lg rounded-2xl"
            >
              <Star className="w-5 h-5 mr-2" />
              View Sample Stories
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-playful font-bold text-gray-800 mb-4">AI-Powered Magic</h3>
              <p className="text-gray-600 leading-relaxed">
                Our friendly AI assistant helps create unique stories by understanding your child's interests and preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-playful font-bold text-gray-800 mb-4">Personalized for Your Child</h3>
              <p className="text-gray-600 leading-relaxed">
                Every story is tailored to your child's age, interests, and the values you want to share.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-playful font-bold text-gray-800 mb-4">Endless Possibilities</h3>
              <p className="text-gray-600 leading-relaxed">
                From adventure tales to bedtime stories, create unlimited narratives that grow with your child.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-playful font-bold text-gray-800 mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">1</div>
              <h4 className="font-playful font-semibold text-lg text-gray-800 mb-2">Tell Us About Your Child</h4>
              <p className="text-gray-600">Share your child's name, age, and interests</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">2</div>
              <h4 className="font-playful font-semibold text-lg text-gray-800 mb-2">Choose Story Elements</h4>
              <p className="text-gray-600">Pick characters, settings, and themes together</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">3</div>
              <h4 className="font-playful font-semibold text-lg text-gray-800 mb-2">Enjoy Your Story</h4>
              <p className="text-gray-600">Read your personalized story together</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-12 bg-white/30 backdrop-blur-sm border-t border-purple-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-playful font-bold text-gray-800">StoryWeaver</span>
          </div>
          <p className="text-gray-600">Creating magical moments, one story at a time.</p>
        </div>
      </footer>
    </div>
  );
}