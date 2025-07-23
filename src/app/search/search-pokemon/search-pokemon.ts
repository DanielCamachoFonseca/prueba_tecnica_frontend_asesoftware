import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PokemonService } from '../../pokemon/pokemon';
import { CustomPokemonService } from '../../services/custom-pokemon';
import { Pokemon } from '../../models/pokemon.model';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Subject, Subscription, of, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, finalize, map, tap } from 'rxjs/operators'; // Añadido tap

@Component({
  selector: 'app-search-pokemon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe, RouterLink],
  templateUrl: './search-pokemon.html'
})
export class SearchPokemonComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  pokemonResult: any | null = null;
  isLoading: boolean = false;
  searchError: string | null = null;
  private searchSubscription: Subscription | undefined;

  constructor(
    private pokemonService: PokemonService,
    private customPokemonService: CustomPokemonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.searchControl.setValue(query);
      }
    });

    this.searchSubscription = this.searchControl.valueChanges.pipe(
      tap(val => console.log('ValueChanges: Nuevo término de búsqueda:', val)),
      debounceTime(500),
      distinctUntilChanged(),
      tap(val => console.log('Después de debounce/distinct: Término final:', val)),
      switchMap(searchTerm => {
        console.log('SwitchMap: Procesando término:', searchTerm);
        this.isLoading = true; // Se activa la carga al iniciar la búsqueda
        this.pokemonResult = null;
        this.searchError = null;

        if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
          const lowerCaseSearchTerm = searchTerm.toLowerCase();
          console.log('Buscando para:', lowerCaseSearchTerm);

          const customPokemons: Pokemon[] = this.customPokemonService.getPokemons();
          const foundCustomPokemon = customPokemons.find(p => p.name.toLowerCase() === lowerCaseSearchTerm || p.id.toString() === lowerCaseSearchTerm);

          if (foundCustomPokemon) {
            console.log('Pokémon personalizado encontrado:', foundCustomPokemon.name);
            return of({ ...foundCustomPokemon, isCustom: true }).pipe(
              tap(data => console.log('Emitiendo Pokémon personalizado:', data))
            );
          } else {
            console.log('Buscando en PokeAPI para:', lowerCaseSearchTerm);
            return this.pokemonService.getPokemonDetails(lowerCaseSearchTerm).pipe(
              tap(apiData => console.log('Datos de API recibidos:', apiData)),
              map((apiData: any) => ({ ...apiData, isCustom: false })),
              catchError(error => {
                console.error('Error de API en catchError:', error);
                if (error.status === 404) {
                  this.searchError = `El Pokémon "${searchTerm}" no fue encontrado en la PokeAPI.`;
                } else {
                  this.searchError = `Error al buscar el Pokémon "${searchTerm}". Inténtalo de nuevo.`;
                }
                return of(null);
              })
            );
          }
        } else {
          console.log('Término de búsqueda vacío, no se realiza búsqueda.');
          this.isLoading = false;
          return EMPTY;
        }
      })
    ).subscribe({
      next: (data) => {
        console.log('Suscripción Next: Datos recibidos:', data);
        if (data) {
          if (!data.isCustom && data.species && data.species.url) {
            const urlParts = data.species.url.split('/');
            data.id = urlParts[urlParts.length - 2];
          }
          this.pokemonResult = data;
        } else {
          this.pokemonResult = null;
          if (!this.searchError && this.searchControl.value && this.searchControl.value.trim() !== '') {
              this.searchError = `No se encontró ningún Pokémon con el nombre "${this.searchControl.value}".`;
          }
        }
        this.isLoading = false;
        console.log('Suscripción Next: isLoading después de procesar:', this.isLoading);
      },
      error: (error) => {
        console.error('Suscripción Error (fallo no capturado en switchMap):', error);
        this.isLoading = false;
        this.pokemonResult = null;
        this.searchError = `Ocurrió un error inesperado durante la búsqueda.`;
        console.log('Suscripción Error: isLoading después de procesar:', this.isLoading);
      },
      complete: () => {
        console.log('Suscripción Completada.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
      console.log('Suscripción de búsqueda desuscrita.');
    }
  }
}