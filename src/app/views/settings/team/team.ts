import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { TeamService } from '../../../services/team.service';
import { TeamMember, TeamRole, InviteTeamMemberDTO } from '../../../models/team.model';

@Component({
  selector: 'app-team-settings',
  imports: [CommonModule, FormsModule, NgIcon, TranslateModule],
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
    role: 'member' as TeamRole,
  };

  constructor(private teamService: TeamService) {}

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
    this.teamService.getTeamMembers().pipe(takeUntil(this.destroy$)).subscribe((members) => {
      this.members = members;
      this.reinitializePreline();
    });
  }

  inviteMember() {
    if (!this.inviteForm.email || !this.inviteForm.firstName || !this.inviteForm.lastName) {
      alert('Wypełnij wszystkie pola');
      return;
    }

    const invite: InviteTeamMemberDTO = { ...this.inviteForm };

    this.teamService.inviteTeamMember(invite).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.showInviteModal = false;
      this.resetInviteForm();
      this.loadMembers();
      alert('Zaproszenie wysłane');
    });
  }

  updateRole(memberId: string, role: TeamRole) {
    this.teamService.updateMemberRole(memberId, role).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMembers();
    });
  }

  removeMember(member: TeamMember) {
    if (confirm(`Czy na pewno chcesz usunąć ${member.firstName} ${member.lastName}?`)) {
      this.teamService.removeTeamMember(member.id).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.loadMembers();
      });
    }
  }

  resetInviteForm() {
    this.inviteForm = { email: '', firstName: '', lastName: '', role: 'member' };
  }

  getRoleClass(role: TeamRole): string {
    const classes = {
      owner: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      member: 'bg-green-100 text-green-700',
      viewer: 'bg-gray-100 text-gray-700',
    };
    return classes[role] || 'bg-default-200 text-default-600';
  }

  getStatusClass(status: string): string {
    const classes = {
      active: 'bg-success/10 text-success',
      invited: 'bg-warning/10 text-warning',
      suspended: 'bg-danger/10 text-danger',
    };
    return classes[status as keyof typeof classes] || 'bg-default-200 text-default-600';
  }

  private reinitializePreline() {
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
        (window as any).HSStaticMethods.autoInit();
      }
    }, 100);
  }
}
