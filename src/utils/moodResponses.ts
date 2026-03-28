const responses: Record<string, string[]> = {
  happy: [
    "I can feel your positive energy radiating through your words! 😊 It's wonderful to see you feeling so upbeat. Your happiness is contagious!",
    "That's amazing! I love hearing about good moments like this. Your joy is absolutely beautiful - keep shining! ✨",
    "Your happiness makes my day brighter! It sounds like you're in such a wonderful headspace right now. Embrace this beautiful feeling!",
    "I'm so happy for you! 🌟 Whatever brought this joy into your life, you deserve every bit of it. Soak up this beautiful energy!"
  ],
  sad: [
    "I hear you, and I want you to know that your feelings are completely valid. 💙 It's okay to feel sad sometimes - you're being so brave by sharing this with me.",
    "Thank you for trusting me with your feelings. Remember, even the darkest nights eventually give way to dawn. You're stronger than you know. 🌙",
    "I'm here with you in this moment. Sadness is part of being human, and it shows how deeply you can feel. Be gentle with yourself today. 💝",
    "Your pain is real, and it matters. 🫂 I wish I could give you a big hug right now. Remember that this feeling will pass, and brighter days are ahead."
  ],
  anxious: [
    "I can sense the weight you're carrying, and I want you to know you're not alone. 🫂 Let's take this one breath at a time together.",
    "Your mind might be racing, but you're safe right here, right now. I believe in your strength to get through this. 💪",
    "Anxiety can feel overwhelming, but you've gotten through difficult moments before, and you'll get through this too. I'm here for you. 🌸",
    "I understand how exhausting it can be when your thoughts won't slow down. 💭 You're doing amazingly well just by reaching out and sharing this with me."
  ],
  angry: [
    "I can feel the intensity of your emotions, and that's completely okay. 🔥 Your feelings are valid, and it's important to acknowledge them.",
    "Sometimes we need to feel our anger fully before we can move through it. I'm here to listen without judgment. 💜",
    "Your frustration makes sense given what you're going through. Let's channel this energy in a way that serves you better. 🌊",
    "It's okay to be angry - it shows you care deeply about things. 💙 I'm here to help you work through these intense feelings."
  ],
  calm: [
    "There's something beautiful about the peace in your words. 🕊️ It sounds like you're in a really centered place right now.",
    "I love the tranquil energy you're sharing. These moments of calm are so precious - soak them in. 🌿",
    "Your sense of balance is really coming through. It's wonderful when we can find these pockets of serenity in our lives. ☯️",
    "The calmness in your message is so refreshing. 🌊 It's beautiful when we can find inner peace even in the midst of life's chaos."
  ],
  motivated: [
    "I can feel your determination and drive! 🚀 This energy is incredible - you're ready to take on the world!",
    "Your motivation is inspiring! When we're fired up like this, amazing things can happen. Channel this power! ⚡",
    "I love this ambitious energy you're bringing! You've got that spark that can light up any challenge ahead. 🔥",
    "This drive you have is absolutely infectious! 💪 I believe you can accomplish anything you set your mind to right now."
  ]
};

export const generateAIResponse = (mood: string, userText: string): string => {
  const moodResponses = responses[mood as keyof typeof responses] || responses.calm;
  const selectedResponse = moodResponses[Math.floor(Math.random() * moodResponses.length)];
  let personalizedAddition = "";
  const lower = userText.toLowerCase();

  if (lower.includes('work') || lower.includes('job')) {
    personalizedAddition = mood === 'anxious' ? " Work stress can be really tough - remember to take breaks when you can. 💼" : mood === 'happy' ? " It's wonderful when work brings us joy! 💼✨" : mood === 'angry' ? " Work frustrations are so valid - your feelings about this situation make complete sense. 💼" : "";
  } else if (lower.includes('family') || lower.includes('friend')) {
    personalizedAddition = mood === 'sad' ? " Relationships can be complex and sometimes painful. Your feelings are so understandable. 👥💙" : mood === 'happy' ? " There's nothing quite like the joy that comes from our loved ones! 👥💕" : "";
  } else if ((lower.includes('exam') || lower.includes('test')) && (lower.includes('failed') || lower.includes('fail'))) {
    personalizedAddition = mood === 'sad' ? " Failing an exam is so tough and your disappointment is completely understandable. This doesn't define your worth or potential. 📚💙" : mood === 'anxious' ? " Academic setbacks can feel overwhelming, but remember this is just one moment in your journey. You've got this! 📚✨" : "";
  } else if (lower.includes('exam') || lower.includes('test') || lower.includes('school')) {
    personalizedAddition = mood === 'anxious' ? " Academic pressure can feel intense - remember to breathe and take it one step at a time. 📚🌱" : mood === 'happy' ? " It's wonderful when our studies bring us joy and fulfillment! 📚✨" : "";
  }

  return selectedResponse + personalizedAddition;
};
