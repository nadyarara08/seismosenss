import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-container" *ngIf="isLoading">
      <ion-spinner [name]="spinnerName" [color]="color"></ion-spinner>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    }
  `]
})
export class LoadingComponent {
  @Input() isLoading = false;
  @Input() message = 'Loading...';
  @Input() spinnerName = 'crescent';
  @Input() color = 'primary';
}