import { CategoryGroup } from './types';

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: "Writing & Content",
    categories: ["Creative Writing", "Copywriting", "Blogging", "Academic", "Poetry"]
  },
  {
    name: "Business & Productivity",
    categories: ["Marketing", "Sales", "Management", "Email", "Planning"]
  },
  {
    name: "Coding & Tech",
    categories: ["Programming", "Debugging", "Data Science", "Web Development", "DevOps"]
  },
  {
    name: "Education & Learning",
    categories: ["Teaching", "Summarization", "Language Learning", "Study Aids"]
  },
  {
    name: "Lifestyle & Personal",
    categories: ["Health", "Travel", "Cooking", "Finance", "Hobbies"]
  }
];

export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories);
