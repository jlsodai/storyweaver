import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

interface StoryHeaderProps {
    storyData: any;
}

const StoryHeader = ({ storyData }: StoryHeaderProps) => {
    return (
        <header className="bg-white/70 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-700 hover:bg-purple-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-playful font-bold text-gray-800">
                  Story Creator
                </h1>
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
    );
};

export default StoryHeader;
            