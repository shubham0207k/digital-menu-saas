import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from "firebase/firestore";
import { db, isMock } from "./config";

// Pre-seeded initial categories
const INITIAL_CATEGORIES = [
  { id: "appetizers", name: "Starters", icon: "Salad" },
  { id: "mains", name: "Mains", icon: "Utensils" },
  { id: "breads", name: "Indian Breads", icon: "Flame" },
  { id: "desserts", name: "Desserts", icon: "IceCream" },
  { id: "beverages", name: "Beverages", icon: "CupSoda" }
];

// Pre-seeded initial menu items
const INITIAL_MENU = [
  {
    id: "item-1",
    name: "Samosa Chaat",
    price: 120.00,
    category: "appetizers",
    description: "Crispy samosas crushed and topped with warm spiced chickpeas, sweet yogurt, tamarind chutney, mint chutney, and fine sev.",
    image: "/assets/samosa_chaat.png",
    tags: ["Vegetarian", "Spicy"],
    calories: 380,
    inStock: true
  },
  {
    id: "item-2",
    name: "Tandoori Malai Broccoli",
    price: 180.00,
    category: "appetizers",
    description: "Fresh broccoli florets marinated in a rich mixture of cream cheese, yogurt, cardamom, and white pepper, grilled to perfection in the tandoor clay oven.",
    image: "/assets/malai_broccoli.png",
    tags: ["Vegetarian", "Gluten-Free"],
    calories: 240,
    inStock: true
  },
  {
    id: "item-3",
    name: "Butter Chicken",
    price: 350.00,
    category: "mains",
    description: "Tender tandoori grilled chicken cooked in a smooth, rich tomato and butter sauce, infused with dried fenugreek leaves (kasuri methi).",
    image: "/assets/butter_chicken.png",
    tags: ["Gluten-Free"],
    calories: 650,
    inStock: true
  },
  {
    id: "item-4",
    name: "Paneer Tikka Masala",
    price: 280.00,
    category: "mains",
    description: "Grilled cottage cheese cubes cooked in a vibrant, spiced tomato and onion gravy with bell peppers and fresh coriander.",
    image: "/assets/paneer_tikka.png",
    tags: ["Vegetarian", "Spicy", "Gluten-Free"],
    calories: 520,
    inStock: true
  },
  {
    id: "item-5",
    name: "Awadhi Dum Biryani",
    price: 320.00,
    category: "mains",
    description: "Fragrant basmati rice layered with spiced vegetables, saffron, and fresh mint, slow-cooked under 'dum' steam in a sealed clay pot.",
    image: "/assets/dum_biryani.png",
    tags: ["Vegetarian", "Gluten-Free"],
    calories: 580,
    inStock: true
  },
  {
    id: "item-6",
    name: "Dal Makhani",
    price: 250.00,
    category: "mains",
    description: "Slow-cooked black lentils and red kidney beans simmered overnight with butter, cream, tomatoes, and a blend of aromatic spices.",
    image: "/assets/dal_makhani.png",
    tags: ["Vegetarian", "Gluten-Free"],
    calories: 410,
    inStock: true
  },
  {
    id: "item-7",
    name: "Garlic Naan",
    price: 60.00,
    category: "breads",
    description: "Soft, leavened flatbread baked in the tandoor clay oven, brushed with minced garlic and melted butter.",
    image: "/assets/garlic_naan.png",
    tags: ["Vegetarian"],
    calories: 280,
    inStock: true
  },
  {
    id: "item-8",
    name: "Lachha Paratha",
    price: 70.00,
    category: "breads",
    description: "Multi-layered, flaky whole wheat flatbread prepared in the tandoor and brushed with ghee.",
    image: "/assets/lachha_paratha.png",
    tags: ["Vegetarian"],
    calories: 310,
    inStock: true
  },
  {
    id: "item-9",
    name: "Zafrani Kulfi",
    price: 110.00,
    category: "desserts",
    description: "Traditional Indian ice cream made from slow-reduced milk, flavored with saffron, cardamom, and chopped pistachios.",
    image: "/assets/zafrani_kulfi.png",
    tags: ["Vegetarian", "Gluten-Free"],
    calories: 320,
    inStock: true
  },
  {
    id: "item-10",
    name: "Gulab Jamun",
    price: 90.00,
    category: "desserts",
    description: "Warm, soft milk-solid dumplings fried golden and soaked in a fragrant rosewater and cardamom sugar syrup.",
    image: "/assets/gulab_jamun.png",
    tags: ["Vegetarian"],
    calories: 380,
    inStock: true
  },
  {
    id: "item-11",
    name: "Mango Cardamom Lassi",
    price: 100.00,
    category: "beverages",
    description: "A creamy, refreshing yogurt beverage blended with sweet mango pulp, a touch of cardamom, and garnished with pistachios.",
    image: "/assets/mango_lassi.png",
    tags: ["Vegetarian", "Gluten-Free"],
    calories: 250,
    inStock: true
  },
  {
    id: "item-12",
    name: "Masala Chai",
    price: 50.00,
    category: "beverages",
    description: "Brewed black tea infused with fresh ginger, crushed cardamom, cloves, and cinnamon, served hot with milk.",
    image: "/assets/masala_chai.png",
    tags: ["Vegetarian", "Gluten-Free"],
    calories: 120,
    inStock: true
  }
];

// Clear stale local storage if it's from the old menu or has old dollar pricing
if (
  localStorage.getItem("menu_items") && 
  (
    localStorage.getItem("menu_items").includes("Truffle Mushroom Risotto") || 
    localStorage.getItem("menu_items").includes('"price":22') ||
    localStorage.getItem("menu_items").includes('"price":10')
  )
) {
  localStorage.removeItem("menu_categories");
  localStorage.removeItem("menu_items");
  localStorage.removeItem("restaurant_orders");
}

// Initialize localStorage if empty
if (!localStorage.getItem("menu_categories")) {
  localStorage.setItem("menu_categories", JSON.stringify(INITIAL_CATEGORIES));
}
if (!localStorage.getItem("menu_items")) {
  localStorage.setItem("menu_items", JSON.stringify(INITIAL_MENU));
}
if (!localStorage.getItem("restaurant_orders")) {
  localStorage.setItem("restaurant_orders", JSON.stringify([]));
}

// Local listeners storage for mock real-time subscription
const mockOrderListeners = new Set();

const triggerMockOrderListeners = () => {
  const currentOrders = JSON.parse(localStorage.getItem("restaurant_orders") || "[]");
  mockOrderListeners.forEach(cb => cb(currentOrders));
};

export const dbService = {
  // --- CATEGORIES ---
  getCategories: async () => {
    if (isMock) {
      return JSON.parse(localStorage.getItem("menu_categories"));
    } else {
      const q = query(collection(db, "categories"));
      const querySnapshot = await getDocs(q);
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return categories;
    }
  },

  addCategory: async (categoryData) => {
    if (isMock) {
      const categories = JSON.parse(localStorage.getItem("menu_categories"));
      const newCategory = { id: categoryData.name.toLowerCase().replace(/\s+/g, '-'), ...categoryData };
      categories.push(newCategory);
      localStorage.setItem("menu_categories", JSON.stringify(categories));
      return newCategory;
    } else {
      const docRef = await addDoc(collection(db, "categories"), categoryData);
      return { id: docRef.id, ...categoryData };
    }
  },

  deleteCategory: async (id) => {
    if (isMock) {
      let categories = JSON.parse(localStorage.getItem("menu_categories"));
      categories = categories.filter(c => c.id !== id);
      localStorage.setItem("menu_categories", JSON.stringify(categories));
    } else {
      await deleteDoc(doc(db, "categories", id));
    }
  },

  // --- MENU ITEMS ---
  getMenuItems: async () => {
    if (isMock) {
      return JSON.parse(localStorage.getItem("menu_items"));
    } else {
      const q = query(collection(db, "menu_items"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    }
  },

  addMenuItem: async (itemData) => {
    if (isMock) {
      const items = JSON.parse(localStorage.getItem("menu_items"));
      const newItem = { id: "item-" + Date.now(), inStock: true, ...itemData };
      items.push(newItem);
      localStorage.setItem("menu_items", JSON.stringify(items));
      return newItem;
    } else {
      const docRef = await addDoc(collection(db, "menu_items"), { ...itemData, inStock: true });
      return { id: docRef.id, ...itemData, inStock: true };
    }
  },

  updateMenuItem: async (id, updates) => {
    if (isMock) {
      const items = JSON.parse(localStorage.getItem("menu_items"));
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        localStorage.setItem("menu_items", JSON.stringify(items));
        return items[index];
      }
      throw new Error("Item not found");
    } else {
      const itemRef = doc(db, "menu_items", id);
      await updateDoc(itemRef, updates);
      return { id, ...updates };
    }
  },

  deleteMenuItem: async (id) => {
    if (isMock) {
      let items = JSON.parse(localStorage.getItem("menu_items"));
      items = items.filter(item => item.id !== id);
      localStorage.setItem("menu_items", JSON.stringify(items));
    } else {
      await deleteDoc(doc(db, "menu_items", id));
    }
  },

  // --- ORDERS ---
  createOrder: async (orderData) => {
    const fullOrder = {
      ...orderData,
      status: "pending", // pending -> preparing -> ready -> completed
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    };

    if (isMock) {
      const orders = JSON.parse(localStorage.getItem("restaurant_orders") || "[]");
      const mockId = "order-" + Math.floor(1000 + Math.random() * 9000);
      const newOrder = { id: mockId, ...fullOrder };
      orders.unshift(newOrder);
      localStorage.setItem("restaurant_orders", JSON.stringify(orders));
      triggerMockOrderListeners();
      return newOrder;
    } else {
      const docRef = await addDoc(collection(db, "orders"), fullOrder);
      return { id: docRef.id, ...fullOrder };
    }
  },

  getOrders: async () => {
    if (isMock) {
      return JSON.parse(localStorage.getItem("restaurant_orders") || "[]");
    } else {
      const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    if (isMock) {
      const orders = JSON.parse(localStorage.getItem("restaurant_orders") || "[]");
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders[index].status = status;
        localStorage.setItem("restaurant_orders", JSON.stringify(orders));
        triggerMockOrderListeners();
        
        // Custom event so active customer tracking sheets can listen to change
        const orderUpdatedEvent = new CustomEvent('order-updated', { detail: orders[index] });
        window.dispatchEvent(orderUpdatedEvent);

        return orders[index];
      }
      throw new Error("Order not found");
    } else {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });
    }
  },

  listenToOrders: (callback) => {
    if (isMock) {
      mockOrderListeners.add(callback);
      // Send initial data
      const currentOrders = JSON.parse(localStorage.getItem("restaurant_orders") || "[]");
      callback(currentOrders);
      return () => {
        mockOrderListeners.delete(callback);
      };
    } else {
      const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
      return onSnapshot(q, (snapshot) => {
        const orders = [];
        snapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        callback(orders);
      });
    }
  },

  getManagers: async () => {
    if (isMock) {
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      return mockUsers.filter(u => u.role === "manager");
    } else {
      const q = query(collection(db, "users"), where("role", "==", "manager"));
      const querySnapshot = await getDocs(q);
      const managers = [];
      querySnapshot.forEach((doc) => {
        managers.push({ id: doc.id, ...doc.data() });
      });
      return managers;
    }
  },

  deleteManager: async (uid) => {
    if (isMock) {
      let mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      mockUsers = mockUsers.filter(u => u.uid !== uid);
      localStorage.setItem("mock_users", JSON.stringify(mockUsers));
    } else {
      await deleteDoc(doc(db, "users", uid));
    }
  }
};
