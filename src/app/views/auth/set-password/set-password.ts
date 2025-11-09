import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-set-password',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './set-password.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SetPassword implements OnInit {
  setPasswordForm: FormGroup;
  error = '';
  success = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.setPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get token from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.error = 'Invalid invitation link. Please check your email and try again.';
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit() {
    if (this.setPasswordForm.valid && this.token) {
      this.error = '';
      this.success = '';

      const password = this.setPasswordForm.get('password')?.value;

      this.authService.setPassword(this.token, password).subscribe({
        next: (message) => {
          this.success = message || 'Password set successfully! You can now login.';

          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Set password error:', error);
          this.error = typeof error === 'string' ? error : (error?.message || error?.toString() || 'Failed to set password. Please try again.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.setPasswordForm.controls).forEach(key => {
        this.setPasswordForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.setPasswordForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} is required`;
      if (field.errors?.['minlength']) return 'Password must be at least 8 characters';
      if (field.errors?.['passwordMismatch']) return 'Passwords do not match';
    }
    return null;
  }
}
