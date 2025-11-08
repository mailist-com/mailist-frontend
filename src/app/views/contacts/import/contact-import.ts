import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactListService } from '../../../services/contact-list.service';
import { ContactList, ListImportMapping, ListImportResult } from '../../../models/contact-list.model';

@Component({
  selector: 'app-contact-import',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIcon, PageTitle, TranslatePipe],
  templateUrl: './contact-import.html'
})
export class ContactImport implements OnInit {
  importForm!: FormGroup;
  availableLists$!: Observable<ContactList[]>;
  
  currentStep = 1;
  totalSteps = 4;
  
  uploadedFile: File | null = null;
  csvHeaders: string[] = [];
  csvPreviewData: string[][] = [];
  mappings: ListImportMapping[] = [];
  importResult: ListImportResult | null = null;
  isImporting = false;
  
  contactFields = [
    { key: 'email', label: 'Email Address', required: true },
    { key: 'firstName', label: 'First Name', required: false },
    { key: 'lastName', label: 'Last Name', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'organization', label: 'Organization', required: false }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private contactListService: ContactListService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.availableLists$ = this.contactListService.getLists();
  }

  initForm() {
    this.importForm = this.fb.group({
      selectedList: ['', Validators.required],
      updateExisting: [false],
      sendWelcomeEmail: [true],
      tagToAdd: ['imported']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.uploadedFile = file;
      this.parseCSVFile(file);
    } else {
      alert('Please select a valid CSV file.');
    }
  }

  parseCSVFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      const lines = csvContent.split('\n');
      
      if (lines.length > 0) {
        this.csvHeaders = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        this.csvPreviewData = lines.slice(1, 6).map(line => 
          line.split(',').map(cell => cell.trim().replace(/"/g, ''))
        ).filter(row => row.some(cell => cell.length > 0));
        
        this.initializeMappings();
        this.nextStep();
      }
    };
    reader.readAsText(file);
  }

  initializeMappings() {
    this.mappings = this.contactFields.map(field => ({
      csvColumn: this.findBestMatch(field.key),
      contactField: field.key,
      isCustomField: false
    }));
  }

  findBestMatch(fieldKey: string): string {
    const fieldMappings: { [key: string]: string[] } = {
      'email': ['email', 'e-mail', 'email address', 'mail'],
      'firstName': ['first name', 'firstname', 'fname', 'given name'],
      'lastName': ['last name', 'lastname', 'lname', 'surname', 'family name'],
      'phone': ['phone', 'telephone', 'mobile', 'cell'],
      'organization': ['company', 'organization', 'organisation', 'business']
    };

    const possibleMatches = fieldMappings[fieldKey] || [];
    
    for (const match of possibleMatches) {
      const found = this.csvHeaders.find(header => 
        header.toLowerCase().includes(match.toLowerCase())
      );
      if (found) return found;
    }

    return '';
  }

  updateMapping(fieldKey: string, event: any) {
    const csvColumn = event.target.value;
    const mapping = this.mappings.find(m => m.contactField === fieldKey);
    if (mapping) {
      mapping.csvColumn = csvColumn;
    }
  }

  validateMappings(): boolean {
    const emailMapping = this.mappings.find(m => m.contactField === 'email');
    return emailMapping?.csvColumn ? emailMapping.csvColumn !== '' : false;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  startImport() {
    if (!this.importForm.valid || !this.uploadedFile || !this.validateMappings()) {
      return;
    }

    this.isImporting = true;
    const selectedListId = this.importForm.get('selectedList')?.value;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      
      this.contactListService.importContacts(selectedListId, csvContent, this.mappings)
        .subscribe({
          next: (result) => {
            this.importResult = result;
            this.isImporting = false;
            this.nextStep();
          },
          error: (error) => {
            console.error('Import failed:', error);
            this.isImporting = false;
            alert('Import failed. Please try again.');
          }
        });
    };
    
    reader.readAsText(this.uploadedFile);
  }

  finishImport() {
    this.router.navigate(['/contacts']);
  }

  goBackToContacts() {
    this.router.navigate(['/contacts']);
  }

  downloadErrorReport() {
    if (this.importResult && this.importResult.errors.length > 0) {
      const csvContent = [
        'Row,Email,Error',
        ...this.importResult.errors.map(error => 
          `${error.row},"${error.email}","${error.error}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'import-errors.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  getStepClass(step: number): string {
    if (step < this.currentStep) return 'bg-success text-white';
    if (step === this.currentStep) return 'bg-primary text-white';
    return 'bg-default-200 text-default-600';
  }

  getStepIcon(step: number): string {
    const icons = ['lucideUpload', 'lucideSettings', 'lucidePlay', 'lucideCheck'];
    return icons[step - 1] || 'lucideCircle';
  }

  getMappingValue(fieldKey: string): string {
    const mapping = this.mappings.find(m => m.contactField === fieldKey);
    return mapping?.csvColumn || '';
  }

  isMappingRequired(field: any): boolean {
    const mapping = this.mappings.find(m => m.contactField === field.key);
    return field.required && !mapping?.csvColumn;
  }
}