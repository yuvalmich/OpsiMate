import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiRequest } from '../lib/api';
import { User, Role } from '../types';
import { getCurrentUser } from '../lib/auth';
import { ErrorAlert } from '../components/ErrorAlert';
import { useFormErrors } from '../hooks/useFormErrors';
import { Users, FileText, Settings as SettingsIcon } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AddUserModal } from '../components/AddUserModal';

const Settings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { generalError, clearErrors, handleApiResponse } = useFormErrors();
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiRequest<User[]>('/users', 'GET');
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        handleApiResponse(response);
      }
    } catch (error) {
      handleApiResponse({ 
        success: false, 
        error: 'Failed to fetch users' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (email: string, newRole: Role) => {
    setUpdatingUser(email);
    clearErrors();
    
    try {
      const response = await apiRequest('/users/role', 'PATCH', { email, newRole });
      if (response.success) {
        // Update the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.email === email ? { ...user, role: newRole as Role } : user
          )
        );
      } else {
        handleApiResponse(response);
      }
    } catch (error) {
      handleApiResponse({ 
        success: false, 
        error: 'Failed to update user role' 
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleUserCreated = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.Admin: return 'destructive';
      case Role.Editor: return 'default';
      case Role.Viewer: return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your Service Peek configuration and user access.</p>
        </div>

      {generalError && <ErrorAlert message={generalError} className="mb-6" />}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">User Management</h2>
              <p className="text-muted-foreground">Manage user access and permissions for your Service Peek instance.</p>
            </div>
            <Button
              onClick={() => setShowAddUserModal(true)}
              variant="default"
            >
              Add User
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Current Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                        {user.email === currentUser?.email && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            (me)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleUpdate(user.email, newRole as Role)}
                          disabled={updatingUser === user.email || user.email === currentUser?.email}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Role.Viewer}>Viewer</SelectItem>
                            <SelectItem value={Role.Editor}>Editor</SelectItem>
                            <SelectItem value={Role.Admin}>Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Audit Log</h2>
            <p className="text-muted-foreground">View activity logs for all dashboard operations and user actions.</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Audit logs will track all important activities including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>User authentication and login events</li>
                  <li>Provider creation, modification, and deletion</li>
                  <li>Service operations (start, stop, restart)</li>
                  <li>User management actions (create, update roles)</li>
                  <li>Integration configuration changes</li>
                  <li>System configuration modifications</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <strong>Coming Soon:</strong> Audit logging functionality will be available in a future update.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserCreated={handleUserCreated}
      />
      </div>
    </DashboardLayout>
  );
};

export default Settings; 