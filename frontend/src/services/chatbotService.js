import api from './api';

// Fallback response if network or server is unreachable
const getLocalFallbackResponse = (message) => {
  const lower = (message || '').toLowerCase();
  if (lower.includes('toxic') || lower.includes('chocolate') || lower.includes('grapes') || lower.includes('zehar')) {
    return {
      reply: `⚠️ **Urgent Dog Food Safety:**\n\nChocolate, Grapes/Raisins, Onions, Garlic, Xylitol (sugar-free items), and cooked bones are **EXTREMELY TOXIC** for dogs! If ingested, contact an emergency vet clinic immediately.`,
      suggestions: ['Safe Human Foods', 'Puppy Vaccine Schedule', 'Woffy Features'],
    };
  }
  if (lower.includes('vaccin') || lower.includes('rabies') || lower.includes('tika')) {
    return {
      reply: `💉 **Vaccine Overview:**\nPuppies require core vaccinations (DHPP + Rabies) at 6-8 weeks, 10-12 weeks, and 14-16 weeks, followed by annual boosters. Check your pet's digital records in Woffy Vaccine Passport!`,
      suggestions: ['View Vaccine Passport', 'Daily Health Records', 'Diet Tips'],
      actionLink: { label: 'Go to Vaccine Passport', url: '/vaccinations' },
    };
  }
  return {
    reply: `Woof! 🐶 I am **Jimmy**, your Woffy Dog Care Assistant! How can I assist you with your furry friend today? Ask me about dog diet, vaccinations, puppy training, or smart QR tags!`,
    suggestions: ['Dog Diet Tips', 'Puppy Vaccine Schedule', 'Smart QR Collar Tags', 'Emergency First Aid'],
  };
};

export const chatbotService = {
  async sendMessage(message, { petId = null, history = [] } = {}) {
    try {
      const response = await api.post('/api/chat/message', {
        message,
        petId,
        history,
      });
      if (response.data && response.data.reply) {
        return response.data;
      }
      return getLocalFallbackResponse(message);
    } catch (err) {
      console.warn('Backend chat API failed, using fallback:', err.message);
      return getLocalFallbackResponse(message);
    }
  },

  async getSuggestions() {
    try {
      const response = await api.get('/api/chat/suggestions');
      if (response.data && response.data.suggestions) {
        return response.data;
      }
    } catch (err) {
      console.warn('Could not load dynamic suggestions, using defaults');
    }

    return {
      suggestions: [
        { label: '🍖 Safe & Toxic Foods', query: 'What foods are toxic to dogs and what is safe?' },
        { label: '💉 Vaccine Schedule', query: 'Puppy vaccination schedule guide' },
        { label: '🏷️ Smart QR Pet Tag', query: 'How does the Woffy Smart QR Pet Tag work?' },
        { label: '🚨 Emergency First Aid', query: 'Dog emergency first aid tips' },
        { label: '🩺 Dog Not Eating Food', query: 'Mera kutta khana nahi kha raha, kya karu?' },
        { label: '🚽 Puppy Potty Training', query: 'How to potty train a puppy?' },
      ],
      welcomeMessage: {
        botName: 'Jimmy 🐾',
        title: "Hey! I'm Jimmy, your Woffy Dog Care Assistant!",
        subtitle: 'Ask me anything about dog nutrition, health, training, vaccines, or Woffy tools.',
      },
    };
  },

  async getUserPets() {
    try {
      const response = await api.get('/api/chat/pets');
      if (response.data && Array.isArray(response.data.pets)) {
        return response.data.pets;
      }
    } catch (err) {
      // Ignore if not logged in
    }
    return [];
  },
};

export default chatbotService;
