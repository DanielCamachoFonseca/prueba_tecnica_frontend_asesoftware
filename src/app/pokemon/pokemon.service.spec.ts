import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PokemonService } from './pokemon';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpTestingController: HttpTestingController; 
  const baseUrl = 'https://pokeapi.co/api/v2';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [PokemonService] 
    });

    service = TestBed.inject(PokemonService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener una lista paginada de Pokémon', () => {
    const mockPokemonList = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' }
      ]
    };

    const offset = 0;
    const limit = 20;

    // Llama al método del servicio
    service.getPokemonList(offset, limit).subscribe(response => {
      // Verifica que la respuesta sea la esperada
      expect(response).toEqual(mockPokemonList);
      expect(response.results.length).toBe(2);
      expect(response.results[0].name).toBe('bulbasaur');
    });

    // Espera una petición HTTP GET a la URL específica
    const req = httpTestingController.expectOne(`${baseUrl}/pokemon?offset=${offset}&limit=${limit}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPokemonList);
  });

  it('debería obtener los detalles de un Pokémon por nombre o ID', () => {
    const mockPokemonDetails = {
      id: 25,
      name: 'pikachu',
      weight: 60,
      types: [{ type: { name: 'electric' } }],
      sprites: { front_default: 'some_url_to_pikachu_sprite.png' },
      moves: [{ move: { name: 'thunder-shock' } }]
    };
    const pokemonNameOrId = 'pikachu';

    // Llama al método del servicio
    service.getPokemonDetails(pokemonNameOrId).subscribe(response => {
      expect(response).toEqual(mockPokemonDetails);
      expect(response.name).toBe('pikachu');
      expect(response.id).toBe(25);
    });

    // Espera una petición HTTP GET a la URL específica
    const req = httpTestingController.expectOne(`${baseUrl}/pokemon/${pokemonNameOrId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPokemonDetails);
  });

  it('debería manejar errores al obtener la lista de Pokémon', () => {
    const errorMessage = 'Error de red';
    const status = 500;
    const statusText = 'Internal Server Error';

    service.getPokemonList().subscribe(
      () => fail('Se esperaba un error, pero la suscripción fue exitosa.'),
      error => {
        expect(error.status).toBe(status);
        expect(error.statusText).toBe(statusText);
      }
    );

    const req = httpTestingController.expectOne(`${baseUrl}/pokemon?offset=0&limit=20`);
    req.error(new ProgressEvent('error'), { status, statusText });
  });

  it('debería manejar errores al obtener los detalles de un Pokémon', () => {
    const errorMessage = 'Pokémon no encontrado';
    const status = 404;
    const statusText = 'Not Found';
    const pokemonNameOrId = 'nonexistent';

    service.getPokemonDetails(pokemonNameOrId).subscribe(
      () => fail('Se esperaba un error, pero la suscripción fue exitosa.'),
      error => {
        expect(error.status).toBe(status);
        expect(error.statusText).toBe(statusText);
      }
    );

    const req = httpTestingController.expectOne(`${baseUrl}/pokemon/${pokemonNameOrId}`);
    req.error(new ProgressEvent('error'), { status, statusText });
  });
});
