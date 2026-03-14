import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit, deleteDoc, doc } from 'firebase/firestore';

export const seedPrompts = [
  // --- SINGLE SHOT PROMPTS ---
  {
    title: "Poetic Product Description",
    description: "Generates a poetic description for any product.",
    content: "Write a short, 3-stanza poem describing a [PRODUCT_NAME]. Focus on its [KEY_FEATURE] and how it makes the user feel [EMOTION]. Use sensory language.",
    category: "Creative Writing",
    tags: ["single-shot", "poetry", "marketing"],
    tier: "free"
  },
  {
    title: "Python Function Docstring Generator",
    description: "Creates professional PEP 257 compliant docstrings.",
    content: "Generate a Google-style Python docstring for the following function: [INSERT_CODE]. Include Args, Returns, and Raises sections.",
    category: "Development",
    tags: ["single-shot", "python", "coding"],
    tier: "free"
  },
  {
    title: "Meal Plan from Leftovers",
    description: "Creates a recipe based on what's in your fridge.",
    content: "I have [INGREDIENT_1], [INGREDIENT_2], and [INGREDIENT_3]. Suggest a healthy dinner recipe I can make in under 30 minutes using these items.",
    category: "Lifestyle",
    tags: ["single-shot", "cooking", "health"],
    tier: "free"
  },
  
  // --- TWO SHOT PROMPTS ---
  {
    title: "Professional Email Polisher",
    description: "Converts casual notes into professional emails using examples.",
    content: "Convert casual notes into professional business emails.\n\nExample 1:\nInput: Hey, can't make the meeting. Busy with client.\nOutput: Dear Team, please accept my apologies as I will be unable to attend today's meeting due to a conflicting client commitment.\n\nExample 2:\nInput: Send me the report by EOD.\nOutput: Could you please ensure the report is sent over to me by the end of the day?\n\nInput: [YOUR_CASUAL_NOTES]\nOutput:",
    category: "Business & Productivity",
    tags: ["two-shot", "email", "professional"],
    tier: "free"
  },
  {
    title: "SQL Query Generator",
    description: "Translates natural language to SQL using schema examples.",
    content: "Translate the following natural language requests into SQL queries for a 'users' table with columns (id, name, email, created_at).\n\nExample 1:\nRequest: Find all users who joined this year.\nSQL: SELECT * FROM users WHERE created_at >= '2024-01-01';\n\nExample 2:\nRequest: Get the email of the user named Alice.\nSQL: SELECT email FROM users WHERE name = 'Alice';\n\nRequest: [YOUR_REQUEST]\nSQL:",
    category: "Development",
    tags: ["two-shot", "sql", "database"],
    tier: "pro"
  },

  // --- MULTI SHOT PROMPTS ---
  {
    title: "Sentiment Classifier (Multi-shot)",
    description: "Classifies text sentiment with high accuracy using multiple examples.",
    content: "Classify the sentiment of the following movie reviews as Positive, Negative, or Neutral.\n\nReview: The acting was superb and the plot was gripping.\nSentiment: Positive\n\nReview: I fell asleep halfway through. Boring and predictable.\nSentiment: Negative\n\nReview: It was okay, some good parts but mostly average.\nSentiment: Neutral\n\nReview: A masterpiece of modern cinema. I loved every second.\nSentiment: Positive\n\nReview: [YOUR_REVIEW]\nSentiment:",
    category: "Academic",
    tags: ["multi-shot", "classification", "nlp"],
    tier: "free"
  },
  {
    title: "Socratic Tutor",
    description: "Teaches concepts by asking questions instead of giving answers.",
    content: "You are a Socratic tutor. Your goal is to help the student understand a concept by asking guiding questions rather than providing direct answers.\n\nStudent: Why is the sky blue?\nTutor: That's a great question! To start, what do you know about how light from the sun interacts with our atmosphere?\n\nStudent: What is photosynthesis?\nTutor: Think about what plants need to grow. If they don't eat food like animals do, where might they get their energy from?\n\nStudent: [YOUR_QUESTION]\nTutor:",
    category: "Academic",
    tags: ["multi-shot", "education", "tutor"],
    tier: "free"
  },
  {
    title: "Brand Voice Transformer",
    description: "Rewrites text to match a specific brand personality.",
    content: "Rewrite the following text to match our brand voice: Friendly, Energetic, and Tech-Savvy.\n\nOriginal: Our app helps you manage tasks.\nBrand Voice: Level up your productivity! Our sleek new tool makes crushing your to-do list easier than ever. 🚀\n\nOriginal: We have updated our privacy policy.\nBrand Voice: We've given our privacy policy a fresh update to keep your data safe and sound. Check it out! 🔒\n\nOriginal: [YOUR_TEXT]\nBrand Voice:",
    category: "Business & Productivity",
    tags: ["multi-shot", "branding", "copywriting"],
    tier: "pro"
  }
];

export async function removePlaceholderPrompts() {
  console.log("Starting placeholder cleanup...");
  let deletedCount = 0;
  
  try {
    const snapshot = await getDocs(collection(db, 'prompts'));
    const docs = snapshot.docs;
    
    const deletePromises = [];
    const batchSize = 20;

    for (let i = 0; i < docs.length; i++) {
      const document = docs[i];
      const data = document.data();
      
      if (data.title && data.title.includes('Template #')) {
        deletePromises.push(deleteDoc(doc(db, 'prompts', document.id)));
        deletedCount++;
        
        if (deletePromises.length >= batchSize) {
          await Promise.all(deletePromises);
          deletePromises.length = 0;
          console.log(`Progress: deleted ${deletedCount} placeholders so far...`);
        }
      }
    }

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    console.log(`Cleanup complete! Deleted ${deletedCount} placeholder prompts.`);
    return deletedCount;
  } catch (error) {
    console.error("Placeholder cleanup failed:", error);
    throw error;
  }
}

export async function seedDatabase() {
  console.log("Checking for existing prompts to prevent duplicates...");
  
  // 1. Fetch all existing prompt titles to avoid duplicates
  const existingTitles = new Set<string>();
  try {
    const snapshot = await getDocs(collection(db, 'prompts'));
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.title) {
        existingTitles.add(data.title.toLowerCase().trim());
      }
    });
  } catch (error) {
    console.error("Error fetching existing prompts:", error);
  }

  // 2. Filter out prompts that already exist
  const newPrompts = seedPrompts.filter(p => !existingTitles.has(p.title.toLowerCase().trim()));

  if (newPrompts.length === 0) {
    console.log("No new prompts to seed. All prompts already exist.");
    return 0;
  }

  console.log(`Seeding ${newPrompts.length} new prompts...`);
  let count = 0;
  for (const prompt of newPrompts) {
    try {
      await addDoc(collection(db, 'prompts'), {
        ...prompt,
        rating_count: Math.floor(Math.random() * 50),
        created_at: new Date().toISOString(),
        author_id: 'system_seed',
        is_public: true,
        slug: prompt.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Math.random().toString(36).substr(2, 5)
      });
      count++;
    } catch (err) {
      console.error("Error seeding prompt:", err);
    }
  }
  console.log(`Successfully seeded ${count} new prompts.`);
  return count;
}

export async function cleanDuplicates() {
  console.log("Starting duplicate cleanup...");
  let deletedCount = 0;
  const seenTitles = new Set<string>();
  
  try {
    const snapshot = await getDocs(collection(db, 'prompts'));
    const docs = snapshot.docs;
    
    // Sort docs by created_at so we keep the oldest one
    docs.sort((a, b) => {
      const dateA = new Date(a.data().created_at || 0).getTime();
      const dateB = new Date(b.data().created_at || 0).getTime();
      return dateA - dateB;
    });

    const deletePromises = [];
    const batchSize = 20; // Delete in small batches to be safe

    for (let i = 0; i < docs.length; i++) {
      const document = docs[i];
      const data = document.data();
      const title = (data.title || '').toLowerCase().trim();
      
      if (seenTitles.has(title)) {
        // This is a duplicate, delete it
        deletePromises.push(deleteDoc(doc(db, 'prompts', document.id)));
        deletedCount++;
        
        // If we hit batch size, wait for them to finish
        if (deletePromises.length >= batchSize) {
          await Promise.all(deletePromises);
          deletePromises.length = 0;
          console.log(`Progress: deleted ${deletedCount} duplicates so far...`);
        }
      } else {
        seenTitles.add(title);
      }
    }

    // Final batch
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    console.log(`Cleanup complete! Deleted ${deletedCount} duplicate prompts.`);
    return deletedCount;
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
}
