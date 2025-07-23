import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms'; // Importa FormArray
import { CustomPokemonService } from '../services/custom-pokemon'; 
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-pokemon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-pokemon.html',
})
export class AddPokemonComponent implements OnInit {
  addPokemonForm!: FormGroup; 

  constructor(
    private fb: FormBuilder,
    private customPokemonService: CustomPokemonService , 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.addPokemonForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required], 
      weight: ['', [Validators.required, Validators.min(0.1)]], 
      spriteUrl: ['', [Validators.required, Validators.pattern('https?://.+')]], 
      moves: this.fb.array([])
    });
  }

  get moves(): FormArray {
    return this.addPokemonForm.get('moves') as FormArray;
  }

  addMove(): void {
    this.moves.push(this.fb.control('', Validators.required));
  }

  removeMove(index: number): void {
    this.moves.removeAt(index);
  }

  onSubmit(): void {
    if (this.addPokemonForm.valid) {
      const formValue = this.addPokemonForm.value;

      const newCustomPokemon = {
        name: formValue.name,
        type: formValue.type,
        weight: parseFloat(formValue.weight),
        sprites: {
          front_default: formValue.spriteUrl
        },
        moves: formValue.moves
      };

      this.customPokemonService.addPokemon(newCustomPokemon);

      Swal.fire('Éxito', 'Pokémon personalizado añadido exitosamente!', 'success').then(() => {
        this.router.navigate(['/pokemon']);
      });

    } else {
  
      Swal.fire('Error', 'Por favor, completa todos los campos requeridos y corrige los errores.', 'error');
      this.addPokemonForm.markAllAsTouched();
    }
  }

  goBackToList(): void {
    this.router.navigate(['/pokemon']);
  }
}
