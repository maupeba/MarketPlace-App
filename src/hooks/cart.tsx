import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity + 1 }
            : product,
        ),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productInCart = products.find(item => item.id === id);

      if (productInCart?.quantity === 1) return;

      setProducts(
        products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity - 1 }
            : product,
        ),
      );
      await AsyncStorage.mergeItem(
        '@MarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productExist = products.find(item => item.title === product.title);

      if (productExist) {
        increment(product.id);
        await AsyncStorage.mergeItem(
          '@MarketPlace:products',
          JSON.stringify(products),
        );
        return;
      }
      setProducts([...products, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem(
        '@MarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
