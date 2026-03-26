import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NotificationSchedulerService } from './core/services/notification-scheduler.service';
import { ToastService } from './core/services/toast.service';
import { FooterBar } from './shared/components/footer-bar/footer-bar';
import { TopBar } from './shared/components/top-bar/top-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBar, FooterBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  readonly toast = inject(ToastService);

  constructor(private readonly notificationScheduler: NotificationSchedulerService) {}

  ngOnInit(): void {
    this.notificationScheduler.init();
  }
}
