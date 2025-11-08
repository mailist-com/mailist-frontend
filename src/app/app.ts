import { Component } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import * as LucideIcons  from '@ng-icons/lucide';
import * as tablerIcons from '@ng-icons/tabler-icons';
import * as tablerIconsFill from '@ng-icons/tabler-icons/fill';
import {  provideIcons } from '@ng-icons/core';
import { TitleService } from './core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalLoaderComponent } from './components/global-loader/global-loader';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
   providers: [provideIcons({...LucideIcons,...tablerIcons, ...tablerIconsFill})],
})

export class App {
  constructor(
    private router: Router,
    private titleService: TitleService,
    private translate: TranslateService,
  ) {
    // Set default language
    this.translate.setDefaultLang('pl');
    this.translate.use('pl');
  }

  ngOnInit() {
    this.titleService.init();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => window.HSStaticMethods.autoInit(), 100);
      }
    });
  }
}
