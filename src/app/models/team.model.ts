export interface TeamMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  permissions?: TeamPermission[];
  invitedBy?: string;
  invitedAt?: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
}

export type TeamRole = 'OWNER' | 'ADMIN' | 'USER';

export type TeamMemberStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'INACTIVE' | 'SUSPENDED';

export interface TeamPermission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export type PermissionResource =
  | 'contacts'
  | 'lists'
  | 'campaigns'
  | 'automations'
  | 'templates'
  | 'integrations'
  | 'settings'
  | 'billing';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export interface InviteTeamMemberDTO {
  email: string;
  firstName: string;
  lastName: string;
  role: TeamRole;
  permissions?: TeamPermission[];
}

export interface TeamStatistics {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
}

export interface TeamMembersListResponse {
  members: TeamMember[];
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
}
