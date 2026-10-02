/**
 * Chatbot Controller for Jimmy AI Assistant
 * RAG Architecture: Account Retrieval + Platform DB Retrieval + Generative AI
 */

const { generateJimmyResponseWithRag } = require("../Services/jimmyAiService");
const {
  retrieveUserAccountContext,
  retrievePlatformContext,
  buildRagPrompt,
} = require("../Services/ragRetrieverService");
const Pet = require("../Models/Pet");

exports.sendMessage = async (req, res) => {
  try {
    const { message, petId, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // 1. RAG Retrieval Phase: Parallel fetch of User Account & Platform entities
    const [accountContext, platformContext] = await Promise.all([
      retrieveUserAccountContext(req.userId, petId),
      retrievePlatformContext(message),
    ]);

    // 2. RAG Augmentation Phase: Compose contextualized prompt
    const ragPrompt = buildRagPrompt(message, accountContext, platformContext);

    // 3. RAG Generation Phase: AI synthesis (Gemini LLM / Grounded Synthesizer)
    const aiResult = await generateJimmyResponseWithRag(message, history, {
      accountContext,
      platformContext,
      ragPrompt,
    });

    return res.status(200).json({
      success: true,
      botName: "Jimmy 🐾",
      reply: aiResult.reply,
      suggestions: aiResult.suggestions || [
        "My Registered Pets",
        "Puppy Vaccine Schedule",
        "Dog Diet Tips",
        "Woffy Features",
      ],
      actionLink: aiResult.actionLink || null,
      timestamp: new Date().toISOString(),
      ragMeta: {
        isAccountGrounded: Boolean(accountContext.isAuthenticated),
        petsRetrieved: accountContext.pets?.length || 0,
        productsRetrieved: platformContext.retrievedData?.products?.length || 0,
        hospitalsRetrieved: platformContext.retrievedData?.hospitals?.length || 0,
        rescuesRetrieved: platformContext.retrievedData?.rescues?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error in chatbot sendMessage (RAG):", error);
    return res.status(500).json({
      success: false,
      botName: "Jimmy 🐾",
      reply:
        "Woof! Mere server me thodi dikkat aa gayi hai. Please ek baar dubara poochiye! 🐶",
      suggestions: ["My Registered Pets", "Vaccine Schedule", "Emergency First Aid"],
    });
  }
};

exports.getSuggestions = async (req, res) => {
  let suggestions = [
    { label: "🐶 My Registered Pets", query: "Mere registered pets aur unki details batao" },
    { label: "💉 Vaccine Schedule", query: "Puppy vaccination schedule aur due vaccines" },
    { label: "🍖 Safe & Toxic Foods", query: "What foods are toxic to dogs and what is safe?" },
    { label: "🛍️ Woffy Pet Shop", query: "Woffy shop me dog food aur essentials kya available hain?" },
    { label: "🏷️ Smart QR Pet Collar Tag", query: "How does the Woffy Smart QR Pet Tag work?" },
    { label: "🚨 Emergency Rescue & Vets", query: "Emergency animal rescue aur vet hospital helplines" },
  ];

  let petName = "";
  if (req.userId) {
    try {
      const pet = await Pet.findOne({ user: req.userId }).select("petName");
      if (pet) {
        petName = pet.petName;
        suggestions.unshift({
          label: `🩺 ${petName}'s Health Status`,
          query: `${petName} ki health records aur vaccine status batao`,
        });
      }
    } catch {
      // ignore
    }
  }

  return res.status(200).json({
    success: true,
    suggestions,
    welcomeMessage: {
      botName: "Jimmy 🐾",
      title: petName
        ? `Hey! I'm Jimmy! How is ${petName} doing today?`
        : "Hey! I'm Jimmy, your Woffy AI Pet Care Assistant!",
      subtitle:
        "Powered by Woffy RAG: I have live access to your pets, vaccines, health records, shop items, and rescue helplines!",
    },
  });
};

exports.getUserPetsForChat = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(200).json({ success: true, pets: [] });
    }
    const pets = await Pet.find({ user: req.userId }).select(
      "_id petName breed age weight photo photoUrl species isLost collarId",
    );
    return res.status(200).json({ success: true, pets });
  } catch (error) {
    return res.status(200).json({ success: true, pets: [] });
  }
};
