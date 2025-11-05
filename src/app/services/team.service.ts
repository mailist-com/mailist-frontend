import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, throwError } from 'rxjs';
import {
  TeamMember,
  InviteTeamMemberDTO,
  TeamStatistics,
  TeamRole,
} from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private teamMembersSubject = new BehaviorSubject<TeamMember[]>(
    this.getMockTeamMembers()
  );
  public teamMembers$ = this.teamMembersSubject.asObservable();

  constructor() {}

  /**
   * Get all team members
   */
  getTeamMembers(): Observable<TeamMember[]> {
    return of(this.teamMembersSubject.value).pipe(delay(400));
  }

  /**
   * Get team statistics
   */
  getTeamStatistics(): Observable<TeamStatistics> {
    const members = this.teamMembersSubject.value;
    const stats: TeamStatistics = {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.status === 'active').length,
      pendingInvites: members.filter((m) => m.status === 'invited').length,
      byRole: {
        owner: members.filter((m) => m.role === 'owner').length,
        admin: members.filter((m) => m.role === 'admin').length,
        member: members.filter((m) => m.role === 'member').length,
        viewer: members.filter((m) => m.role === 'viewer').length,
      },
    };

    return of(stats).pipe(delay(300));
  }

  /**
   * Invite team member
   */
  inviteTeamMember(invite: InviteTeamMemberDTO): Observable<TeamMember> {
    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      email: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
      role: invite.role,
      status: 'invited',
      permissions: invite.permissions || [],
      invitedAt: new Date(),
      invitedBy: 'user_1',
    };

    const currentMembers = this.teamMembersSubject.value;
    this.teamMembersSubject.next([...currentMembers, newMember]);

    return of(newMember).pipe(delay(800));
  }

  /**
   * Update team member role
   */
  updateMemberRole(memberId: string, role: TeamRole): Observable<TeamMember> {
    const currentMembers = this.teamMembersSubject.value;
    const memberIndex = currentMembers.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
      return throwError(() => new Error('Członek zespołu nie znaleziony'));
    }

    const updatedMember: TeamMember = {
      ...currentMembers[memberIndex],
      role,
    };

    const updatedMembers = [...currentMembers];
    updatedMembers[memberIndex] = updatedMember;
    this.teamMembersSubject.next(updatedMembers);

    return of(updatedMember).pipe(delay(500));
  }

  /**
   * Remove team member
   */
  removeTeamMember(memberId: string): Observable<boolean> {
    const currentMembers = this.teamMembersSubject.value;
    const filteredMembers = currentMembers.filter((m) => m.id !== memberId);

    if (filteredMembers.length === currentMembers.length) {
      return throwError(() => new Error('Członek zespołu nie znaleziony'));
    }

    this.teamMembersSubject.next(filteredMembers);
    return of(true).pipe(delay(500));
  }

  /**
   * Resend invitation
   */
  resendInvitation(memberId: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  /**
   * Cancel invitation
   */
  cancelInvitation(memberId: string): Observable<boolean> {
    return this.removeTeamMember(memberId);
  }

  /**
   * Get mock team members
   */
  private getMockTeamMembers(): TeamMember[] {
    return [
      {
        id: 'member_1',
        email: 'jan.kowalski@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        avatar: 'https://ui-avatars.com/api/?name=Jan+Kowalski',
        role: 'owner',
        status: 'active',
        permissions: [],
        invitedAt: new Date('2024-01-15'),
        joinedAt: new Date('2024-01-15'),
        lastActiveAt: new Date('2025-11-05T10:30:00'),
      },
      {
        id: 'member_2',
        email: 'anna.nowak@example.com',
        firstName: 'Anna',
        lastName: 'Nowak',
        avatar: 'https://ui-avatars.com/api/?name=Anna+Nowak',
        role: 'admin',
        status: 'active',
        permissions: [],
        invitedBy: 'member_1',
        invitedAt: new Date('2024-03-10'),
        joinedAt: new Date('2024-03-11'),
        lastActiveAt: new Date('2025-11-05T09:15:00'),
      },
      {
        id: 'member_3',
        email: 'piotr.wisniewski@example.com',
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        avatar: 'https://ui-avatars.com/api/?name=Piotr+Wisniewski',
        role: 'member',
        status: 'active',
        permissions: [],
        invitedBy: 'member_1',
        invitedAt: new Date('2024-06-20'),
        joinedAt: new Date('2024-06-21'),
        lastActiveAt: new Date('2025-11-04T16:45:00'),
      },
      {
        id: 'member_4',
        email: 'maria.kowalczyk@example.com',
        firstName: 'Maria',
        lastName: 'Kowalczyk',
        role: 'member',
        status: 'invited',
        permissions: [],
        invitedBy: 'member_1',
        invitedAt: new Date('2025-10-28'),
      },
    ];
  }
}
