import CompleteStory from "@/components/story/complete-story";

export default function DisplayStory({ storyData, currentStory, setCurrentStory, setMessages }: any) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <CompleteStory storyData={storyData} currentStory={currentStory} setCurrentStory={setCurrentStory} setMessages={setMessages} />
        </div>
    );
}
