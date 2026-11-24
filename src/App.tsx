import { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PrintBookmarkModal } from './components/PrintBookmarkModal';
import { Storefront } from './components/Storefront';
import { ToastContainer, type ToastMessage } from './components/Toast';
import type {
  AppRoute,
  Book,
  CartItem,
  Category,
  Order,
  OrderStatus,
  StoreSettings,
} from './types/bookstore';
import {
  generateOrderId,
  isAdminAuthenticated,
  loadBooks,
  loadCart,
  loadCategories,
  loadOrders,
  loadSettings,
  saveBooks,
  saveCart,
  saveCategories,
  saveOrders,
  saveSettings,
  setAdminAuthenticated,
} from './utils/storage';

function resolveInitialRoute(): AppRoute {
  if (typeof window !== 'undefined' && window.location.hash === '#admin') {
    return isAdminAuthenticated() ? 'admin-dashboard' : 'admin-login';
  }
  return 'storefront';
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings());

  const [route, setRoute] = useState<AppRoute>(() => resolveInitialRoute());
  const [cartOpen, setCartOpen] = useState(false);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [printBook, setPrintBook] = useState<Book | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Protect admin route on hashchange
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setRoute(isAdminAuthenticated() ? 'admin-dashboard' : 'admin-login');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goToAdmin = () => {
    window.location.hash = 'admin';
    setRoute(isAdminAuthenticated() ? 'admin-dashboard' : 'admin-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStorefront = () => {
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setRoute('storefront');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setAdminAuthenticated(true);
    window.location.hash = 'admin';
    setRoute('admin-dashboard');
    notify('success', 'Berhasil masuk ke Dashboard Admin.');
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setRoute('storefront');
    notify('success', 'Sesi admin telah berakhir.');
  };

  // Cart Handlers
  const handleAddToCart = (book: Book) => {
    if (book.stock <= 0) {
      notify('error', `Stok "${book.title}" sedang habis.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.bookId === book.id);
      let next: CartItem[];
      if (existing) {
        if (existing.quantity >= book.stock) {
          notify('error', `Jumlah "${book.title}" di keranjang sudah mencapai batas stok.`);
          return prev;
        }
        next = prev.map((i) =>
          i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        next = [...prev, { bookId: book.id, quantity: 1 }];
      }
      saveCart(next);
      notify('success', `"${book.title}" ditambahkan ke keranjang.`);
      return next;
    });
  };

  const handleUpdateCartQty = (bookId: string, delta: number) => {
    const book = books.find((b) => b.id === bookId);
    setCart((prev) => {
      const next = prev
        .map((item) => {
          if (item.bookId !== bookId) return item;
          const nextQty = item.quantity + delta;
          if (book && nextQty > book.stock) {
            return { ...item, quantity: book.stock };
          }
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0);
      saveCart(next);
      return next;
    });
  };

  const handleRemoveCartItem = (bookId: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.bookId !== bookId);
      saveCart(next);
      return next;
    });
  };

  const handleCheckoutSubmit = ({
    customerName,
    customerWhatsapp,
    notes,
  }: {
    customerName: string;
    customerWhatsapp: string;
    notes: string;
  }): Order | null => {
    const orderItems = cart
      .map((item) => {
        const book = books.find((b) => b.id === item.bookId);
        if (!book || book.stock < item.quantity) return null;
        return {
          bookId: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          quantity: item.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (orderItems.length === 0 || orderItems.length !== cart.length) {
      return null;
    }

    const totalPrice = orderItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    const newOrder: Order = {
      id: generateOrderId(),
      customerName,
      customerWhatsapp,
      notes,
      items: orderItems,
      totalPrice,
      status: 'Menunggu Konfirmasi',
      createdAt: new Date().toISOString(),
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    saveOrders(nextOrders);

    // Decrement stock in catalog
    const nextBooks = books.map((book) => {
      const ordered = orderItems.find((it) => it.bookId === book.id);
      if (!ordered) return book;
      return { ...book, stock: Math.max(0, book.stock - ordered.quantity) };
    });
    setBooks(nextBooks);
    saveBooks(nextBooks);

    // Clear cart
    setCart([]);
    saveCart([]);

    notify('success', `Pesanan ${newOrder.id} berhasil disimpan!`);
    return newOrder;
  };

  // Admin Product Handlers
  const handleSaveBook = (book: Book, isEdit: boolean) => {
    setBooks((prev) => {
      const next = isEdit
        ? prev.map((b) => (b.id === book.id ? book : b))
        : [book, ...prev];
      saveBooks(next);
      return next;
    });
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => {
      const next = prev.filter((b) => b.id !== bookId);
      saveBooks(next);
      return next;
    });
    setCart((prev) => {
      const next = prev.filter((c) => c.bookId !== bookId);
      saveCart(next);
      return next;
    });
  };

  // Admin Category Handlers
  const handleAddCategory = (name: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
    };
    setCategories((prev) => {
      const next = [...prev, newCat];
      saveCategories(next);
      return next;
    });
  };

  const handleEditCategory = (id: string, newName: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const oldName = target.name;

    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, name: newName } : c));
      saveCategories(next);
      return next;
    });

    // Cascade category rename to all books
    setBooks((prev) => {
      const next = prev.map((b) =>
        b.category === oldName ? { ...b, category: newName } : b
      );
      saveBooks(next);
      return next;
    });
  };

  const handleDeleteCategory = (id: string, reassignToName?: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;

    if (reassignToName) {
      setBooks((prev) => {
        const next = prev.map((b) =>
          b.category === target.name ? { ...b, category: reassignToName } : b
        );
        saveBooks(next);
        return next;
      });
    }

    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCategories(next);
      return next;
    });
  };

  // Admin Order Handlers
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      saveOrders(next);
      return next;
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      saveOrders(next);
      return next;
    });
  };

  // Admin Settings Handler
  const handleSaveSettings = (next: StoreSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  // Route Guard: never render AdminDashboard unless sessionStorage is authenticated
  const isAuth = isAdminAuthenticated();
  const effectiveRoute: AppRoute =
    route === 'admin-dashboard' && !isAuth ? 'admin-login' : route;

  return (
    <div id="app-root">
      {effectiveRoute === 'storefront' && (
        <>
          <Storefront
            books={books}
            categories={categories}
            cart={cart}
            settings={settings}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setCartOpen(true)}
            onSelectBook={(b) => setDetailBook(b)}
            onOpenPrint={(b) => setPrintBook(b)}
            onGoToAdmin={goToAdmin}
          />
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            books={books}
            settings={settings}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onCheckoutSubmit={handleCheckoutSubmit}
          />
          <BookDetailModal
            book={detailBook}
            onClose={() => setDetailBook(null)}
            onAddToCart={handleAddToCart}
            onOpenPrint={(b) => setPrintBook(b)}
          />
          <PrintBookmarkModal
            book={printBook}
            onClose={() => setPrintBook(null)}
          />
        </>
      )}

      {effectiveRoute === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToStore={goToStorefront}
        />
      )}

      {effectiveRoute === 'admin-dashboard' && isAuth && (
        <AdminDashboard
          books={books}
          categories={categories}
          orders={orders}
          settings={settings}
          onSaveBook={handleSaveBook}
          onDeleteBook={handleDeleteBook}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onSaveSettings={handleSaveSettings}
          onGoToStorefront={goToStorefront}
          onLogout={handleLogout}
          onNotify={notify}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
