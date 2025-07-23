import { Routes } from '@angular/router';
import { SearchPokemonComponent } from './search-pokemon/search-pokemon';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    component: SearchPokemonComponent
  }
];