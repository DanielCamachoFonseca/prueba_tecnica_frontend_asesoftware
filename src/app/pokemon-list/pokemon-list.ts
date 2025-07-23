import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { PokemonService } from '../pokemon/pokemon';
import { RouterLink } from '@angular/router';
import { CustomPokemonService } from '../services/custom-pokemon'; 
import { Pokemon } from '../models/pokemon.model'; 

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
    RouterLink
  ],
  templateUrl: './pokemon-list.html',
})
export class PokemonListComponent implements OnInit {
  pokemonList: any[] = []; 
  displayedPokemonList: any[] = []; 
  pageSize: number = 20; 
  currentPage: number = 1; 
  totalItems: number = 0; 
  totalPages: number = 1;

  selectedPokemon: any | null = null;

  constructor(
    private pokemonService: PokemonService,
    private customPokemonService: CustomPokemonService
  ) { }

  ngOnInit(): void {
    this.loadAllAndCombinePokemon();
  }

  // Método para cargar todos los Pokémon y combinarlos
  loadAllAndCombinePokemon(): void {
    this.pokemonService.getPokemonList(0, 10000).subscribe({ 
      next: (apiResponse) => {
        const customPokemons = this.customPokemonService.getPokemons();

        // Mapear Pokémon de la API para añadirles el ID y el flag isCustom
        const apiPokemons = apiResponse.results.map((pokemon: any) => {
          const urlParts = pokemon.url.split('/');
          pokemon.id = parseInt(urlParts[urlParts.length - 2], 10); 
          pokemon.isCustom = false;
          return pokemon;
        });

        let combinedPokemons = [...customPokemons, ...apiPokemons];
        combinedPokemons.sort((a, b) => {
          const idA = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
          const idB = typeof b.id === 'string' ? parseInt(b.id, 10) : b.id;
          return idA - idB;
        });

        this.pokemonList = combinedPokemons; // Almacena la lista completa y ordenada
        this.totalItems = this.pokemonList.length; // El total de elementos es la longitud de la lista combinada
        this.totalPages = Math.ceil(this.totalItems / this.pageSize); // Calcula el total de páginas

        // Aplica la paginación inicial para mostrar la primera página
        this.goToPage(this.currentPage);

        // Si ya hay un Pokémon seleccionado y está en la lista combinada, re-seleccionar
        if (this.selectedPokemon) {
            const currentSelected = this.pokemonList.find(p => p.id == this.selectedPokemon.id);
            if (currentSelected) {
                this.selectPokemon(currentSelected);
            } else {
                this.selectedPokemon = null;
            }
        }
      },
      error: (error) => {
        console.error('Error al cargar la lista de Pokémon desde la API:', error);
        // Fallback: si la API falla, cargar solo los personalizados y ordenarlos
        this.pokemonList = this.customPokemonService.getPokemons();
        this.pokemonList.sort((a, b) => {
            const idA = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
            const idB = typeof b.id === 'string' ? parseInt(b.id, 10) : b.id;
            return idA - idB;
        });
        this.totalItems = this.pokemonList.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.goToPage(this.currentPage); 
        if (this.selectedPokemon) {
            const currentSelected = this.pokemonList.find(p => p.id == this.selectedPokemon.id);
            if (currentSelected) {
                this.selectPokemon(currentSelected);
            } else {
                this.selectedPokemon = null;
            }
        }
      }
    });
  }

  // Método para ir a una página específica (ahora solo hace el slice)
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedPokemonList = this.pokemonList.slice(startIndex, endIndex);
  }

  // Métodos de paginación
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  selectPokemon(pokemon: any): void {
    if (this.selectedPokemon && this.selectedPokemon.id == pokemon.id) {
        return;
    }

    this.selectedPokemon = null; // Limpiar detalles anteriores

    if (pokemon.isCustom) {
      this.selectedPokemon = pokemon;
    } else {
      this.pokemonService.getPokemonDetails(pokemon.id).subscribe({
        next: (details) => {
          this.selectedPokemon = details;
        },
        error: (error) => {
          console.error(`Error al cargar los detalles de ${pokemon.name} desde la API:`, error);
          this.selectedPokemon = null;
        }
      });
    }
  }
}