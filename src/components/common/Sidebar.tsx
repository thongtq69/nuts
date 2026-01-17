'use client';

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-title">Danh mục</h3>
                <ul className="sidebar-list">
                    <li><a href="#">Tất cả sản phẩm</a></li>
                    <li><a href="#">Hạt dinh dưỡng</a></li>
                    <li><a href="#">Trái cây sấy</a></li>
                    <li><a href="#">Combo quà tặng</a></li>
                </ul>
            </div>

            <div className="sidebar-section">
                <h3 className="sidebar-title">Khoảng giá</h3>
                <div className="price-filter">
                    <label><input type="checkbox" /> Dưới 100k</label>
                    <label><input type="checkbox" /> 100k - 300k</label>
                    <label><input type="checkbox" /> 300k - 500k</label>
                    <label><input type="checkbox" /> Trên 500k</label>
                </div>
            </div>

            <style jsx>{`
        .sidebar {
            width: 250px;
            flex-shrink: 0;
        }
        .sidebar-section {
            margin-bottom: 30px;
        }
        .sidebar-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .sidebar-list li {
            margin-bottom: 10px;
        }
        .sidebar-list a {
            font-size: 14px;
            color: #666;
        }
        .sidebar-list a:hover {
            color: var(--color-primary-brown);
            text-decoration: underline;
        }
        .price-filter label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #666;
            cursor: pointer;
        }
        .price-filter input {
            margin-right: 8px;
        }
      `}</style>
        </aside>
    );
}
