import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ServiceToast } from './core/services/service-toast';
import { BarreBas } from './shared/components/barre-bas/barre-bas';
import { BarreHaute } from './shared/components/barre-haute/barre-haute';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarreHaute, BarreBas],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly toast = inject(ServiceToast);
}
