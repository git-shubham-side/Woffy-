/**
 * Jimmy AI Pet Care Service (RAG Powered)
 * Intelligent AI Assistant for Woffy Pet Care Platform
 * Grounded in:
 * 1. User Account Data (Profile, Pets, Vaccinations, Health Records)
 * 2. Woffy Platform Data (Shop Products, Rescue Shelters, Vet Hospitals, Navigation)
 * 3. Clinical Veterinary Knowledge Base
 * 4. Google Gemini LLM Generation (with full Augmented Context)
 */

const { PLATFORM_ROUTES_MAP } = require("./ragRetrieverService");

// Comprehensive built-in Dog Care & Veterinary Knowledge Base
const KNOWLEDGE_BASE = [
  {
    category: "greetings",
    keywords: ["hi", "hello", "hey", "namaste", "kem cho", "salam", "sup", "yo", "morning", "evening", "afternoon", "kaise ho", "kya haal"],
    response: (petName, isHindi, user) => {
      const greetingUser = user?.fullName ? ` ${user.fullName.split(' ')[0]}` : '';
      if (isHindi) {
        return `नमस्ते${greetingUser}! 🐶🐾 मैं हूँ **Jimmy**, Woffy का आपका AI पेट केयर साथी!

${petName ? `आज **${petName}** कैसा है? कोई परेशानी है या रूटीन चेकअप चाहिए?` : "आज मैं आपके और आपके डॉग के लिए क्या कर सकता हूँ?"}

आप मुझसे **डाइट, वैक्सीनेशन, ट्रेनिंग, शॉप प्रोडक्ट्स, शेल्टर्स या अपने पेट के रिकॉर्ड्स** के बारे में कुछ भी पूछ सकते हैं!`;
      }
      return `Woof! Hello${greetingUser}! 🐶🐾 I'm **Jimmy**, your Woffy Pet Care AI Assistant!

${petName ? `How is **${petName}** doing today? Need advice or a quick health record check?` : "How can I assist you and your furry friend today?"}

Feel free to ask me about **dog diet, vaccines, training, shop essentials, rescue helplines, or your pet's records**!`;
    },
    suggestions: ["My Registered Pets", "Vaccine Schedule", "Dog Diet Tips", "Emergency Helplines"],
  },
  {
    category: "identity",
    keywords: ["who are you", "who made you", "who created you", "who is jimmy", "tum kaun ho", "tera naam", "aap kaun ho", "kisne banaya"],
    response: () => {
      return `Main hoon **Jimmy**! 🐾 

Woffy Dog Care Platform ka resident AI companion, jise **Shubham Rathod (Jimmy)** ne pet parents aur unke pyaare dogs ki help ke liye banaya hai! ❤️

Mere paas canine health, nutrition, emergency first-aid ke saath-saath **Woffy platform ke live database (aapke pets, vaccines, health records, shop products aur rescue helplines)** ka poora live access hai! 🐶`;
    },
    suggestions: ["My Registered Pets", "What can you do?", "How QR Tags Work"],
  },
  {
    category: "toxic_food",
    keywords: ["toxic", "poison", "harmful", "chocolate", "grapes", "onion", "garlic", "xylitol", "kya nahi khana", "kya nahi dena", "zehar", "danger food", "unsafe"],
    response: () => {
      return `⚠️ **Dogs ke liye TOXIC & DANGEROUS Foods (Inhe kabhi na dein!):**

1. 🍫 **Chocolate & Cocoa:** Theobromine hota hai jo dogs ke heart aur nervous system ke liye deadly hai.
2. 🍇 **Grapes & Raisins (Kishmish):** Thodi si quantity bhi acute kidney failure kar sakti hai.
3. 🧅 **Onions & Garlic (Pyaz aur Lehsun):** Red blood cells ko destroy karte hain (Anemia ka risk).
4. 🍬 **Xylitol (Sugar-free gum & peanut butter):** Sudden drop in blood sugar & liver failure.
5. ☕ **Caffeine & Tea/Coffee:** Rapid heart rate aur seizures cause karta hai.
6. 🥑 **Avocado:** Persin toxin hota hai jo upset stomach cause karta hai.
7. 🦴 **Cooked Bones (Paki hui haddiya):** Cook hone par splinter ban jati hain jo gale ya pet me fas sakti hain. Always avoid cooked bones!
8. 🍺 **Alcohol & Raw Dough:** Severe toxicity and bloating.

🚨 *Agar aapke dog ne inme se kuch kha liya hai, toh bina deri kiye turant veterinary emergency clinic le jayein!*`;
    },
    suggestions: ["Safe Human Foods", "Dog Vomiting Help", "Find Emergency Vet"],
    actionLink: { label: "Emergency Shelters & Help", url: "/services/rescue" }
  },
  {
    category: "safe_food",
    keywords: ["safe food", "what can dog eat", "kya khilaye", "kya de sakte", "human food", "fruit", "vegetable", "rice", "apple", "curd", "dahi"],
    response: () => {
      return `🥦 🍎 **Dogs ke liye SAFE & HEALTHY Human Foods:**

1. 🍗 **Boiled Chicken (Without spices/salt/onions):** Great source of lean protein!
2. 🍚 **Plain Boiled White Rice:** Excellent for upset stomach and easy digestion.
3. 🍎 **Apples (Without seeds & core):** Rich in Vitamins A & C, fiber. (Seeds me cyanide hota hai, so remove them).
4. 🥕 **Carrots (Gajar):** Great low-calorie snack, cleans teeth while chewing.
5. 🥣 **Plain Curd / Dahi (Unsweetened):** Natural probiotic jo gut health ke liye bohot accha hai.
6. 🎃 **Pumpkin (Kaddu - boiled/pureed):** Digestion aur loose motions / constipation dono me magic kaam karta hai.
7. 🥜 **Peanut Butter (100% Xylitol-free):** Great protein treat in moderation.
8. 🍉 **Watermelon (Seeds & rind removed):** Hydrating and sweet summer treat!

💡 *Tip: Hamesha koi bhi naya food thodi quantity me introduce karein.*`;
    },
    suggestions: ["Dog Not Eating Food", "Puppy Feeding Schedule", "Pet Shop Essentials"],
    actionLink: { label: "Browse Pet Food in Shop", url: "/shop" }
  },
  {
    category: "not_eating",
    keywords: ["not eating", "khana nahi", "bhuk nahi", "loss of appetite", "food refuse", "refusing food", "kuch nahi kha raha"],
    response: (petName) => {
      return `🩺 **Agar Dog Khana Nahi Kha Raha (Loss of Appetite):**

${petName ? `Agar **${petName}** ne khana refuse kiya hai:` : 'Possible Reasons:'}
• Pet upset ya gas / indigestion
• Teething ya dental/gum pain
• Food boredom (ek hi kibble se bore hona)
• Routine change ya stress/separation anxiety
• Mild fever ya underlying infection

✅ **Aap kya kar sakte hain:**
1. **Bland Diet Try Karein:** Warm boiled chicken broth with plain boiled rice aur thoda sa dahi.
2. **Kibble Warm Karein:** Dog food me thoda sa gunguna paani ya chicken soup milayein, aroma se khane ka mann karta hai.
3. **Water Intake Check Karein:** Dekhein ki paani properly pee raha hai ya nahi.

🚨 **Vet Warning Signs (Turant Doctor Ko Dikhayein):**
Agar 24 hours se zyada khana chhod diya ho, saath me ulti (vomiting), loose motion, lethargy (sust hona), ya fever ho, toh bina wait kiye vet ko dikhayein!`;
    },
    suggestions: ["Safe Foods For Dogs", "Vomiting Home Remedy", "Log Health Record"],
    actionLink: { label: "Log Symptoms in Records", url: "/records" }
  },
  {
    category: "vomiting_diarrhea",
    keywords: ["vomit", "vomiting", "ulti", "loose motion", "diarrhea", "potty", "pet kharab", "dast", "stomach upset", "puke"],
    response: () => {
      return `🚨 **Dog Vomiting ya Loose Motion hone par First-Aid:**

1. 💧 **Hydration Sabse Zaroori:** Dehydration se bachayein. Electral (ORS) ya thoda glucose water spoon/syringe se har 30 min me thoda-thoda dein.
2. 🍽️ **Rest the Stomach (Short Fast):** Adult dogs ke liye 6-8 ghante food pause karein taaki pet ko aaram mile. (Puppies ke liye 3-4 hours se zyada fast na karein).
3. 🥣 **Bland Diet:** Fasting ke baad boiled rice + chicken soup ya boiled pumpkin puree thodi quantity me dein.
4. 🚫 **No Milk & No Oily Food:** Dudh aur oily khana loose motion ko aur kharab kar deta hai.

⚠️ **RED FLAGS (Immediate Vet Visit Needed!):**
• Vomit ya stool me blood (khoon) aana
• Parvovirus signs (pungent smell loose motion + lethargy in unvaccinated puppy)
• Continuous vomiting (paani peete hi nikal dena)
• Extremely pale gums ya excessive weakness

Woffy me aap daily tracking me stool aur symptoms record kar sakte hain taaki vet ko dikha sakein!`;
    },
    suggestions: ["Track Symptoms Now", "Puppy Vaccine Schedule", "Find Emergency Vet"],
    actionLink: { label: "Open Health Records", url: "/records" }
  },
  {
    category: "training_potty",
    keywords: ["potty", "training", "train", "susu", "toilet", "house train", "poop", "carpet", "ghar me potty"],
    response: () => {
      return `🐾 🚽 **Puppy Potty Training - 5 Golden Steps:**

1. ⏰ **Fixed Schedule Banayein:**
   Puppy ko in 4 times par hamesha bahar le jayein:
   • Subah uthte hi
   • Har meal ke 15-20 minutes baad
   • Napping ke turant baad
   • Raat ko sone se pehle

2. 🎯 **Designated Spot (Ek Hi Jagah):**
   Hamesha ek hi specific spot par le jayein. Uski smell se use pata chalega ki yahan toilet karna hai.

3. 🎉 **Instant Praise & Treats (Positive Reinforcement):**
   Jaise hi wo correct jagah potty kare, **turant treat dein aur "Good boy/girl!" bolein**. 5 second ke andar reward karein!

4. 🚫 **Kabhi Chillaayein Ya Marein Nahi:**
   Ghar me galti se potty karne par gussa na karein. Neutral hokar jagah ko enzyme cleaner se saaf karein.

5. 👁️ **Signs Pe Dhyan Dein:**
   Zameen sungna (sniffing), gol-gol ghoomna (circling), ya bechain hona potty ke signs hain!`;
    },
    suggestions: ["Biting & Chewing Help", "Daily Walk Routine", "Dog Nutrition Tips"]
  },
  {
    category: "biting_chewing",
    keywords: ["bite", "biting", "chew", "chewing", "teething", "chaba raha", "katna", "daant", "teeth"],
    response: () => {
      return `🦷 🐶 **Puppy Biting & Chewing Problem Kaise Solve Karein:**

Puppies 3 se 7 mahine tak teething karte hain, unke masudo me khujli aur dard hota hai, isliye wo sab kuch chabate hain!

✅ **Quick Solutions:**
1. **Redirection Method (Sabse Effective):**
   Jab bhi puppy aapka haath ya furniture kaate, turant unhe chew toy ya rubber bone de dein.
2. **The "Ouch!" Technique:**
   Agar wo haath par daant lagaye, toh unchi awaaz me "OUCH!" bolein aur 10 seconds ke liye dhyan hata lein.
3. **Frozen Carrot Treat:**
   Thandi freeze ki hui gajar ya wet towel frozen chew toy dein - yeh inflamed gums ko bohot sukoon deta hai!
4. **Physical & Mental Exercise:**
   Tired dog is a good dog! 20-30 min walk aur puzzle toys se energy channelize karein.`;
    },
    suggestions: ["Puppy Potty Training", "Safe Dog Toys in Shop", "Exercise Routine"],
    actionLink: { label: "Check Dog Toys in Shop", url: "/shop" }
  },
  {
    category: "heatstroke",
    keywords: ["heat", "garmi", "heatstroke", "panting", "hafna", "summer", "sun", "hot"],
    response: () => {
      return `☀️ 🌡️ **Dog Heatstroke (Summer Emergency Alert):**

Dogs ko insano ki tarah sweat nahi aata, wo sirf haafkar (panting) aur paw pads se body cool karte hain!

⚠️ **Heatstroke Signs:**
• Boos-speed se tez haafna (excessive heavy panting)
• Dark red ya purple tongue/gums
• Drooling (laar tapakna) aur chakkar aana / weakness

🚨 **Instant First Aid Steps:**
1. Dog ko turant AC ya shade wale thande kamre me layein.
2. **Room-temperature paani** paws, pet aur neck par daalein ya wet towel rakhein. *(Kabhi bhi direct ICE WATER na daalein, isse shock lag sakta hai!)*
3. Paani peene ke liye dein par force na karein.
4. Fan on karein aur turant vet clinic le jayein.`;
    },
    suggestions: ["Safe Foods For Summer", "Emergency Vet Helpline", "Daily Health Tracking"]
  },
];

/**
 * Check if the message is Hindi / Hinglish
 */
function isHindiQuery(text) {
  const hindiKeywords = [
    "kya", "kaise", "hai", "kutta", "kutte", "doggy", "khana", "nahi", "peena", "ulti", 
    "chahiye", "batao", "karo", "naam", "kon", "kaun", "kaha", "kahan", "paani", "doodh",
    "gaya", "ho", "raha", "rahi", "hoga", "mujhe", "mera", "meri", "mere", "dard", "bukhar",
    "khujli", "saaman", "kitna", "kitne", "paisa", "tika", "kab"
  ];
  const lower = text.toLowerCase();
  return hindiKeywords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));
}

/**
 * RAG Semantic Grounded Synthesizer
 * Uses real retrieved account data & platform database to construct exact answers
 */
function synthesizeRagResponse(query, accountContext, platformContext, isHindi) {
  const clean = query.toLowerCase().trim();
  const pets = accountContext.pets || [];
  const selectedPet = accountContext.selectedPet || (pets.length > 0 ? pets[0] : null);
  const vaccines = accountContext.vaccinations || [];
  const records = accountContext.records || [];
  const { products, hospitals, rescues } = platformContext.retrievedData;

  // 1. Account / My Pets Query
  const petListKeywords = ["my pet", "mere pet", "mera kutta", "mera dog", "mera pet", "kitne pet", "pet list", "show my dog", "who is my pet", "mera pet kaun"];
  if (petListKeywords.some(kw => clean.includes(kw))) {
    if (!accountContext.isAuthenticated) {
      return {
        reply: isHindi
          ? `Aap abhi **guest user** ke roop mein browse kar rahe hain. Apne pets aur records dekhne ke liye please [Login karein](/login) ya [Sign Up karein](/signup)! 🐾`
          : `You are currently browsing as a guest. Please [Login](/login) or [Sign Up](/signup) to view and manage your registered pets and records! 🐾`,
        suggestions: ["Login", "Sign Up Free", "Safe Human Foods", "Puppy Vaccine Schedule"],
        actionLink: { label: "Login to Account", url: "/login" }
      };
    }

    if (pets.length === 0) {
      return {
        reply: isHindi
          ? `Aapke account (**${accountContext.user?.fullName}**) mein abhi koi pet register nahi hai! 🐶\n\nAap abhi [Add New Pet Profile](/create-pet-profile) par jaakar apne dog ki photo, breed, age aur emergency collar tag generate kar sakte hain.`
          : `You don't have any pets registered in your account (**${accountContext.user?.fullName}**) yet! 🐶\n\nClick below to register your dog, generate a smart collar tag, and track health records!`,
        suggestions: ["Add New Pet", "How QR Tags Work", "Browse Pet Shop"],
        actionLink: { label: "Add Your Pet Now", url: "/create-pet-profile" }
      };
    }

    let text = isHindi
      ? `Aapke account mein **${pets.length} pet(s)** registered hain: 🐶\n\n`
      : `Here are the **${pets.length} pet(s)** registered in your Woffy account: 🐶\n\n`;

    pets.forEach((p, i) => {
      text += `**${i + 1}. ${p.petName}** (${p.species || 'Dog'} - ${p.breed || 'Unknown Breed'})\n`;
      text += `• **Age:** ${p.age || 'N/A'} yrs | **Weight:** ${p.weight || 'N/A'} kg | **Gender:** ${p.gender || 'Unknown'}\n`;
      text += `• **Vaccinated:** ${p.vaccinated || 'Yes'}\n`;
      if (p.allergies && p.allergies !== 'None') text += `• **Allergies:** ${p.allergies}\n`;
      if (p.collarId) text += `• **Smart QR Collar Tag:** \`${p.collarId}\`\n`;
      if (p.isLost) text += `• 🚨 **ALERT:** Marked as LOST! (Reward: ${p.rewardAmount || 'N/A'})\n`;
      text += `\n`;
    });

    return {
      reply: text,
      suggestions: ["Check Vaccine Status", "View Health Records", "Print Smart Collar Tag"],
      actionLink: { label: "View All Pet Profiles", url: "/pet-profiles" }
    };
  }

  // 2. Specific Pet Attributes (Weight, Age, Breed, Allergies)
  const isWeightQuery = clean.includes("weight") || clean.includes("vajan") || clean.includes("kilo");
  const isAgeQuery = clean.includes("age") || clean.includes("umar") || clean.includes("saal") || clean.includes("kitne saal");
  const isAllergyQuery = clean.includes("allergy") || clean.includes("allergies");

  if ((isWeightQuery || isAgeQuery || isAllergyQuery) && selectedPet) {
    let reply = `🩺 **${selectedPet.petName}** (${selectedPet.breed || 'Dog'}) ki details:\n\n`;
    if (isWeightQuery) reply += `• **Current Weight:** **${selectedPet.weight || 'Not recorded'} kg**\n`;
    if (isAgeQuery) reply += `• **Age:** **${selectedPet.age || 'Not recorded'} years old**\n`;
    if (isAllergyQuery) reply += `• **Allergies:** **${selectedPet.allergies || 'None recorded'}**\n`;
    reply += `• **Vaccination Status:** ${selectedPet.vaccinated || 'Yes'}\n`;
    reply += `\nAap Woffy ke **Daily Health Records** mein regular weight aur checkup log kar sakte hain!`;

    return {
      reply,
      suggestions: ["View Health Records", "Check Vaccines", "Diet Advice for " + selectedPet.petName],
      actionLink: { label: "Open Health Records", url: "/records" }
    };
  }

  // 3. Vaccinations Query (User Account Vaccine Records)
  const isVaccineQuery = clean.includes("vaccin") || clean.includes("tika") || clean.includes("rabies") || clean.includes("dhpp") || clean.includes("booster");
  const isUserVaccineCheck = isVaccineQuery && (clean.includes("mera") || clean.includes("meri") || clean.includes("due") || clean.includes("kab") || clean.includes("pending") || clean.includes("status") || clean.includes("schedule"));

  if (isUserVaccineCheck && accountContext.isAuthenticated) {
    if (vaccines.length === 0) {
      return {
        reply: isHindi
          ? `Aapke registered pets ke liye abhi koi specific vaccine schedule log nahi hai.\n\nAap **Vaccine Passport** section mein jakar auto-generated schedule generate kar sakte hain ya custom vaccine entry add kar sakte hain! 💉`
          : `No specific vaccination schedules are currently logged for your pets.\n\nYou can head to the **Vaccine Passport** to generate an automated puppy vaccine schedule or log new vaccines! 💉`,
        suggestions: ["Open Vaccine Passport", "Puppy Vaccine Timeline", "Log Health Record"],
        actionLink: { label: "Go to Vaccine Passport", url: "/vaccinations" }
      };
    }

    let reply = `💉 **Aapke Pets Ka Vaccination Schedule (Live Database):**\n\n`;
    vaccines.forEach((v) => {
      const petName = v.pet?.petName || selectedPet?.petName || 'Pet';
      const formattedDate = v.dueDate ? new Date(v.dueDate).toLocaleDateString('en-GB') : 'N/A';
      const statusIcon = v.status === 'Completed' ? '✅' : v.status === 'Overdue' ? '🚨' : '⏰';
      reply += `${statusIcon} **${v.vaccineName}** for **${petName}**\n`;
      reply += `   • Status: **${v.status}** | Due Date: ${formattedDate} (${v.category})\n`;
    });

    reply += `\n📄 Aap Woffy se verified **Digital Vaccine Passport** bhi download kar sakte hain travel ya clinic visit ke liye!`;

    return {
      reply,
      suggestions: ["Open Vaccine Passport", "Deworming Guide", "Find Vet Clinic"],
      actionLink: { label: "Manage Vaccine Passport", url: "/vaccinations" }
    };
  }

  // 4. Health Records & History
  const isRecordQuery = clean.includes("record") || clean.includes("history") || clean.includes("last walk") || clean.includes("last bath") || clean.includes("pichla");
  if (isRecordQuery && accountContext.isAuthenticated) {
    if (records.length === 0) {
      return {
        reply: isHindi
          ? `Aapke account mein abhi koi daily health record log nahi kiya gaya hai.\n\nAap **Health Tracking** mein jakar weight, medication, vet history aur grooming logs note kar sakte hain! 📊`
          : `No daily health logs found yet in your account.\n\nYou can log weight entries, medications, vet visits, and grooming activities in the **Health Tracking** section! 📊`,
        suggestions: ["Log Health Record", "Check Pet Profiles", "Vaccine Passport"],
        actionLink: { label: "Open Health Records", url: "/records" }
      };
    }

    let reply = `📋 **Recent Health & Activity Records:**\n\n`;
    records.slice(0, 5).forEach((r) => {
      const petName = r.pet?.petName || 'Pet';
      const formattedDate = r.date ? new Date(r.date).toLocaleDateString('en-GB') : '';
      reply += `• **[${r.activityType.toUpperCase()}]** ${r.title} (${petName}) - *${formattedDate}*\n`;
      if (r.notes) reply += `   *Note:* ${r.notes}\n`;
    });

    return {
      reply,
      suggestions: ["Log New Record", "Check Weight History", "Vaccine Status"],
      actionLink: { label: "View All Records", url: "/records" }
    };
  }

  // 5. Smart Collar Tag & Lost Pet Query
  const isTagOrLostQuery = clean.includes("collar") || clean.includes("qr") || clean.includes("tag") || clean.includes("lost") || clean.includes("kho gaya") || clean.includes("gum gaya") || clean.includes("print");
  if (isTagOrLostQuery && selectedPet) {
    return {
      reply: `🏷️ **Smart QR Collar Tag for ${selectedPet.petName}:**

• **Collar Tag ID:** \`${selectedPet.collarId || 'Available on profile'}\`
• **Current Status:** ${selectedPet.isLost ? '🚨 **MARKED AS LOST!** Finder alerts active.' : '✅ Safe at home'}

**Woffy Smart Tag Features:**
1. **Printable Tag:** Collar ke liye printable sheet aur wallet emergency card download karein.
2. **Instant QR Scan:** Koi bhi person camera se scan karega toh aapka phone number aur dog ki medical alerts dikhenge.
3. **1-Click Lost Alert Switch:** Dashboard ya Pet Profile se kabhi bhi Lost status on/off karein.`,
      suggestions: ["Print Collar Tag", "Edit Emergency Contact", "My Pets"],
      actionLink: { label: `Print ${selectedPet.petName}'s Tag`, url: `/pet-profiles` }
    };
  }

  // 6. Shop Products Query (Grounded in Product Database)
  const isShopQuery = ["shop", "buy", "product", "food", "kibble", "toy", "leash", "shampoo", "treat", "price", "kharid", "saaman", "collar"].some(kw => clean.includes(kw));
  if (isShopQuery && products && products.length > 0) {
    let reply = `🛍️ **Woffy Pet Shop - Curated Essentials & Best Sellers:**\n\n`;
    products.forEach((p) => {
      reply += `• **${p.name}** (${p.category})\n`;
      reply += `   Brand: *${p.brandName || 'Woffy Essentials'}* | Price: **₹${p.price}** ${p.discountPercent > 0 ? `(${p.discountPercent}% OFF)` : ''} | ⭐ ${p.rating}\n`;
      if (p.description) reply += `   _${p.description.substring(0, 80)}..._\n`;
    });
    reply += `\nAap shop page par jakar filter aur order kar sakte hain!`;

    return {
      reply,
      suggestions: ["Browse Pet Shop", "Dog Diet Tips", "Safe Human Foods"],
      actionLink: { label: "Visit Woffy Pet Shop", url: "/shop" }
    };
  }

  // 7. Vet Hospitals Query (Grounded in Hospital Database)
  const isHospitalQuery = ["hospital", "clinic", "doctor", "vet", "ill", "emergency clinic", "doctor ko dikhana", "opd"].some(kw => clean.includes(kw));
  if (isHospitalQuery && hospitals && hospitals.length > 0) {
    let reply = `🏥 **Approved Veterinary Hospitals & Clinics (Database):**\n\n`;
    hospitals.forEach((h) => {
      reply += `• **${h.name}** (${h.city})\n`;
      reply += `   📞 Phone: **${h.phone}** ${h.emergencyPhone ? `| Emergency: **${h.emergencyPhone}**` : ''}\n`;
      reply += `   ⏰ 24x7 Emergency: **${h.is24x7 ? 'YES' : 'Standard Hours'}** | ⭐ ${h.rating}\n`;
      reply += `   📍 Address: ${h.address}\n\n`;
    });

    return {
      reply,
      suggestions: ["Emergency First Aid", "Rescue Helplines", "Call Hospital"],
      actionLink: { label: "Find Rescue & Helplines", url: "/services/rescue" }
    };
  }

  // 8. Rescue & Shelter Query (Grounded in Rescue Database)
  const isRescueQuery = ["rescue", "shelter", "ngo", "ambulance", "stray", "injured", "sadak", "madad", "helpline"].some(kw => clean.includes(kw));
  if (isRescueQuery && rescues && rescues.length > 0) {
    let reply = `🚑 🐕 **Animal Rescue Services & Shelters Directory:**\n\n`;
    rescues.forEach((r) => {
      reply += `• **${r.name}** (${r.orgType} - ${r.city})\n`;
      reply += `   🚨 Helpline: **${r.emergencyHelpline || r.phone}** | 24x7: **${r.is24x7 ? 'YES' : 'No'}**\n`;
      reply += `   📍 Address: ${r.address}\n`;
      reply += `   🛠️ Services: ${r.services?.join(', ') || 'Rescue & First Aid'}\n\n`;
    });

    return {
      reply,
      suggestions: ["Emergency First Aid", "Find Vet Clinic", "Report Stray Dog"],
      actionLink: { label: "Open Rescue Directory", url: "/services/rescue" }
    };
  }

  return null;
}

/**
 * Call Google Gemini LLM with complete RAG Augmented Prompt
 */
async function callGeminiRagApi(ragPrompt, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const contents = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content || '' }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: ragPrompt }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 750,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Gemini RAG API non-200 response:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (replyText) {
      return {
        reply: replyText,
        suggestions: ["My Registered Pets", "Vaccine Schedule", "Dog Diet Tips", "Woffy Features"]
      };
    }
  } catch (err) {
    console.warn("Gemini RAG API error, falling back to Grounded Synthesizer:", err.message);
  }

  return null;
}

/**
 * Main RAG Generation Pipeline for Jimmy AI
 */
async function generateJimmyResponseWithRag(message, history = [], ragContext = {}) {
  if (!message || typeof message !== 'string') {
    return {
      reply: "Woof! 🐶 I didn't quite catch that. How can I help you and your dog today?",
      suggestions: ["My Registered Pets", "Vaccine Schedule", "Dog Diet Tips"]
    };
  }

  const cleanMessage = message.trim();
  const isHindi = isHindiQuery(cleanMessage);
  const accountContext = ragContext.accountContext || { pets: [] };
  const platformContext = ragContext.platformContext || { retrievedData: {} };
  const ragPrompt = ragContext.ragPrompt || cleanMessage;

  // 1. If Gemini API Key is available, invoke Gemini with the RAG Augmented Prompt
  if (process.env.GEMINI_API_KEY) {
    const geminiResult = await callGeminiRagApi(ragPrompt, history);
    if (geminiResult) {
      // Dynamic suggestions & action link assignment
      if (cleanMessage.toLowerCase().includes("vaccin")) {
        geminiResult.actionLink = { label: "Go to Vaccine Passport", url: "/vaccinations" };
      } else if (cleanMessage.toLowerCase().includes("shop") || cleanMessage.toLowerCase().includes("food")) {
        geminiResult.actionLink = { label: "Visit Pet Shop", url: "/shop" };
      } else if (cleanMessage.toLowerCase().includes("rescue") || cleanMessage.toLowerCase().includes("hospital")) {
        geminiResult.actionLink = { label: "Rescue Directory", url: "/services/rescue" };
      }
      return geminiResult;
    }
  }

  // 2. RAG Semantic Grounded Synthesizer (Exact Database Retrieval)
  const ragSynthesized = synthesizeRagResponse(cleanMessage, accountContext, platformContext, isHindi);
  if (ragSynthesized) {
    return ragSynthesized;
  }

  // 3. Clinical Veterinary Knowledge Base Match
  const lowerMsg = cleanMessage.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    for (const kw of entry.keywords) {
      if (lowerMsg.includes(kw)) {
        const petName = accountContext.selectedPet?.petName || (accountContext.pets?.[0]?.petName || "");
        const reply = typeof entry.response === 'function' ? entry.response(petName, isHindi, accountContext.user) : entry.response;
        return {
          reply,
          suggestions: entry.suggestions || ["My Registered Pets", "Vaccine Schedule", "Emergency First Aid"],
          actionLink: entry.actionLink || null
        };
      }
    }
  }

  // 4. Fallback Contextual Response
  const petName = accountContext.selectedPet?.petName || "";
  if (isHindi) {
    return {
      reply: `Samajh gaya! 🐶 ${petName ? `**${petName}** ke baare me ` : ""}Aapka sawaal bohot accha hai.

Aap Woffy me:
• 🐶 Apne pets ke records aur Smart Collar Tag [My Pets](/pet-profiles) me manage kar sakte hain.
• 💉 Upcoming aur due vaccines [Vaccine Passport](/vaccinations) me track kar sakte hain.
• 📊 Daily health, weight aur symptoms [Health Records](/records) me note kar sakte hain.
• 🛍️ Dog essentials aur quality food [Pet Shop](/shop) se browse kar sakte hain.

Kya aap is baare me kuch aur specific poochna chahte hain? 🐾`,
      suggestions: ["My Registered Pets", "Vaccine Schedule", "Dog Diet Tips", "Browse Pet Shop"]
    };
  }

  return {
    reply: `Woof! I hear you! 🐶 ${petName ? `Regarding **${petName}**, ` : ""}Here's how Woffy helps:

• 🐶 View your registered dog details & collar tags under [My Pets](/pet-profiles).
• 💉 Manage automated immunizations & passports under [Vaccine Passport](/vaccinations).
• 📊 Log daily weight, symptoms & meds in [Health Records](/records).
• 🛍️ Discover premium nutrition & dog gear in [Pet Shop](/shop).

Would you like more specific information about your pet or Woffy tools? 🐾`,
    suggestions: ["My Registered Pets", "Vaccine Schedule", "Dog Diet Tips", "Browse Pet Shop"]
  };
}

module.exports = {
  generateJimmyResponseWithRag,
  KNOWLEDGE_BASE
};
