import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  imports: [NgIcon, RouterLink, CommonModule],
  templateUrl: './user-profile.html',
  styles: ``
})
export class UserProfile {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}
