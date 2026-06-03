import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f1f3d 100%)',
        }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Navbar />
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '28px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}