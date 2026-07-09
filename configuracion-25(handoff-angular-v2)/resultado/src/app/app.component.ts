import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent {
  title = "dino-runner";

  constructor() {
    console.log('[DIAG] AppComponent loaded');
    window.onerror = (msg) => console.error('[DIAG] Global error:', msg);
  }
}