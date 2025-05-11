interface MoodSuggestionsProps {
  mood: string
}

export default function MoodSuggestions({ mood }: MoodSuggestionsProps) {
  const getSuggestions = () => {
    switch (mood) {
      case "😄":
        return [
          "Practice mindfulness meditation for 10 minutes",
          "Express gratitude by writing down 5 things you appreciate",
          "Compliment someone and spread positivity",
          "Try something new that excites you",
          "Spend time in nature to boost your mood further",
          "Connect with a loved one who makes you smile",
        ]
      case "😐":
        return [
          "Take a short walk outside to get some fresh air",
          "Listen to your favorite upbeat music",
          "Call or text a friend for a quick chat",
          "Take a 10-minute break to stretch or meditate",
          "Write down three things you're grateful for today",
        ]
      case "😔":
        return [
          "Practice deep breathing exercises for 5 minutes",
          "Go for a 20-minute walk or light exercise",
          "Journal about your feelings and what might be causing them",
          "Connect with a supportive friend or family member",
          "Do something creative like drawing, cooking, or playing music",
          "Consider a digital detox for a few hours",
        ]
      case "😢":
        return [
          "Be gentle with yourself - it's okay to feel this way",
          "Consider talking to a trusted friend, family member, or professional",
          "Practice self-care: take a warm shower or bath",
          "Try a guided meditation focused on self-compassion",
          "Engage in light physical activity like yoga or walking",
          "Establish a simple routine for the rest of the day",
          "Remember that feelings are temporary and will pass",
        ]
      default:
        return [
          "Keep enjoying your day!",
          "Share your positive energy with someone else",
          "Take a moment to appreciate this feeling",
        ]
    }
  }

  const suggestions = getSuggestions()

  if (mood === "🥰") {
    return (
      <div className="text-center py-4">
        <p className="text-lg text-green-600 mb-4">You're doing great! Enjoy this positive feeling.</p>
        <div className="flex justify-center">
          <span className="text-6xl animate-bounce">{mood}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-2">
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex items-start gap-2 p-2 rounded hover:bg-blue-50">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
