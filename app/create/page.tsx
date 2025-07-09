"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CompleteStory from "@/components/story/complete-story";
import { Message, StoryData } from "@/lib/types";
import StoryHeader from "@/components/story/story-header";
import ChatInterface from "@/components/story/chat-interface";

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
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            threadId={threadId}
            currentStory={currentStory}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
          />
        ) : (
          /* Story Display */
          <CompleteStory storyData={storyData} currentStory={currentStory} setCurrentStory={setCurrentStory} setMessages={setMessages} />
        )}
      </div>
    </div>
  );
}
