import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

export interface LegalPageData {
  legalTitle: string;
  legalParagraphs: string[];
  contactEmail?: string;
}

@Component({
  selector: 'app-page-mentions',
  imports: [RouterLink],
  templateUrl: './page-mentions.html',
  styleUrl: './page-mentions.scss'
})
export class PageMentions {
  title = '';
  paragraphs: string[] = [];
  contactEmail: string | null = null;

  private readonly route = inject(ActivatedRoute);

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.route.data.pipe(takeUntilDestroyed(destroyRef)).subscribe((d) => {
      const data = d as LegalPageData;
      this.title = data.legalTitle ?? 'Information';
      this.paragraphs = data.legalParagraphs ?? [];
      this.contactEmail = data.contactEmail ?? null;
    });
  }
}
