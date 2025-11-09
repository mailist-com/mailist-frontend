import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  TeamMember,
  InviteTeamMemberDTO,
  TeamStatistics,
  TeamRole,
  TeamMembersListResponse,
} from '../models/team.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/team`;
  private teamMembersSubject = new BehaviorSubject<TeamMember[]>([]);
  public teamMembers$ = this.teamMembersSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all team members
   */
  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMembersListResponse>(`${this.apiUrl}/members`).pipe(
      tap((response) => {
        this.teamMembersSubject.next(response.members);
      }),
      map((response) => response.members),
      catchError((error) => {
        console.error('Error fetching team members:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get team statistics
   */
  getTeamStatistics(): Observable<TeamStatistics> {
    return this.http.get<TeamMembersListResponse>(`${this.apiUrl}/members`).pipe(
      map((response) => ({
        totalMembers: response.totalMembers,
        activeMembers: response.activeMembers,
        pendingInvites: response.pendingInvites,
      })),
      catchError((error) => {
        console.error('Error fetching team statistics:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Invite team member
   */
  inviteTeamMember(invite: InviteTeamMemberDTO): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/members/invite`, invite).pipe(
      tap((newMember) => {
        const currentMembers = this.teamMembersSubject.value;
        this.teamMembersSubject.next([...currentMembers, newMember]);
      }),
      catchError((error) => {
        console.error('Error inviting team member:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update team member role
   */
  updateMemberRole(memberId: number, role: TeamRole): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.apiUrl}/members/${memberId}/role`, { role }).pipe(
      tap((updatedMember) => {
        const currentMembers = this.teamMembersSubject.value;
        const memberIndex = currentMembers.findIndex((m) => m.id === memberId);
        if (memberIndex !== -1) {
          const updatedMembers = [...currentMembers];
          updatedMembers[memberIndex] = updatedMember;
          this.teamMembersSubject.next(updatedMembers);
        }
      }),
      catchError((error) => {
        console.error('Error updating member role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove team member
   */
  removeTeamMember(memberId: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/members/${memberId}`).pipe(
      tap(() => {
        const currentMembers = this.teamMembersSubject.value;
        const filteredMembers = currentMembers.filter((m) => m.id !== memberId);
        this.teamMembersSubject.next(filteredMembers);
      }),
      map(() => true),
      catchError((error) => {
        console.error('Error removing team member:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Resend invitation
   */
  resendInvitation(memberId: number): Observable<boolean> {
    // TODO: Implement when backend endpoint is ready
    console.warn('Resend invitation not yet implemented on backend');
    return throwError(() => new Error('Not implemented'));
  }

  /**
   * Cancel invitation
   */
  cancelInvitation(memberId: number): Observable<boolean> {
    return this.removeTeamMember(memberId);
  }
}
