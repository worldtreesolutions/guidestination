
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Hotel, 
  Home, 
  Settings, 
  LogOut, 
  UserPlus, 
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}

const SidebarItem = ({ href, icon, label, active, badge }: SidebarItemProps) => (
  <Link 
    href={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
      active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
    )}
  >
    {icon}
    <span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
        {badge}
      </span>
    )}
  </Link>
);

export default function Sidebar() {
  const router = useRouter();
  const { signOut, isSuperAdmin } = useAuth();
  
  const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(`${path}/`);

  return (
    <div className="flex h-screen flex-col border-r bg-card px-4 py-6">
      <div className="flex items-center gap-2 px-2">
        <h2 className="text-lg font-semibold">Admin Portal</h2>
      </div>
      
      <div className="mt-8 flex flex-1 flex-col gap-1">
        <SidebarItem 
          href="/dashboard" 
          icon={<Home className="h-4 w-4" />} 
          label="Dashboard" 
          active={isActive('/dashboard')}
        />
        
        <SidebarItem 
          href="/dashboard/activity-providers" 
          icon={<Users className="h-4 w-4" />} 
          label="Activity Providers" 
          active={isActive('/dashboard/activity-providers')}
        />
        
        <SidebarItem 
          href="/dashboard/hotels" 
          icon={<Hotel className="h-4 w-4" />} 
          label="Hotels" 
          active={isActive('/dashboard/hotels')}
        />
        
        <SidebarItem 
          href="/dashboard/notifications" 
          icon={<Bell className="h-4 w-4" />} 
          label="Notifications" 
          active={isActive('/dashboard/notifications')}
        />
        
        {isSuperAdmin && (
          <>
            <div className="mt-6 px-2 py-1">
              <h3 className="text-xs font-medium text-muted-foreground">Admin Controls</h3>
            </div>
            
            <SidebarItem 
              href="/dashboard/users" 
              icon={<UserPlus className="h-4 w-4" />} 
              label="User Management" 
              active={isActive('/dashboard/users')}
            />
            
            <SidebarItem 
              href="/dashboard/settings" 
              icon={<Settings className="h-4 w-4" />} 
              label="Settings" 
              active={isActive('/dashboard/settings')}
            />
          </>
        )}
      </div>
      
      <div className="mt-auto">
        <button 
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
