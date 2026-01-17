// Translations for Vietnamese language
export const TRANSLATIONS = {
  // Common actions
  SAVE: 'Lưu',
  CANCEL: 'Hủy',
  DELETE: 'Xóa',
  EDIT: 'Sửa',
  UPDATE: 'Cập nhật',
  CREATE: 'Tạo',
  SUBMIT: 'Gửi',
  BACK: 'Quay lại',
  CLOSE: 'Đóng',
  CONFIRM: 'Xác nhận',
  
  // Status messages
  LOADING: 'Đang tải...',
  SAVING: 'Đang lưu...',
  PROCESSING: 'Đang xử lý...',
  SUCCESS: 'Thành công',
  ERROR: 'Lỗi',
  FAILED: 'Thất bại',
  
  // Product related
  PRODUCT_NAME: 'Tên sản phẩm',
  CURRENT_PRICE: 'Giá hiện tại',
  ORIGINAL_PRICE: 'Giá gốc',
  CATEGORY: 'Danh mục',
  DESCRIPTION: 'Mô tả',
  IMAGE: 'Hình ảnh',
  TAGS: 'Thẻ',
  ADD_TO_CART: 'Thêm vào giỏ',
  BUY_NOW: 'Mua ngay',
  
  // Categories
  CATEGORIES: {
    JARS: 'Hũ',
    BAGS: 'Túi', 
    NUTS: 'Hạt',
    BERRIES: 'Quả mọng',
    SEEDS: 'Hạt giống'
  },
  
  // Order status
  ORDER_STATUS: {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    PAID: 'Đã thanh toán'
  },
  
  // Form labels
  FORM: {
    SELECT_CATEGORY: 'Chọn danh mục',
    IMAGE_URL: 'URL hình ảnh',
    TAGS_PLACEHOLDER: 'bán-chạy, mới, khuyến-mãi',
    ENTER_NAME: 'Nhập tên',
    ENTER_EMAIL: 'Nhập email',
    ENTER_PHONE: 'Nhập số điện thoại',
    ENTER_ADDRESS: 'Nhập địa chỉ'
  },
  
  // Messages
  MESSAGES: {
    DELETE_CONFIRM: 'Bạn có chắc chắn muốn xóa?',
    DELETE_PRODUCT_CONFIRM: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
    DELETE_ORDER_CONFIRM: 'Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
    SAVE_SUCCESS: 'Lưu thành công!',
    SAVE_ERROR: 'Lỗi khi lưu',
    DELETE_SUCCESS: 'Xóa thành công!',
    DELETE_ERROR: 'Lỗi khi xóa',
    UPDATE_SUCCESS: 'Cập nhật thành công!',
    UPDATE_ERROR: 'Lỗi khi cập nhật',
    NETWORK_ERROR: 'Lỗi kết nối mạng',
    PERMISSION_DENIED: 'Không có quyền truy cập'
  },
  
  // Admin sections
  ADMIN: {
    DASHBOARD: 'Bảng điều khiển',
    PRODUCTS: 'Sản phẩm',
    ORDERS: 'Đơn hàng',
    USERS: 'Người dùng',
    SETTINGS: 'Cài đặt',
    PACKAGES: 'Gói hội viên',
    BANNERS: 'Banner',
    BLOGS: 'Bài viết',
    STAFF: 'Nhân viên',
    AFFILIATES: 'Cộng tác viên',
    COMMISSIONS: 'Hoa hồng'
  },
  
  // Navigation
  NAV: {
    HOME: 'Trang chủ',
    PRODUCTS: 'Sản phẩm',
    ABOUT: 'Giới thiệu',
    CONTACT: 'Liên hệ',
    CART: 'Giỏ hàng',
    ACCOUNT: 'Tài khoản',
    LOGIN: 'Đăng nhập',
    REGISTER: 'Đăng ký',
    LOGOUT: 'Đăng xuất'
  }
};

// Helper function to get translation
export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = TRANSLATIONS;
  
  for (const k of keys) {
    value = value[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return value;
};