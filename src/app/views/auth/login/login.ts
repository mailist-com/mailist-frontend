import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [ RouterLink, ReactiveFormsModule, CommonModule, TranslatePipe ],
  templateUrl: './login.html',
  styles: ``,
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  error = '';
  success = '';
  returnUrl = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/contacts';

    // Check if user was redirected after email verification
    if (this.route.snapshot.queryParams['verified'] === 'true') {
      this.success = 'Email verified successfully! You can now login.';
    }

    // Check if user was redirected due to session expiration
    if (this.route.snapshot.queryParams['sessionExpired'] === 'true') {
      this.error = 'Your session has expired. Please login again.';
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';

      const email = this.loginForm.value.email;

      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Login error:', error);

          // Check if the error is related to unverified email
          const errorMessage = typeof error === 'string' ? error : (error?.message || error?.toString() || 'Login failed. Please try again.');

          if (errorMessage.toLowerCase().includes('verify') ||
              errorMessage.toLowerCase().includes('verification') ||
              errorMessage.toLowerCase().includes('not verified')) {
            // Redirect to verification page
            this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
            return;
          }

          this.error = errorMessage;
          this.isLoading = false;
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} is required`;
      if (field.errors?.['email']) return 'Please enter a valid email address';
      if (field.errors?.['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return null;
  }
}