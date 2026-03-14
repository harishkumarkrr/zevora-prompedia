export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  tier: 'free' | 'pro';
  is_public: boolean;
  author_id: string;
  created_at: string;
  slug: string;
  rating_count?: number;
  upvoted_by?: string[];
}

export interface Profile {
  id: string;
  email: string;
  is_pro: boolean;
  full_name?: string;
  avatar_url?: string;
}

export interface CategoryGroup {
  name: string;
  categories: string[];
}
