import { supabase } from './lib/supabaseClient';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function migrateData() {
  if (!supabase) {
    throw new Error("Supabase client not initialized. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Secrets.");
  }

  console.log("Starting migration from Supabase to Firestore...");

  try {
    // 1. Fetch prompts from Supabase
    console.log("Fetching from Supabase...");
    
    const tableNames = ['prompts', 'prompt', 'Prompts', 'Prompt'];
    let prompts: any[] = [];
    let lastError: any = null;
    let usedTable = '';

    for (const tableName of tableNames) {
      console.log(`Trying table: ${tableName}`);
      const { data, error, status } = await supabase
        .from(tableName)
        .select('*');
      
      if (!error && data && data.length > 0) {
        prompts = data;
        usedTable = tableName;
        console.log(`Successfully found ${data.length} prompts in table '${tableName}'`);
        break;
      }
      
      if (error && status !== 404) {
        lastError = error;
      }
    }

    if (prompts.length === 0) {
      if (lastError) {
        throw new Error(`Supabase Error: ${lastError.message}`);
      }
      throw new Error("No prompts found in any common table names (prompts, prompt, Prompts). Please verify your table name in Supabase.");
    }

    console.log(`Found ${prompts.length} prompts in '${usedTable}'. Raw first prompt keys:`, Object.keys(prompts[0]));

    // 2. Upload to Firestore
    let successCount = 0;
    const firstPrompt = prompts[0];
    const availableKeys = Object.keys(firstPrompt);
    console.log("Available keys in Supabase data:", availableKeys);

    for (const prompt of prompts) {
      try {
        // Map fields carefully, providing defaults for missing data
        // Try to find content in common fields, or fallback to the longest string field
        let content = prompt.content || prompt.prompt_text || prompt.body || prompt.text || prompt.prompt || '';
        
        if (!content) {
          // Fallback: Find the longest string field that isn't a known metadata field
          const stringFields = Object.entries(prompt)
            .filter(([key, value]) => 
              typeof value === 'string' && 
              !['id', 'created_at', 'updated_at', 'title', 'slug', 'category', 'author_id', 'user_id'].includes(key)
            )
            .sort((a, b) => (b[1] as string).length - (a[1] as string).length);
          
          if (stringFields.length > 0) {
            content = stringFields[0][1] as string;
            console.log(`Guessed content field: ${stringFields[0][0]}`);
          }
        }

        const docData = {
          title: prompt.title || prompt.name || prompt.subject || 'Untitled Prompt',
          description: prompt.description || prompt.desc || prompt.summary || '',
          content: content,
          category: prompt.category || prompt.type || prompt.group || 'General',
          tags: Array.isArray(prompt.tags) ? prompt.tags : (typeof prompt.tags === 'string' ? prompt.tags.split(',').map((t: string) => t.trim()) : []),
          tier: prompt.tier || 'free',
          is_public: prompt.is_public ?? prompt.public ?? true,
          author_id: prompt.author_id || prompt.user_id || 'migrated_user',
          created_at: prompt.created_at || new Date().toISOString(),
          slug: prompt.slug || (prompt.title ? prompt.title.toLowerCase().replace(/\s+/g, '-') : `prompt-${Math.random().toString(36).substr(2, 9)}`),
          rating_count: Number(prompt.rating_count) || 0
        };

        if (!docData.content) {
          console.warn(`Skipping prompt "${docData.title}" because no content field was found. Available keys: ${availableKeys.join(', ')}`);
          continue;
        }

        await addDoc(collection(db, 'prompts'), docData);
        successCount++;
      } catch (err) {
        console.error(`Failed to migrate prompt: ${prompt.title || 'Unknown'}`, err);
      }
    }

    if (successCount === 0 && prompts.length > 0) {
      throw new Error(`Found ${prompts.length} items but couldn't identify the 'content' field. Available keys: ${availableKeys.join(', ')}`);
    }

    console.log(`Migration complete! Successfully moved ${successCount} out of ${prompts.length} prompts.`);
    return successCount;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
