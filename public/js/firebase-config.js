// Firebase Configuration for Pet-Portal PWA
// Development mode - simplified configuration

// Mock Firebase services for development
const mockFirebase = {
  db: {
    collection: (name) => ({
      doc: (id) => ({
        set: async (data) => console.log('Mock Firestore set:', { collection: name, id, data }),
        onSnapshot: (callback) => {
          // Mock real-time updates
          setTimeout(() => {
            callback({
              exists: () => true,
              data: () => ({ status: 'mock_status', updatedAt: new Date() })
            });
          }, 1000);
          return () => console.log('Mock unsubscribe');
        }
      })
    })
  },
  messaging: {
    getToken: async () => 'mock-fcm-token',
    onMessage: (callback) => console.log('Mock FCM onMessage registered')
  }
};

// Initialize mock Firebase
const app = mockFirebase;
const db = mockFirebase.db;
const messaging = mockFirebase.messaging;

// Request notification permission
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return 'mock-token';
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
}

// Handle incoming messages
messaging.onMessage((payload) => {
  console.log('Mock message received:', payload);
  
  // Show notification
  if (Notification.permission === 'granted') {
    new Notification('Pet-Portal 🐾', {
      body: '새로운 업데이트가 있습니다.',
      icon: '/icons/icon-192x192.png'
    });
  }
});

// Real-time transaction updates
function subscribeToTransaction(txId, callback) {
  const unsubscribe = db.collection('transactions').doc(txId).onSnapshot(callback);
  return unsubscribe;
}

// Update transaction status
async function updateTransactionStatus(txId, status) {
  try {
    await db.collection('transactions').doc(txId).set({
      status: status,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

// Initialize notifications on app load
document.addEventListener('DOMContentLoaded', () => {
  requestNotificationPermission();
});

// Export for use in other modules
window.firebaseApp = {
  db,
  messaging,
  subscribeToTransaction,
  updateTransactionStatus,
  requestNotificationPermission
};

console.log('Firebase mock initialized for development'); 