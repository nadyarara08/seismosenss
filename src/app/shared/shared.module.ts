import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoadingComponent } from './components/loading.component';

const COMPONENTS = [
  LoadingComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  exports: [...COMPONENTS, CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class SharedModule { }