import { Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInterfaceProps {
    messages: any[];
    isTyping: boolean;
    inputValue: string;
    setInputValue: (value: string) => void;
    isLoading: boolean;
    threadId: string | null;
    currentStory: string | null;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLInputElement>;
}

const ChatInterface = ({
    messages,
    isTyping,
    inputValue,
    setInputValue,
    isLoading,
    threadId,
    currentStory,
    handleSendMessage,
    handleKeyPress,
    messagesEndRef,
    inputRef,
}: ChatInterfaceProps) => {
    return (
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
    );
};

export default ChatInterface;