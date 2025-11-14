import { Component, forwardRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBold,
  lucideItalic,
  lucideUnderline,
  lucideHeading1,
  lucideHeading2,
  lucideList,
  lucideListOrdered,
  lucideLink,
  lucideImage,
  lucideAlignLeft,
  lucideAlignCenter,
  lucideAlignRight,
  lucideCode,
  lucideEye,
  lucideUndo,
  lucideRedo,
  lucideMinus,
  lucideMousePointerClick,
  lucideLayoutPanelTop,
  lucideRectangleHorizontal,
  lucideLayout,
} from '@ng-icons/lucide';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, TranslateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailEditor),
      multi: true
    },
    provideIcons({
      lucideBold,
      lucideItalic,
      lucideUnderline,
      lucideHeading1,
      lucideHeading2,
      lucideList,
      lucideListOrdered,
      lucideLink,
      lucideImage,
      lucideAlignLeft,
      lucideAlignCenter,
      lucideAlignRight,
      lucideCode,
      lucideEye,
      lucideUndo,
      lucideRedo,
      lucideMinus,
      lucideMousePointerClick,
      lucideLayoutPanelTop,
      lucideRectangleHorizontal,
      lucideLayout,
    })
  ],
  templateUrl: './email-editor.html',
  styleUrl: './email-editor.css'
})
export class EmailEditor implements ControlValueAccessor, OnInit {
  @ViewChild('wysiwygEditor', { static: false }) wysiwygEditor!: ElementRef;

  isHtmlMode = false;
  htmlContent = '';

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    // Initialize
  }

  writeValue(value: string): void {
    this.htmlContent = value || '';
    if (this.wysiwygEditor && !this.isHtmlMode) {
      this.wysiwygEditor.nativeElement.innerHTML = this.htmlContent;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleMode(): void {
    if (this.isHtmlMode) {
      // Switching from HTML to WYSIWYG
      this.isHtmlMode = false;
      setTimeout(() => {
        if (this.wysiwygEditor) {
          this.wysiwygEditor.nativeElement.innerHTML = this.htmlContent;
        }
      });
    } else {
      // Switching from WYSIWYG to HTML
      if (this.wysiwygEditor) {
        this.htmlContent = this.wysiwygEditor.nativeElement.innerHTML;
      }
      this.isHtmlMode = true;
    }
  }

  onWysiwygInput(): void {
    if (this.wysiwygEditor) {
      this.htmlContent = this.wysiwygEditor.nativeElement.innerHTML;
      this.onChange(this.htmlContent);
      this.onTouched();
    }
  }

  onHtmlChange(): void {
    this.onChange(this.htmlContent);
    this.onTouched();
  }

  execCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.onWysiwygInput();
  }

  insertHeading(level: number): void {
    this.execCommand('formatBlock', `h${level}`);
  }

  insertLink(): void {
    const url = prompt(this.translateService.instant('TEMPLATES.EDITOR.ENTER_URL'));
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  insertImage(): void {
    const url = prompt(this.translateService.instant('TEMPLATES.EDITOR.ENTER_IMAGE_URL'));
    if (url) {
      this.execCommand('insertImage', url);
    }
  }

  insertHorizontalRule(): void {
    this.execCommand('insertHorizontalRule');
  }

  setAlignment(align: string): void {
    this.execCommand(`justify${align}`);
  }

  undo(): void {
    this.execCommand('undo');
  }

  redo(): void {
    this.execCommand('redo');
  }

  insertParagraph(): void {
    this.execCommand('formatBlock', 'p');
  }

  // Quick content blocks for email templates
  insertButton(): void {
    const buttonHtml = `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 20px auto;">
        <tr>
          <td style="border-radius: 4px; background-color: #667eea;">
            <a href="https://example.com" target="_blank" style="border: 1px solid #667eea; border-radius: 4px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; margin: 0; padding: 12px 24px; text-decoration: none;">
              Przycisk CTA
            </a>
          </td>
        </tr>
      </table>
    `;
    document.execCommand('insertHTML', false, buttonHtml);
    this.onWysiwygInput();
  }

  insertEmailBlock(type: 'header' | 'footer' | 'section'): void {
    let blockHtml = '';

    switch (type) {
      case 'header':
        blockHtml = `
          <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: #2d3748; font-size: 24px;">Nagłówek Email</h1>
          </div>
        `;
        break;
      case 'footer':
        blockHtml = `
          <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;">
            <p style="margin: 0; color: #718096; font-size: 12px;">© 2024 Twoja Firma. Wszelkie prawa zastrzeżone.</p>
            <p style="margin: 10px 0 0 0; color: #718096; font-size: 12px;">
              <a href="#" style="color: #667eea; text-decoration: none;">Wypisz się</a> |
              <a href="#" style="color: #667eea; text-decoration: none;">Preferencje</a>
            </p>
          </div>
        `;
        break;
      case 'section':
        blockHtml = `
          <div style="background-color: #ffffff; padding: 30px; margin: 20px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h2 style="margin: 0 0 15px 0; color: #2d3748; font-size: 20px;">Tytuł Sekcji</h2>
            <p style="margin: 0; color: #4a5568; line-height: 1.6;">Treść sekcji. Kliknij aby edytować.</p>
          </div>
        `;
        break;
    }

    document.execCommand('insertHTML', false, blockHtml);
    this.onWysiwygInput();
  }
}
