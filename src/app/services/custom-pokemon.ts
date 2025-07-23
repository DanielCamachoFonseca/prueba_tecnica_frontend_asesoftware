import { Injectable, PLATFORM_ID, Inject } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common'; 
import { Pokemon } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class CustomPokemonService {
  private readonly STORAGE_KEY = 'Pokemons';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { } 


  getPokemons(): Pokemon[] {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
    return []; // Si no estamos en el navegador, devuelve un array vacío
  }

  addPokemon(newPokemon: Omit<Pokemon, 'id'>): void {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const pokemons = this.getPokemons();
      const maxId = pokemons.reduce((max, p) => (p.id > max ? p.id : max), 0);
      const newId = Math.max(maxId + 1, 10001); 

      const pokemonToAdd: Pokemon = {
        ...newPokemon,
        id: newId
      };

      pokemons.push(pokemonToAdd);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pokemons));
    } else {
        console.warn('Intento de añadir Pokémon a localStorage en entorno no-browser.');
    }
  }
}