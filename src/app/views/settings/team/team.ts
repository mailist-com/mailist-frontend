import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { TeamService } from '../../../services/team.service';
import { ConfirmService } from '../../../services/confirm.service';
import { TeamMember, TeamRole, InviteTeamMemberDTO } from '../../../models/team.model';
import { CustomDropdown, DropdownOption } from '../../../components/custom-dropdown/custom-dropdown';

@Component({
  selector: 'app-team-settings',
  imports: [CommonModule, FormsModule, NgIcon, TranslateModule, CustomDropdown],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class TeamSettings implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  members: TeamMember[] = [];
  showInviteModal = false;

  inviteForm = {
    email: '',
    firstName: '',
    lastName: '',
    role: 'USER' as TeamRole,
  };

  roleOptions: DropdownOption[] = [
    { value: 'USER', label: 'Użytkownik' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  showAlert = false;

  constructor(
    private teamService: TeamService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  ngAfterViewInit() {
    this.reinitializePreline();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMembers() {
    this.teamService.getTeamMembers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (members) => {
        this.members = members;
        this.reinitializePreline();
      },
      error: (error) => {
        this.showAlertMessage('Błąd podczas pobierania członków zespołu', 'error');
        console.error('Error loading members:', error);
      }
    });
  }

  inviteMember() {
    if (!this.inviteForm.email || !this.inviteForm.firstName || !this.inviteForm.lastName) {
      this.showAlertMessage('Wypełnij wszystkie pola', 'error');
      return;
    }

    const invite: InviteTeamMemberDTO = { ...this.inviteForm };

    this.teamService.inviteTeamMember(invite).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showInviteModal = false;
        this.resetInviteForm();
        this.loadMembers();
        this.showAlertMessage('Zaproszenie wysłane pomyślnie', 'success');
      },
      error: (error) => {
        const message = error?.error?.message || 'Błąd podczas wysyłania zaproszenia';
        this.showAlertMessage(message, 'error');
        console.error('Error inviting member:', error);
      }
    });
  }

  updateRole(memberId: number, role: TeamRole) {
    this.teamService.updateMemberRole(memberId, role).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadMembers();
        this.showAlertMessage('Rola została zaktualizowana', 'success');
      },
      error: (error) => {
        const message = error?.error?.message || 'Błąd podczas aktualizacji roli';
        this.showAlertMessage(message, 'error');
        console.error('Error updating role:', error);
      }
    });
  }

  async removeMember(member: TeamMember): Promise<void> {
    const confirmed = await this.confirmService.confirmDanger(
      'Usuń członka zespołu',
      `Czy na pewno chcesz usunąć ${member.firstName} ${member.lastName} z zespołu?`,
      'Usuń',
      'Anuluj'
    );

    if (confirmed) {
      this.teamService.removeTeamMember(member.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.loadMembers();
          this.showAlertMessage('Członek zespołu został usunięty', 'success');
        },
        error: (error) => {
          const message = error?.error?.message || 'Błąd podczas usuwania członka zespołu';
          this.showAlertMessage(message, 'error');
          console.error('Error removing member:', error);
        }
      });
    }
  }

  resetInviteForm() {
    this.inviteForm = { email: '', firstName: '', lastName: '', role: 'USER' };
  }

  showAlertMessage(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  getRoleClass(role: TeamRole): string {
    const classes = {
      OWNER: 'bg-purple-100 text-purple-700',
      ADMIN: 'bg-blue-100 text-blue-700',
      USER: 'bg-green-100 text-green-700',
    };
    return classes[role] || 'bg-default-200 text-default-600';
  }

  getRoleLabel(role: TeamRole): string {
    const labels = {
      OWNER: 'Właściciel',
      ADMIN: 'Administrator',
      USER: 'Użytkownik',
    };
    return labels[role] || role;
  }

  getStatusClass(status: string): string {
    const classes = {
      ACTIVE: 'bg-success/10 text-success',
      PENDING_VERIFICATION: 'bg-warning/10 text-warning',
      INACTIVE: 'bg-gray-100 text-gray-700',
      SUSPENDED: 'bg-danger/10 text-danger',
    };
    return classes[status as keyof typeof classes] || 'bg-default-200 text-default-600';
  }

  getStatusLabel(status: string): string {
    const labels = {
      ACTIVE: 'Aktywny',
      PENDING_VERIFICATION: 'Zaproszony',
      INACTIVE: 'Nieaktywny',
      SUSPENDED: 'Zawieszony',
    };
    return labels[status as keyof typeof labels] || status;
  }

  private reinitializePreline() {
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
        (window as any).HSStaticMethods.autoInit();
      }
    }, 100);
  }
}
