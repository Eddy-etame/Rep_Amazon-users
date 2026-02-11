import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterBar } from './shared/components/footer-bar/footer-bar';
import { TopBar } from './shared/components/top-bar/top-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBar, FooterBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
