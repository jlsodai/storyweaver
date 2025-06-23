"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Send, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import CompleteStory from "@/components/story/complete-story";
import { Message, StoryData } from "@/lib/types";
import StoryHeader from "@/components/story/story-header";

export default function CreateStory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadIdParam = searchParams.get("thread_id");

  const [threadId, setThreadId] = useState<string | null>(threadIdParam);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm so excited to help you create a magical story for your child! ✨ To get started, could you tell me your child's name and age?",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStory, setCurrentStory] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<StoryData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // On mount, if no threadId, create one and update the route
  useEffect(() => {
    if (!threadId) {
      const createThread = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/createThread", { method: "POST" });
          const data = await res.json();
          if (data.run?.thread_id) {
            setThreadId(data.run.thread_id);
            // Update the route with thread_id as a query param
            router.replace(`/create?thread_id=${data.run.thread_id}`);
          }
        } catch (e) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "assistant",
              content:
                "Sorry, I couldn't start a new story thread. Please refresh and try again.",
              timestamp: new Date(),
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      createThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (threadId) {
      // Fetch previous messages for this thread
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/runThread`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ thread_id: threadId, get_history: true }),
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.history)) {
              setMessages(
                data.history.map((msg: any, idx: number) => ({
                  id: msg.id || String(idx + 1),
                  type: msg.type || "assistant",
                  content: msg.content,
                  timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                }))
              );
              // If the last message contains a story, show it
              const lastStory = data.history.find((msg: any) => msg.story);
              if (lastStory && lastStory.story) {
                setCurrentStory(lastStory.story);
              }
              // If the last message contains storyData, set it
              const lastStoryData = data.history.find(
                (msg: any) => msg.storyData
              );
              if (lastStoryData && lastStoryData.storyData) {
                setStoryData((prev) => ({ ...prev, ...lastStoryData.storyData }));
              }
            }
          }
        } catch (e) {
          // Ignore history fetch errors
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !threadId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Call /api/runThread with thread_id and message
      const response = await fetch("/api/runThread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          message: userMessage.content,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setIsTyping(false);

      if (data.story) {
        setCurrentStory(data.story);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.message || data.story || "Here's your story!",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.storyData) {
        setStoryData((prev) => ({ ...prev, ...data.storyData }));
      }
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Could you please try again?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <StoryHeader storyData={storyData} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!currentStory ? (
          /* Chat Interface */
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col overflow-y-auto">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div
                className="flex-1 p-6 space-y-4 overflow-y-auto"
                style={{ minHeight: 0 }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${message.type === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white border border-purple-100 text-gray-800"
                        }`}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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

              {/* Input Area fixed to bottom */}
              <div className="border-t border-purple-100 p-6 sticky bottom-0 bg-white/70 backdrop-blur-sm z-10">
                <div className="flex space-x-4">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border-purple-200 focus:border-purple-500 rounded-xl"
                    disabled={isLoading || !!currentStory || !threadId}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !inputValue.trim() ||
                      isLoading ||
                      !!currentStory ||
                      !threadId
                    }
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
          <CompleteStory storyData={storyData} currentStory={currentStory} setCurrentStory={setCurrentStory} setMessages={setMessages} />
        )}
      </div>
    </div>
  );
}
