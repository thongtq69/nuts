import React from 'react';

export default function FeaturesSection() {
    return (
        <section className="features-section">
            <div className="container">
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">
                            <img src="/assets/images/feature1.png" alt="Free Delivery" />
                        </div>
                        <p className="feature-text">Free Home Delivery Across India</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <img src="/assets/images/feature2.png" alt="7 Day Return" />
                        </div>
                        <p className="feature-text">7 Day Return If You&apos;re Not Happy</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <img src="/assets/images/feature3.png" alt="100% Clean" />
                        </div>
                        <p className="feature-text">100% Clean, Nutritious Products</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <img src="/assets/images/feature4.png" alt="5000+ Farmers" />
                        </div>
                        <p className="feature-text">Enabled by 5000+ Farmers</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
