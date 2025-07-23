import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common';

import { CustomPokemonService } from './custom-pokemon';
import { Pokemon } from '../models/pokemon.model';

// Mockear localStorage
const localStorageMock = (function() {
  let store: { [key: string]: string } = {}; // Un objeto simple para simular localStorage

  return {
    getItem: (key: string) => {
      return store[key] || null; // Simula getItem
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString(); // Simula setItem
    },
    clear: () => {
      store = {}; // Simula clear
    },
    removeItem: (key: string) => {
      delete store[key]; // Simula removeItem
    }
  };
})();

// Mockear isPlatformBrowser para que siempre devuelva true en las pruebas de navegador
const isPlatformBrowserMock = (platformId: Object) => true;

describe('CustomPokemonService', () => {
  let service: CustomPokemonService;
  const STORAGE_KEY = 'Pokemons';

  beforeEach(() => {
    // Configura el TestBed
    TestBed.configureTestingModule({
      providers: [
        CustomPokemonService,
        { provide: PLATFORM_ID, useValue: 'browser' }, // Simula que estamos en un navegador
        // Sobrescribe la función isPlatformBrowser para que siempre devuelva true
        { provide: isPlatformBrowser, useValue: isPlatformBrowserMock }
      ]
    });

    // Inyecta el servicio
    service = TestBed.inject(CustomPokemonService);

    // Limpia el localStorage mockeado antes de cada prueba
    localStorageMock.clear();
    // Reemplaza el localStorage global con nuestro mock
    spyOn(localStorage, 'getItem').and.callFake(localStorageMock.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageMock.setItem);
    spyOn(localStorage, 'clear').and.callFake(localStorageMock.clear);
    spyOn(localStorage, 'removeItem').and.callFake(localStorageMock.removeItem);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería retornar un array vacío si no hay Pokémon personalizados en localStorage', () => {
    expect(service.getPokemons()).toEqual([]);
    expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('debería retornar los Pokémon personalizados almacenados en localStorage', () => {
    const mockPokemons: Pokemon[] = [
      { id: 10001, name: 'Dragonite', type: 'Dragon', weight: 210, sprites: { front_default: 'url1' }, moves: ['fly'] },
      { id: 10002, name: 'CharizardX', type: 'Fire', weight: 90, sprites: { front_default: 'url2' }, moves: ['flamethrower'] }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPokemons));

    expect(service.getPokemons()).toEqual(mockPokemons);
    expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('debería añadir un nuevo Pokémon personalizado a localStorage con un ID generado', () => {
    const newPokemonData: Omit<Pokemon, 'id'> = {
      name: 'PikachuCustom',
      type: 'Electric',
      weight: 60,
      sprites: { front_default: 'custom_pikachu_url' },
      moves: ['thunderbolt', 'quick-attack']
    };

    service.addPokemon(newPokemonData);

    const storedPokemons = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(storedPokemons.length).toBe(1);
    expect(storedPokemons[0].name).toBe('PikachuCustom');
    expect(storedPokemons[0].id).toBeGreaterThanOrEqual(10001); // Verifica que el ID se generó
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(storedPokemons));
  });

  it('debería generar IDs crecientes para nuevos Pokémon personalizados', () => {
    const pokemon1: Omit<Pokemon, 'id'> = { name: 'Poke1', type: 'Normal', weight: 10, sprites: { front_default: 'u1' }, moves: ['m1'] };
    const pokemon2: Omit<Pokemon, 'id'> = { name: 'Poke2', type: 'Fire', weight: 20, sprites: { front_default: 'u2' }, moves: ['m2'] };

    service.addPokemon(pokemon1);
    const stored1 = service.getPokemons();
    const id1 = stored1[0].id;

    service.addPokemon(pokemon2);
    const stored2 = service.getPokemons();
    const id2 = stored2[1].id;

    expect(id2).toBeGreaterThan(id1);
    expect(id1).toBeGreaterThanOrEqual(10001);
  });

  it('no debería intentar acceder a localStorage si no está en entorno de navegador', () => {
    // Reconfigura el TestBed para simular un entorno no-navegador
    TestBed.resetTestingModule(); // Reinicia el TestBed
    TestBed.configureTestingModule({
      providers: [
        CustomPokemonService,
        { provide: PLATFORM_ID, useValue: 'server' }, // Simula que NO estamos en un navegador
        { provide: isPlatformBrowser, useValue: (platformId: Object) => false } // isPlatformBrowser devuelve false
      ]
    });
    service = TestBed.inject(CustomPokemonService);

    // No se debería llamar a localStorage.getItem
    expect(service.getPokemons()).toEqual([]);
    expect(localStorage.getItem).not.toHaveBeenCalled();

    // No se debería llamar a localStorage.setItem
    const newPokemonData: Omit<Pokemon, 'id'> = {
      name: 'ServerPoke', type: 'Ghost', weight: 50, sprites: { front_default: 'url' }, moves: ['lick']
    };
    service.addPokemon(newPokemonData);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
