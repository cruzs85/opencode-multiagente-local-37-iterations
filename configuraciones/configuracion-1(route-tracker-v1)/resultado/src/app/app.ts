import { Component } from '@angular/core';
import { LayoutComponent } from './shared/layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  template: '<app-layout />',
  styles: [':host { display: block; height: 100vh; overflow: hidden; }'],
})
export class App {}
