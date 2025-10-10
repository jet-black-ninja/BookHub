import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, BookOpen, Clock, IndianRupeeIcon, FolderOpen } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Student Navigation
  const studentLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/books', label: 'Browse Books', icon: BookOpen },
    { path: '/my-borrowings', label: 'My Borrowings', icon: Clock },
    { path: '/my-fines', label: 'My Fines', icon: IndianRupeeIcon },
    { path: '/review', label: 'Submit Review', icon: BookOpen }
  ];

  // Admin Navigation
  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/books', label: 'Manage Books', icon: BookOpen },
    { path: '/admin/categories', label: 'Manage Categories', icon: FolderOpen }
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Library System</h2>
        <p className="text-sm text-gray-500">
          {user?.role === 'ADMIN' ? 'Admin Panel' : 'Student Portal'}
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive(link.path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};