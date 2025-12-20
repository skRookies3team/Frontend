// API base URL configuration for shopping service
const SHOP_API_BASE_URL = import.meta.env.VITE_SHOP_API_BASE_URL || 'http://localhost:8088';

// Types
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    mileagePrice?: number;
    rating?: number;
    reviews?: number;
    image?: string;
    category?: string;
    features?: string;
    isFavorite?: boolean;
}

export interface CartItem {
    id: number;
    productId: number;
    name: string;
    price: number;
    mileagePrice?: number;
    image?: string;
    category?: string;
    quantity: number;
    subtotal: number;
}

export interface Cart {
    id: number;
    userId: number;
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    productImage?: string;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: number;
    orderNumber: string;
    userId: number;
    recipientName: string;
    recipientPhone: string;
    address: string;
    addressDetail?: string;
    paymentMethod: string;
    totalAmount: number;
    shippingCost: number;
    mileageUsed: number;
    finalAmount: number;
    status: string;
    items: OrderItem[];
    createdAt: string;
}

export interface CreateOrderRequest {
    userId: number;
    recipientName: string;
    recipientPhone: string;
    zipcode?: string;
    address: string;
    addressDetail?: string;
    deliveryMessage?: string;
    paymentMethod: string;
    mileageToUse?: number;
}

// API Functions
export const shopApi = {
    // ========== 상품 API ==========

    // 전체 상품 조회
    getAllProducts: async (userId?: number): Promise<Product[]> => {
        const url = userId
            ? `${SHOP_API_BASE_URL}/api/shopping/products?userId=${userId}`
            : `${SHOP_API_BASE_URL}/api/shopping/products`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    // 카테고리별 상품 조회
    getProductsByCategory: async (category: string, userId?: number): Promise<Product[]> => {
        const url = userId
            ? `${SHOP_API_BASE_URL}/api/shopping/products/category/${category}?userId=${userId}`
            : `${SHOP_API_BASE_URL}/api/shopping/products/category/${category}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products by category');
        return response.json();
    },

    // 상품 상세 조회
    getProductById: async (productId: number, userId?: number): Promise<Product> => {
        const url = userId
            ? `${SHOP_API_BASE_URL}/api/shopping/products/${productId}?userId=${userId}`
            : `${SHOP_API_BASE_URL}/api/shopping/products/${productId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    // ========== 장바구니 API ==========

    // 장바구니 조회
    getCart: async (userId: number): Promise<Cart> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/cart/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch cart');
        return response.json();
    },

    // 장바구니에 상품 추가
    addToCart: async (userId: number, productId: number, quantity: number = 1): Promise<Cart> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/cart/${userId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        return response.json();
    },

    // 장바구니 수량 변경
    updateCartItem: async (userId: number, itemId: number, quantity: number): Promise<Cart> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/cart/${userId}/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) throw new Error('Failed to update cart item');
        return response.json();
    },

    // 장바구니에서 삭제
    removeFromCart: async (userId: number, itemId: number): Promise<Cart> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/cart/${userId}/items/${itemId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove from cart');
        return response.json();
    },

    // 장바구니 비우기
    clearCart: async (userId: number): Promise<void> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/cart/${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to clear cart');
    },

    // ========== 위시리스트 API ==========

    // 위시리스트 조회
    getWishlist: async (userId: number): Promise<Product[]> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/wishlist/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch wishlist');
        return response.json();
    },

    // 위시리스트에 추가
    addToWishlist: async (userId: number, productId: number): Promise<void> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/wishlist/${userId}/products/${productId}`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to add to wishlist');
    },

    // 위시리스트에서 삭제
    removeFromWishlist: async (userId: number, productId: number): Promise<void> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/wishlist/${userId}/products/${productId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove from wishlist');
    },

    // 위시리스트 여부 확인
    isInWishlist: async (userId: number, productId: number): Promise<boolean> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/wishlist/${userId}/products/${productId}/check`);
        if (!response.ok) throw new Error('Failed to check wishlist');
        return response.json();
    },

    // ========== 주문 API ==========

    // 주문 생성
    createOrder: async (request: CreateOrderRequest): Promise<Order> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to create order');
        return response.json();
    },

    // 사용자 주문 목록 조회
    getUserOrders: async (userId: number): Promise<Order[]> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/orders/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    // 주문 상세 조회
    getOrder: async (orderId: number): Promise<Order> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        return response.json();
    },

    // 주문번호로 조회
    getOrderByNumber: async (orderNumber: string): Promise<Order> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/orders/number/${orderNumber}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        return response.json();
    },

    // 주문 취소
    cancelOrder: async (orderId: number): Promise<Order> => {
        const response = await fetch(`${SHOP_API_BASE_URL}/api/shopping/orders/${orderId}/cancel`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to cancel order');
        return response.json();
    },
};
