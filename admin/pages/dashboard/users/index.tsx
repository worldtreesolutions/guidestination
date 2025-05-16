import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase, getAdminSupabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '../../../lib/utils';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useRouter } from "next/router";
import { User as AuthUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'admin' // Default role
  });
  const { isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only super admins can access this page
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [isSuperAdmin, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch staff users
      const staffResponse = await supabase
        .from("staff")
        .select(`
          user_id,
          created_at, 
          roles (
            name
          )
        `)
        .order("created_at", { referencedTable: "staff", ascending: false });

      const staffData = staffResponse.data;
      const staffFetchError = staffResponse.error;

      if (staffFetchError) throw staffFetchError;

      // Get user details from auth
      const adminSupabase = getAdminSupabase();
      const userIds = staffData?.map(staff => staff.user_id) || [];
      
      let authUsers: AuthUser[] = [];
      if (userIds.length > 0) {
        const listUsersResponse = await adminSupabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000, // Adjust if you have more users
        });
        
        const listUsersResponseData = listUsersResponse.data;
        const authError = listUsersResponse.error;
        
        if (authError) throw authError;
        if (listUsersResponseData) {
          authUsers = listUsersResponseData.users;
        }
      }
      
      const formattedUsers = staffData?.map(staffMember => {
        const authUser = authUsers.find(user => user.id === staffMember.user_id);
        const roleName = 
          staffMember.roles && Array.isArray(staffMember.roles) && staffMember.roles.length > 0 
          ? (staffMember.roles[0] as { name: string })?.name 
          : staffMember.roles && typeof staffMember.roles === "object" && "name" in staffMember.roles 
          // @ts-ignore
          ? (staffMember.roles as { name: string }).name
          : "Unknown";

        return {
          id: staffMember.user_id,
          email: authUser?.email || "Unknown",
          role: roleName,
          created_at: authUser?.created_at || staffMember.created_at || new Date().toISOString()
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setUsers(formattedUsers || []);
    } catch (error: any) {
      toast.error('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create user in auth
      const adminSupabase = getAdminSupabase();
      const createUserResponse = await adminSupabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      });
      
      const createUserDataResponse = createUserResponse.data;
      const authError = createUserResponse.error;
      
      if (authError) throw authError;
      if (!createUserDataResponse || !createUserDataResponse.user) {
        throw new Error("Failed to create user in auth.");
      }
      
      // Get role id
      const roleResponse = await supabase
        .from('roles')
        .select('id')
        .eq('name', newUser.role)
        .single();
        
      const roleData = roleResponse.data;
      const roleError = roleResponse.error;
        
      if (roleError) throw roleError;
      if (!roleData) {
        throw new Error(`Role '${newUser.role}' not found.`);
      }
      
      // Create staff record
      const staffInsertResponse = await supabase
        .from('staff')
        .insert({
          user_id: createUserDataResponse.user.id, 
          role_id: roleData.id
        });
      
      const staffError = staffInsertResponse.error;
        
      if (staffError) throw staffError;
      
      toast.success('User created successfully');
      setNewUser({ email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to create user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="User Management">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6">
                          {loading ? 'Loading...' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Admin User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}