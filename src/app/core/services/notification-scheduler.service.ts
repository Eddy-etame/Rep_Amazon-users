import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationSchedulerService {
  scheduleOrderNotifications(): void {
    // Backend-owned notifications replaced the previous client-side scheduler.
  }

  init(): void {
    // No-op by design: order reminders and confirmations now originate server-side.
  }
}
