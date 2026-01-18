'use client';

import { useState } from 'react';

export default function SetupAdminPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const createAdmin = async (force = false) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/seed/admin${force ? '?force=true' : ''}`);
            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ error: 'Failed to create admin account' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            maxWidth: '600px', 
            margin: '50px auto', 
            padding: '30px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h1 style={{ marginBottom: '20px' }}>Setup Admin Account</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => createAdmin(false)}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        background: '#9C7043',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginRight: '10px',
                        fontSize: '16px'
                    }}
                >
                    {loading ? 'Processing...' : 'Create Admin Account'}
                </button>
                
                <button 
                    onClick={() => createAdmin(true)}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Reset Admin Password
                </button>
            </div>

            {result && (
                <div style={{
                    padding: '20px',
                    background: result.error ? '#fee2e2' : '#dcfce7',
                    border: `1px solid ${result.error ? '#dc2626' : '#16a34a'}`,
                    borderRadius: '4px',
                    marginTop: '20px'
                }}>
                    <h3 style={{ marginTop: 0 }}>
                        {result.error ? '❌ Error' : '✅ Success'}
                    </h3>
                    
                    {result.message && (
                        <p><strong>Message:</strong> {result.message}</p>
                    )}
                    
                    {result.email && (
                        <div style={{ 
                            background: 'white', 
                            padding: '15px', 
                            borderRadius: '4px',
                            marginTop: '10px'
                        }}>
                            <p style={{ margin: '5px 0' }}>
                                <strong>Email:</strong> <code>{result.email}</code>
                            </p>
                            <p style={{ margin: '5px 0' }}>
                                <strong>Password:</strong> <code>{result.password}</code>
                            </p>
                        </div>
                    )}
                    
                    {result.note && (
                        <p style={{ 
                            marginTop: '10px', 
                            fontStyle: 'italic',
                            color: '#666'
                        }}>
                            ⚠️ {result.note}
                        </p>
                    )}
                    
                    {result.error && (
                        <p><strong>Details:</strong> {result.details || result.error}</p>
                    )}
                </div>
            )}

            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#f3f4f6',
                borderRadius: '4px'
            }}>
                <h3>Instructions:</h3>
                <ol>
                    <li>Click "Create Admin Account" to create a new admin account</li>
                    <li>If admin already exists, click "Reset Admin Password" to reset</li>
                    <li>Use the credentials shown above to login</li>
                    <li>Login at: <a href="/login" style={{ color: '#9C7043' }}>/login</a></li>
                    <li>Access admin panel at: <a href="/admin" style={{ color: '#9C7043' }}>/admin</a></li>
                </ol>
            </div>
        </div>
    );
}
