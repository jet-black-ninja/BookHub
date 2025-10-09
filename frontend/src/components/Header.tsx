import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-sm text-gray-500">
            {user?.role === 'ADMIN' ? 'Administrator' : user?.universityId}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(user?.fullName || 'U')}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>

          {/* Logout */}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};