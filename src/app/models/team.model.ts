export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  permissions: TeamPermission[];
  invitedBy?: string;
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export type TeamMemberStatus = 'active' | 'invited' | 'suspended';

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
  byRole: {
    owner: number;
    admin: number;
    member: number;
    viewer: number;
  };
}
