import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface CompleteStoryProps {
    storyData: any;
    currentStory: string | null;
    setCurrentStory: (story: string | null) => void;
    setMessages: (messages: any) => void;
}

const CompleteStory = ({ storyData, currentStory, setCurrentStory, setMessages }: CompleteStoryProps) => {
    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">Your Story is Ready!</span>
                    </div>
                    <h2 className="text-3xl font-playful font-bold text-gray-800 mb-2">
                        {storyData.childName
                            ? `${storyData.childName}'s Adventure`
                            : "Your Story"}
                    </h2>
                    <p className="text-gray-600">
                        A personalized story just for them
                    </p>
                </div>

                <div className="story-text font-playful text-gray-800 leading-relaxed prose prose-lg max-w-none">
                    <ReactMarkdown>{currentStory || ""}</ReactMarkdown>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-purple-100">
                    <Button
                    onClick={() => {
                        setCurrentStory(null);
                        setMessages((prev: any) => [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            type: "assistant",
                            content:
                            "That was a wonderful story! Would you like to create another story or modify this one? I'm here to help! ✨",
                            timestamp: new Date(),
                        },
                        ]);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-playful font-semibold rounded-xl"
                    >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Another Story
                    </Button>
                    <Button
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 font-playful font-semibold rounded-xl"
                    >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Save Story
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CompleteStory;