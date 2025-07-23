import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon-list/pokemon-list';
import { AddPokemonComponent } from './add-pokemon/add-pokemon';

export const routes: Routes = [
  { path: '', redirectTo: '/pokemon', pathMatch: 'full' },
  { path: 'pokemon', component: PokemonListComponent },
  {
    path: 'search',
    loadChildren: () => import('./search/search.routes').then(m => m.SEARCH_ROUTES)
  },
  { path: 'add-pokemon', component: AddPokemonComponent }
];