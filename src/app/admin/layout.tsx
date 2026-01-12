import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <header className="admin-header">
                    <div className="header-content">
                        <span>Admin Panel</span>
                        {/* Add user info / logout here */}
                    </div>
                </header>
                <main className="admin-content">
                    {children}
                </main>
            </div>
            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
                }
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                }
                .admin-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #f4f6f9;
                }
                .admin-header {
                    background: #fff;
                    padding: 15px 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .admin-content {
                    padding: 30px;
                    flex: 1;
                }
                /* Global Admin Styles */
                h1 { margin-top: 0; color: #333; }
                .card {
                    background: #fff;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    text-align: left;
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                }
                th {
                    background: #f8f9fa;
                    font-weight: 600;
                    color: #555;
                }
                .btn {
                    padding: 8px 16px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    text-decoration: none;
                    display: inline-block;
                }
                .btn-primary { background: #3498db; color: white; }
                .btn-danger { background: #e74c3c; color: white; }
                .btn-success { background: #2ecc71; color: white; }
            `}</style>
        </div>
    );
}
