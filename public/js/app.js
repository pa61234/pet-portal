// Pet-Portal PWA Main Application
class PetPortalApp {
  constructor() {
    console.log('🚀 PetPortalApp constructor called');
    this.currentRoute = '/';
    this.listings = [];
    this.searchResults = [];
    
    // Define routes
    this.routes = {
      '/': () => this.showHome(),
      '/l/:id': (route) => this.showListing(route),
      '/checkout': () => this.showCheckout(),
      '/tracking/:id': (route) => this.showTracking(route),
      '/admin/dashboard': () => this.showAdminDashboard()
    };
    
    this.init();
  }

  init() {
    console.log('🔧 PetPortalApp init called');
    this.setupRouting();
    this.navigateToCurrentRoute();
  }

  setupRouting() {
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.navigateToCurrentRoute();
    });

    // Handle internal navigation with event delegation
    document.addEventListener('click', (e) => {
      // Handle navigation links
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        this.navigate(route);
      }
      
      // Handle regular links that should be handled by the app
      if (e.target.matches('a[href^="/"]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        console.log('🔗 Navigation link clicked:', href);
        this.navigate(href);
      }
      
      // Handle search form
      if (e.target.matches('#search-button') || e.target.closest('#search-form')) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
          this.performSearch(searchInput.value.trim());
        }
      }
      
      // Handle add to cart buttons
      if (e.target.matches('.btn-add-to-cart')) {
        const listingId = e.target.getAttribute('data-listing-id');
        if (listingId) {
          console.log('🛒 Add to cart clicked:', listingId);
          this.addToCart(listingId);
        }
      }
      
      // Handle checkout buttons
      if (e.target.matches('.btn-checkout')) {
        const listingId = e.target.getAttribute('data-listing-id');
        if (listingId) {
          console.log('💳 Checkout clicked:', listingId);
          this.proceedToCheckout(listingId);
        }
      }
      
      // Handle payment buttons
      if (e.target.matches('#payment-button')) {
        console.log('💳 Payment button clicked');
        this.processPayment();
      }
      
      // Handle status update buttons
      if (e.target.matches('[data-booking-id]')) {
        const bookingId = e.target.getAttribute('data-booking-id');
        this.updateStatus(bookingId);
      }
    });

    // Handle form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#search-form')) {
        e.preventDefault();
        const query = e.target.querySelector('#search-input').value;
        this.performSearch(query);
      }
      
      if (e.target.matches('#checkout-form')) {
        e.preventDefault();
        this.processPayment();
      }
    });
  }

  navigate(route) {
    this.currentRoute = route;
    history.pushState({}, '', route);
    this.navigateToCurrentRoute();
  }

  navigateToCurrentRoute() {
    const route = window.location.pathname;
    console.log('🧭 Navigating to route:', route);
    
    // Handle dynamic routes
    if (route.startsWith('/l/')) {
      this.showListing(route);
      return;
    }
    
    if (route.startsWith('/tracking/')) {
      this.showTracking(route);
      return;
    }
    
    // Handle static routes
    if (this.routes[route]) {
      this.routes[route](route);
      return;
    }
    
    // Default to home
    console.log('🏠 Defaulting to home');
    this.showHome();
  }

  async showHome() {
    console.log('🏠 showHome called');
    const root = document.getElementById('root');
    root.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <a href="/" class="logo">Pet-Portal 🐾</a>
            <nav>
              <a href="/admin/dashboard" class="btn btn-secondary">관리자</a>
            </nav>
          </div>
        </div>
      </header>

      <div class="search-container">
        <div class="container">
          <form id="search-form" class="search-bar">
            <input 
              type="text" 
              id="search-input" 
              class="search-input" 
              placeholder="지역, 서비스, 가격대를 검색하세요..."
              autocomplete="off"
            >
            <button type="submit" class="search-button">검색</button>
          </form>
        </div>
      </div>

      <main class="container">
        <div id="listings-container" class="loading">
          <div class="spinner"></div>
        </div>
      </main>
    `;

    // Setup search form event listeners after DOM is created
    this.setupSearchForm();
    await this.loadListings();
  }

  setupSearchForm() {
    console.log('🔍 setupSearchForm called');
    const searchForm = document.getElementById('search-form');
    const searchButton = document.querySelector('.search-button');
    
    console.log('📝 searchForm found:', searchForm);
    console.log('🔘 searchButton found:', searchButton);
    
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        console.log('📤 Search form submitted');
        e.preventDefault();
        const query = e.target.querySelector('#search-input').value.trim();
        console.log('🔍 Query from form:', query);
        if (query) {
          this.performSearch(query);
        }
      });
    }
    
    if (searchButton) {
      searchButton.addEventListener('click', (e) => {
        console.log('🔘 Search button clicked');
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        console.log('🔍 Query from button:', query);
        if (query) {
          this.performSearch(query);
        }
      });
    }
  }

  async showListing(route) {
    const listingId = route.split('/l/')[1];
    const root = document.getElementById('root');
    
    root.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <a href="/" class="logo">Pet-Portal 🐾</a>
            <a href="/" class="btn btn-secondary">← 뒤로</a>
          </div>
        </div>
      </header>

      <main class="container">
        <div id="listing-detail" class="loading">
          <div class="spinner"></div>
        </div>
      </main>
    `;

    await this.loadListingDetail(listingId);
  }

  async showCheckout() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <a href="/" class="logo">Pet-Portal 🐾</a>
            <a href="/" class="btn btn-secondary">← 뒤로</a>
          </div>
        </div>
      </header>

      <main class="container">
        <div class="p-8">
          <h1 class="mb-8">결제</h1>
          <div id="checkout-container">
            <div class="loading">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </main>
    `;

    await this.loadCheckout();
  }

  async showTracking(route) {
    const txId = route.split('/tracking/')[1];
    const root = document.getElementById('root');
    
    root.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <a href="/" class="logo">Pet-Portal 🐾</a>
            <a href="/" class="btn btn-secondary">← 뒤로</a>
          </div>
        </div>
      </header>

      <main class="container">
        <div class="p-8">
          <h1 class="mb-8">서비스 진행 상황</h1>
          <div id="tracking-container" class="loading">
            <div class="spinner"></div>
          </div>
        </div>
      </main>
    `;

    await this.loadTracking(txId);
  }

  async showAdminDashboard() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="header-content">
            <a href="/" class="logo">Pet-Portal 🐾</a>
            <a href="/" class="btn btn-secondary">← 뒤로</a>
          </div>
        </div>
      </header>

      <main class="container">
        <div class="p-8">
          <h1 class="mb-8">관리자 대시보드</h1>
          <div id="admin-container" class="loading">
            <div class="spinner"></div>
          </div>
        </div>
      </main>
    `;

    await this.loadAdminDashboard();
  }

  async performSearch(query) {
    console.log('🔍 Search triggered with query:', query);
    const container = document.getElementById('listings-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
      // Simulate API call to Sharetribe Flex
      const listings = await this.searchListings(query);
      console.log('📋 Search results:', listings);
      this.renderListings(listings);
    } catch (error) {
      console.error('❌ Search error:', error);
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="mb-4">검색 중 오류가 발생했습니다.</p>
          <button onclick="location.reload()" class="btn btn-primary">다시 시도</button>
        </div>
      `;
    }
  }

  async loadListings() {
    const container = document.getElementById('listings-container');
    
    try {
      // Simulate API call to Sharetribe Flex
      const listings = await this.getListings();
      this.renderListings(listings);
    } catch (error) {
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="mb-4">서비스 목록을 불러오는 중 오류가 발생했습니다.</p>
          <button onclick="location.reload()" class="btn btn-primary">다시 시도</button>
        </div>
      `;
    }
  }

  renderListings(listings) {
    const container = document.getElementById('listings-container');
    
    if (listings.length === 0) {
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="mb-4">검색 결과가 없습니다.</p>
          <a href="/" class="btn btn-primary">전체 목록 보기</a>
        </div>
      `;
      return;
    }

    const listingsHTML = listings.map(listing => `
      <div class="card">
        <img src="${listing.image || '/images/placeholder.svg'}" alt="${listing.title}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${listing.title}</h3>
          <p class="card-description">${listing.description}</p>
          <div class="card-price">₩${listing.price.toLocaleString()}</div>
          <div class="flex gap-2">
            <a href="/l/${listing.id}" class="btn btn-primary">상세보기</a>
            <button class="btn btn-secondary btn-add-to-cart" data-listing-id="${listing.id}">예약하기</button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="grid grid-3">
        ${listingsHTML}
      </div>
    `;
  }

  async loadListingDetail(listingId) {
    const container = document.getElementById('listing-detail');
    
    try {
      // Simulate API call
      const listing = await this.getListingDetail(listingId);
      
      container.innerHTML = `
        <div class="grid grid-2 gap-8">
          <div>
            <img src="${listing.image || '/images/placeholder.svg'}" alt="${listing.title}" class="card-image">
          </div>
          <div>
            <h1 class="mb-4">${listing.title}</h1>
            <p class="mb-4">${listing.description}</p>
            <div class="card-price mb-4">₩${listing.price.toLocaleString()}</div>
            <div class="mb-4">
              <h3>서비스 포함 사항</h3>
              <ul class="mt-2">
                ${listing.features.map(feature => `<li>• ${feature}</li>`).join('')}
              </ul>
            </div>
            <button class="btn btn-primary btn-checkout" data-listing-id="${listingId}">예약 및 결제</button>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="mb-4">서비스 정보를 불러오는 중 오류가 발생했습니다.</p>
          <a href="/" class="btn btn-primary">홈으로 돌아가기</a>
        </div>
      `;
    }
  }

  async loadCheckout() {
    const container = document.getElementById('checkout-container');
    
    try {
      // Get cart data from localStorage
      const cart = JSON.parse(localStorage.getItem('pet-portal-cart') || '{}');
      
      if (!cart.listingId) {
        container.innerHTML = `
          <div class="text-center p-8">
            <p class="mb-4">예약할 서비스가 없습니다.</p>
            <a href="/" class="btn btn-primary">서비스 찾기</a>
          </div>
        `;
        return;
      }

      const listing = await this.getListingDetail(cart.listingId);
      
      container.innerHTML = `
        <div class="grid grid-2 gap-8">
          <div>
            <h2 class="mb-4">주문 정보</h2>
            <div class="card p-4 mb-4">
              <h3 class="mb-2">${listing.title}</h3>
              <p class="mb-2">${listing.description}</p>
              <div class="card-price">₩${listing.price.toLocaleString()}</div>
            </div>
            
            <form id="checkout-form">
              <div class="form-group">
                <label class="form-label">반려동물 이름</label>
                <input type="text" class="form-input" name="petName" required>
              </div>
              <div class="form-group">
                <label class="form-label">연락처</label>
                <input type="tel" class="form-input" name="phone" required>
              </div>
              <div class="form-group">
                <label class="form-label">주소</label>
                <input type="text" class="form-input" name="address" required>
              </div>
              <div class="form-group">
                <label class="form-label">요청사항</label>
                <textarea class="form-input" name="notes" rows="3"></textarea>
              </div>
            </form>
          </div>
          
          <div>
            <h2 class="mb-4">결제 정보</h2>
            <div class="card p-4">
              <div class="flex justify-between mb-2">
                <span>서비스 요금</span>
                <span>₩${listing.price.toLocaleString()}</span>
              </div>
              <div class="flex justify-between mb-4">
                <span>수수료 (3%)</span>
                <span>₩${Math.round(listing.price * 0.03).toLocaleString()}</span>
              </div>
              <hr class="mb-4">
              <div class="flex justify-between mb-4">
                <strong>총 결제금액</strong>
                <strong>₩${Math.round(listing.price * 1.03).toLocaleString()}</strong>
              </div>
              <button id="payment-button" class="btn btn-primary w-full">결제하기</button>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="mb-4">결제 정보를 불러오는 중 오류가 발생했습니다.</p>
          <a href="/" class="btn btn-primary">홈으로 돌아가기</a>
        </div>
      `;
    }
  }

  async loadTracking(txId) {
    const container = document.getElementById('tracking-container');
    
    try {
      // Simulate real-time tracking data
      const tracking = await this.getTrackingData(txId);
      
      container.innerHTML = `
        <div class="grid grid-2 gap-8">
          <div>
            <h2 class="mb-4">진행 상황</h2>
            <div class="timeline">
              ${tracking.steps.map((step, index) => `
                <div class="timeline-item ${index <= tracking.currentStep ? 'completed' : ''}">
                  <div class="timeline-content">
                    <h4>${step.title}</h4>
                    <p class="text-secondary">${step.description}</p>
                    ${step.timestamp ? `<small>${step.timestamp}</small>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div>
            <h2 class="mb-4">위치 정보</h2>
            <div class="card p-4">
              <div class="flex items-center mb-4">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span class="font-medium">현재 위치: 서울시 강남구 테헤란로 123</span>
              </div>
              <div class="bg-gray-100 rounded-lg p-4 mb-4">
                <div class="text-sm text-gray-600 mb-2">RFID 태그 정보</div>
                <div class="grid grid-2 gap-2 text-xs">
                  <div>태그 ID: <span class="font-mono">RFID-${txId}</span></div>
                  <div>마지막 업데이트: <span>${new Date().toLocaleString()}</span></div>
                  <div>온도: <span>22°C</span></div>
                  <div>습도: <span>45%</span></div>
                </div>
              </div>
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-sm text-blue-800 mb-2">다음 단계 예상 시간</div>
                <div class="text-lg font-medium text-blue-900">약 30분 후 완료 예정</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="mb-4">추적 정보를 불러오는 중 오류가 발생했습니다.</p>
          <a href="/" class="btn btn-primary">홈으로 돌아가기</a>
        </div>
      `;
    }
  }

  async loadAdminDashboard() {
    const container = document.getElementById('admin-container');
    
    try {
      // Simulate admin data
      const dashboard = await this.getAdminData();
      
      container.innerHTML = `
        <div class="grid grid-3 gap-4 mb-8">
          <div class="card p-4">
            <h3>오늘 예약</h3>
            <div class="text-2xl font-bold text-primary">${dashboard.todayBookings}</div>
          </div>
          <div class="card p-4">
            <h3>진행 중</h3>
            <div class="text-2xl font-bold text-warning">${dashboard.inProgress}</div>
          </div>
          <div class="card p-4">
            <h3>완료</h3>
            <div class="text-2xl font-bold text-success">${dashboard.completed}</div>
          </div>
        </div>
        
        <div class="card p-4">
          <h3 class="mb-4">최근 예약</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr>
                  <th class="text-left p-2">예약 ID</th>
                  <th class="text-left p-2">고객</th>
                  <th class="text-left p-2">서비스</th>
                  <th class="text-left p-2">상태</th>
                  <th class="text-left p-2">액션</th>
                </tr>
              </thead>
              <tbody>
                ${dashboard.recentBookings.map(booking => `
                  <tr>
                    <td class="p-2">${booking.id}</td>
                    <td class="p-2">${booking.customer}</td>
                    <td class="p-2">${booking.service}</td>
                    <td class="p-2">
                      <span class="badge badge-${booking.status === 'progress' ? 'warning' : 'success'}">${booking.statusText}</span>
                    </td>
                    <td class="p-2">
                      <button class="btn btn-primary" style="font-size: 0.875rem; padding: 0.25rem 0.5rem;" data-booking-id="${booking.id}">상태 변경</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="text-center p-8">
          <p class="mb-4">대시보드 정보를 불러오는 중 오류가 발생했습니다.</p>
          <button onclick="location.reload()" class="btn btn-primary">다시 시도</button>
        </div>
      `;
    }
  }

  // Mock API methods
  async searchListings(query) {
    console.log('🔎 searchListings called with query:', query);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allListings = [
      {
        id: '1',
        title: '서울 강남 반려동물 화장 서비스',
        description: '전문적인 반려동물 화장 서비스입니다.',
        price: 150000,
        image: '/images/cremation.svg'
      },
      {
        id: '2',
        title: '부산 해운대 반려동물 장례 서비스',
        description: '바다를 바라보는 반려동물 장례 서비스입니다.',
        price: 200000,
        image: '/images/burial.svg'
      },
      {
        id: '3',
        title: '대구 달성 반려동물 추모 서비스',
        description: '추모 공원에서 진행하는 반려동물 장례 서비스입니다.',
        price: 180000,
        image: '/images/memorial.svg'
      }
    ];
    
    console.log('📝 All listings before filter:', allListings);
    
    // Filter listings based on search query
    const filteredListings = allListings.filter(listing => 
      listing.title.toLowerCase().includes(query.toLowerCase()) || 
      listing.description.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log('✅ Filtered listings:', filteredListings);
    return filteredListings;
  }

  async getListings() {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        title: '서울 강남 반려동물 화장 서비스',
        description: '전문적인 반려동물 화장 서비스입니다.',
        price: 150000,
        image: '/images/cremation.svg'
      },
      {
        id: '2',
        title: '부산 해운대 반려동물 장례 서비스',
        description: '바다를 바라보는 반려동물 장례 서비스입니다.',
        price: 200000,
        image: '/images/burial.svg'
      },
      {
        id: '3',
        title: '대구 달성 반려동물 추모 서비스',
        description: '추모 공원에서 진행하는 반려동물 장례 서비스입니다.',
        price: 180000,
        image: '/images/memorial.svg'
      }
    ];
  }

  async getListingDetail(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const listings = {
      '1': {
        id: '1',
        title: '서울 강남 반려동물 화장 서비스',
        description: '전문적인 반려동물 화장 서비스입니다. 최신 장비를 사용하여 안전하고 위생적으로 진행됩니다.',
        price: 150000,
        image: '/images/cremation.svg',
        features: [
          '전문 화장 시설',
          '개별 화장 보장',
          '추모품 제공',
          '전문가 상담'
        ]
      },
      '2': {
        id: '2',
        title: '부산 해운대 반려동물 장례 서비스',
        description: '바다를 바라보는 반려동물 장례 서비스입니다. 아름다운 추모 공원에서 진행됩니다.',
        price: 200000,
        image: '/images/burial.svg',
        features: [
          '해운대 전용 추모 공원',
          '개별 묘지',
          '추모비 설치',
          '정기 관리 서비스'
        ]
      }
    };
    
    return listings[id] || listings['1'];
  }

  async getTrackingData(txId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      currentStep: 2,
      steps: [
        {
          title: '예약 완료',
          description: '서비스 예약이 완료되었습니다.',
          timestamp: '2024-01-15 10:30'
        },
        {
          title: '결제 완료',
          description: '결제가 성공적으로 처리되었습니다.',
          timestamp: '2024-01-15 10:35'
        },
        {
          title: '픽업 준비 중',
          description: '전문가가 출발 준비 중입니다.',
          timestamp: '2024-01-15 11:00'
        },
        {
          title: '픽업 완료',
          description: '반려동물을 안전하게 픽업했습니다.',
          timestamp: null
        },
        {
          title: '서비스 진행 중',
          description: '화장 서비스를 진행 중입니다.',
          timestamp: null
        },
        {
          title: '완료',
          description: '모든 서비스가 완료되었습니다.',
          timestamp: null
        }
      ]
    };
  }

  async getAdminData() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      todayBookings: 12,
      inProgress: 5,
      completed: 8,
      recentBookings: [
        {
          id: 'TX001',
          customer: '김철수',
          service: '화장 서비스',
          status: 'progress',
          statusText: '진행 중'
        },
        {
          id: 'TX002',
          customer: '이영희',
          service: '장례 서비스',
          status: 'completed',
          statusText: '완료'
        }
      ]
    };
  }

  // Cart and payment methods
  addToCart(listingId) {
    localStorage.setItem('pet-portal-cart', JSON.stringify({ listingId }));
    this.navigate('/checkout');
  }

  proceedToCheckout(listingId) {
    this.addToCart(listingId);
  }

  async processPayment() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    // Validate form
    if (!formData.get('petName') || !formData.get('phone') || !formData.get('address')) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      // Simulate payment processing
      const paymentResult = await this.requestPayment(formData);
      
      if (paymentResult.success) {
        // Clear cart
        localStorage.removeItem('pet-portal-cart');
        
        // Redirect to tracking
        this.navigate(`/tracking/${paymentResult.transactionId}`);
      } else {
        alert('결제 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('결제 처리 중 오류가 발생했습니다.');
    }
  }

  async requestPayment(formData) {
    // Simulate Toss Payments API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      transactionId: 'TX' + Date.now()
    };
  }

  updateStatus(bookingId) {
    // Simulate status update
    alert(`${bookingId} 상태가 업데이트되었습니다.`);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  window.app = new PetPortalApp();
  console.log('Pet-Portal app initialized');
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
} else {
  // DOM is already loaded, initialize immediately
  window.app = new PetPortalApp();
  console.log('Pet-Portal app initialized (immediate)');
} 