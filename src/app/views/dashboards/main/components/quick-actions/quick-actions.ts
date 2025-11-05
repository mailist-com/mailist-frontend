import { Component } from '@angular/core';
import { NgIcon } from "@ng-icons/core";
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

type QuickAction = {
  icon: string;
  label: string;
  description: string;
  link: string;
  color: string;
};

@Component({
  selector: 'app-quick-actions',
  imports: [NgIcon, RouterLink, CommonModule],
  templateUrl: './quick-actions.html',
  styles: ``
})
export class QuickActions {
  actions: QuickAction[] = [
    {
      icon: "lucideMail",
      label: "Utwórz kampanię",
      description: "Wyślij nową kampanię email",
      link: "/campaigns/create",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: "lucideUserPlus",
      label: "Dodaj kontakty",
      description: "Import lub dodanie nowych kontaktów",
      link: "/contacts/import",
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: "lucideWorkflow",
      label: "Nowa automatyzacja",
      description: "Stwórz workflow automatyzacji",
      link: "/automations/create",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: "lucideNotepadText",
      label: "Nowy szablon",
      description: "Zaprojektuj szablon email",
      link: "/templates/create",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];
}
