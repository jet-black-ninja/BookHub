import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};