import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidenav } from "../components/sidenav/sidenav";
import { Topbar } from "../components/topbar/topbar";
import { Footer } from "../components/footer/footer";
import { Customizer } from "../components/customizer/customizer";
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, Sidenav, Topbar, RouterOutlet, Footer, Customizer],
  templateUrl: './main-layout.html',
  styles: ``
})
export class MainLayout {
  isAuthenticated$: Observable<boolean>;

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = new Observable(observer => {
      this.authService.currentUser$.subscribe(user => {
        observer.next(!!user);
      });
    });

    // Redirect if not authenticated (backup protection)
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
