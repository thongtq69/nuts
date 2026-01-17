'use client';

import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <h2>Oops! Có lỗi xảy ra</h2>
                        <p>Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.</p>
                        <button 
                            onClick={() => this.setState({ hasError: false })}
                            className="retry-button"
                        >
                            Thử lại
                        </button>
                    </div>
                    
                    <style jsx>{`
                        .error-boundary {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 200px;
                            padding: 20px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .error-content {
                            text-align: center;
                            max-width: 400px;
                        }
                        .error-content h2 {
                            color: #dc3545;
                            margin-bottom: 10px;
                        }
                        .error-content p {
                            color: #6c757d;
                            margin-bottom: 20px;
                        }
                        .retry-button {
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        .retry-button:hover {
                            background: #0056b3;
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;