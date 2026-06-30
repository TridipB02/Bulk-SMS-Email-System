import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: '#eef2fc',
            backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(167,139,250,0.10) 0%, transparent 35%),
                radial-gradient(circle at 80% 0%, rgba(109,141,245,0.12) 0%, transparent 40%),
                radial-gradient(circle at 50% 100%, rgba(82,194,133,0.08) 0%, transparent 45%)
            `,
        }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Navbar />
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '28px',
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}