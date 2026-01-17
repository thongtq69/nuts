'use client';

import { useState, useEffect } from 'react';

interface DebugInfo {
    timestamp: string;
    environment: string;
    mongoUri: string;
    apiUrl: string;
    dbConnection: string;
    productCount: number;
    sampleProducts: any[];
    dbError?: string;
}

export default function ProductDebugInfo() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    const fetchDebugInfo = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/debug');
            const data = await response.json();
            setDebugInfo(data);
        } catch (error) {
            console.error('Failed to fetch debug info:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showDebug) {
            fetchDebugInfo();
        }
    }, [showDebug]);

    if (!showDebug) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setShowDebug(true)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-mono"
                >
                    DEBUG
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-black text-green-400 p-4 rounded-lg max-w-md text-xs font-mono max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-yellow-400 font-bold">DEBUG INFO</h3>
                <button
                    onClick={() => setShowDebug(false)}
                    className="text-red-400 hover:text-red-300"
                >
                    ✕
                </button>
            </div>
            
            {loading ? (
                <div>Loading debug info...</div>
            ) : debugInfo ? (
                <div className="space-y-2">
                    <div><span className="text-blue-400">Environment:</span> {debugInfo.environment}</div>
                    <div><span className="text-blue-400">Timestamp:</span> {debugInfo.timestamp}</div>
                    <div><span className="text-blue-400">MongoDB URI:</span> {debugInfo.mongoUri}</div>
                    <div><span className="text-blue-400">API URL:</span> {debugInfo.apiUrl}</div>
                    <div><span className="text-blue-400">DB Connection:</span> 
                        <span className={debugInfo.dbConnection === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
                            {debugInfo.dbConnection}
                        </span>
                    </div>
                    <div><span className="text-blue-400">Product Count:</span> {debugInfo.productCount}</div>
                    
                    {debugInfo.dbError && (
                        <div className="text-red-400">
                            <span className="text-blue-400">DB Error:</span> {debugInfo.dbError}
                        </div>
                    )}
                    
                    {debugInfo.sampleProducts.length > 0 && (
                        <div>
                            <span className="text-blue-400">Sample Products:</span>
                            <ul className="ml-2 mt-1">
                                {debugInfo.sampleProducts.map((product, index) => (
                                    <li key={index} className="text-xs">
                                        • {product.name} (ID: {product.id})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-red-400">Failed to load debug info</div>
            )}
            
            <button
                onClick={fetchDebugInfo}
                className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                disabled={loading}
            >
                Refresh
            </button>
        </div>
    );
}