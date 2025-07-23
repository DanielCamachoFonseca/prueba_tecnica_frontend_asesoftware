export interface Pokemon {
  id: number; 
  name: string;
  type: string; 
  weight: number; 
  sprites: { 
    front_default: string; 
  };
  moves: string[];
}