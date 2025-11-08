import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './reset-password.html',
  styles: ``,
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ResetPassword {
  resetForm: FormGroup;
  isLoading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';

      this.authService.resetPassword(this.resetForm.get('email')?.value).subscribe({
        next: (message) => {
          this.success = typeof message === 'string' ? message : 'Password reset instructions sent to your email';
          this.isLoading = false;

          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Reset password error:', error);
          this.error = typeof error === 'string' ? error : (error?.message || error?.toString() || 'Password reset failed. Please try again.');
          this.isLoading = false;
        }
      });
    } else {
      this.resetForm.get('email')?.markAsTouched();
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.resetForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} is required`;
      if (field.errors?.['email']) return 'Please enter a valid email address';
    }
    return null;
  }
}