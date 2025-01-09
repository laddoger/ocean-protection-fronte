export interface AnimalCategory {
  id: number;
  name: string;
  image: string;
  description: string;
}

export interface Animal {
  id: number;
  name: string;
  image_url: string;
  description: string;
  category_id: number;
  category: AnimalCategory;
  habitat: string;
  conservation: string;
  diet: string;
  is_featured: boolean;
} 