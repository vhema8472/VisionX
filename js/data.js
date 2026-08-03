/* ==========================================
   WORKHUB - MOCK DATA REPOSITORY & API HANDLERS
   ========================================== */

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.VISIONX_API_URL) return window.VISIONX_API_URL;
  if (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
};
const API_BASE_URL = getApiBaseUrl();

const WorkHubData = {
  SESSION_KEY: 'workhub_user_session',
  LOGGED_IN_KEY: 'isLoggedIn',
  BOOKINGS_KEY: 'workhub_user_bookings',

  // Authenticated User Session Profile (Populated via real backend API)
  currentUser: null,

  // 10 Workspace Cards Inventory with Dynamic Time-Slot Availability Schedules
  workspaces: [
    // --- HOT DESKS ---
    {
      id: "WS001",
      name: "Flexi Hot Desk #01",
      type: "hot-desk",
      typeLabel: "Hot Desk",
      location: "Manhattan",
      hubName: "Manhattan Central Hub, NY",
      hourlyPrice: 12,
      dailyPrice: 45,
      capacity: "1 Person",
      availableSeats: 5,
      status: "Available",
      statusType: "available",
      availabilityNote: "🟢 All time slots available now",
      nextAvailable: "09:00 AM",
      rating: 4.8,
      description: "Ergonomic open-plan hot desk with high-speed fiber internet, ambient lighting, and dual power outlets.",
      amenities: ["Wi-Fi", "Power Outlets", "Coffee/Tea", "Lockers"],
      image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "available", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "available", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "available", display: "11:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "available", display: "12:00 PM - 01:00 PM" },
          { start: "13:00", end: "14:00", status: "available", display: "01:00 PM - 02:00 PM" },
          { start: "14:00", end: "15:00", status: "available", display: "02:00 PM - 03:00 PM" },
          { start: "15:00", end: "16:00", status: "available", display: "03:00 PM - 04:00 PM" },
          { start: "16:00", end: "17:00", status: "available", display: "04:00 PM - 05:00 PM" }
        ]
      }
    },
    {
      id: "WS002",
      name: "Premium Hot Desk #04",
      type: "hot-desk",
      typeLabel: "Hot Desk",
      location: "Brooklyn Hub",
      hubName: "Brooklyn Creative Center",
      hourlyPrice: 18,
      dailyPrice: 60,
      capacity: "1 Person",
      availableSeats: 2,
      status: "Partially Booked",
      statusType: "partially-booked",
      availabilityNote: "🟡 Partially Booked • Next Available: 03:00 PM",
      nextAvailable: "03:00 PM",
      rating: 4.7,
      description: "Sunlit communal desk with direct access to artisanal espresso bar and standing desk options.",
      amenities: ["Sunlight", "Espresso Bar", "Wi-Fi", "Community Events"],
      image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "available", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "booked", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "available", display: "11:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "booked", display: "12:00 PM - 01:00 PM" },
          { start: "13:00", end: "14:00", status: "booked", display: "01:00 PM - 02:00 PM" },
          { start: "14:00", end: "15:00", status: "booked", display: "02:00 PM - 03:00 PM" },
          { start: "15:00", end: "16:00", status: "available", display: "03:00 PM - 04:00 PM" },
          { start: "16:00", end: "17:00", status: "available", display: "04:00 PM - 05:00 PM" }
        ]
      }
    },

    // --- DEDICATED DESKS ---
    {
      id: "WS003",
      name: "Executive Dedicated Desk D-02",
      type: "dedicated-desk",
      typeLabel: "Dedicated Desk",
      location: "Midtown East",
      hubName: "Midtown Quiet Zone",
      hourlyPrice: 25,
      dailyPrice: 85,
      capacity: "1 Person",
      availableSeats: 0,
      status: "Currently Occupied",
      statusType: "currently-occupied",
      availabilityNote: "🟠 Currently Booked • Available from 3:00 PM",
      nextAvailable: "03:00 PM",
      rating: 4.9,
      description: "Personal reserved desk in a low-noise zone with 27-inch monitor mount and private lockable drawer.",
      amenities: ["Reserved Desk", "Lockable Drawer", "Monitor Mount", "Wi-Fi"],
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "booked", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "booked", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "booked", display: "11:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "booked", display: "12:00 PM - 01:00 PM" },
          { start: "13:00", end: "14:00", status: "booked", display: "01:00 PM - 02:00 PM" },
          { start: "14:00", end: "15:00", status: "booked", display: "02:00 PM - 03:00 PM" },
          { start: "15:00", end: "16:00", status: "available", display: "03:00 PM - 04:00 PM" },
          { start: "16:00", end: "17:00", status: "available", display: "04:00 PM - 05:00 PM" }
        ]
      }
    },
    {
      id: "WS004",
      name: "Standard Dedicated Desk D-09",
      type: "dedicated-desk",
      typeLabel: "Dedicated Desk",
      location: "San Francisco",
      hubName: "San Francisco Tech Hub",
      hourlyPrice: 20,
      dailyPrice: 75,
      capacity: "1 Person",
      availableSeats: 1,
      status: "Partially Booked",
      statusType: "partially-booked",
      availabilityNote: "🟡 Partially Booked • Booked at 4:00 PM",
      nextAvailable: "09:00 AM",
      rating: 4.6,
      description: "Fixed quiet workspace with high-backed ergonomic leather chair and dedicated storage pedestal.",
      amenities: ["Leather Chair", "Storage Pedestal", "24/7 Access", "Wi-Fi"],
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "available", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "available", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "available", display: "11:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "available", display: "12:00 PM - 01:00 PM" },
          { start: "13:00", end: "14:00", status: "available", display: "01:00 PM - 02:00 PM" },
          { start: "14:00", end: "15:00", status: "available", display: "02:00 PM - 03:00 PM" },
          { start: "16:00", end: "17:00", status: "booked", display: "04:00 PM - 05:00 PM" }
        ]
      }
    },

    // --- PRIVATE CABINS ---
    {
      id: "WS005",
      name: "Executive Private Cabin P-12",
      type: "private-cabin",
      typeLabel: "Private Cabin",
      location: "Downtown District",
      hubName: "Downtown Executive Hub",
      hourlyPrice: 45,
      dailyPrice: 189,
      capacity: "1-2 People",
      availableSeats: 1,
      status: "Partially Booked",
      statusType: "partially-booked",
      availabilityNote: "🟡 Partially Booked • 1 cabin left for 2:00 PM",
      nextAvailable: "14:00 PM",
      rating: 4.9,
      description: "Soundproof glass office featuring motorized standing desk, 4K display screen, and skyline views.",
      amenities: ["Soundproof", "4K Screen", "Motorized Desk", "Coffee/Tea"],
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "booked", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "available", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "booked", display: "11:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "available", display: "12:00 PM - 01:00 PM" },
          { start: "14:00", end: "15:00", status: "available", display: "02:00 PM - 03:00 PM" },
          { start: "15:00", end: "16:00", status: "available", display: "03:00 PM - 04:00 PM" }
        ]
      }
    },
    {
      id: "WS006",
      name: "Team Private Cabin P-08",
      type: "private-cabin",
      typeLabel: "Private Cabin",
      location: "Tech Plaza",
      hubName: "Tech Plaza Innovation Hub",
      hourlyPrice: 85,
      dailyPrice: 320,
      capacity: "4-6 People",
      availableSeats: 0,
      status: "Fully Booked Today",
      statusType: "fully-booked",
      availabilityNote: "🔴 Fully Booked Today • No slots available",
      nextAvailable: "Tomorrow 09:00 AM",
      rating: 4.8,
      description: "Spacious private suite equipped with whiteboards, ergonomic pod seating, and mini fridge.",
      amenities: ["Whiteboard", "Mini Fridge", "Pod Seating", "Wi-Fi"],
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "booked", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "booked", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "booked", display: "11:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "booked", display: "12:00 PM - 01:00 PM" },
          { start: "13:00", end: "14:00", status: "booked", display: "01:00 PM - 02:00 PM" },
          { start: "14:00", end: "15:00", status: "booked", display: "02:00 PM - 03:00 PM" },
          { start: "15:00", end: "16:00", status: "booked", display: "03:00 PM - 04:00 PM" },
          { start: "16:00", end: "17:00", status: "booked", display: "04:00 PM - 05:00 PM" }
        ],
        "2026-08-01": [
          { start: "09:00", end: "10:00", status: "available", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "available", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "available", display: "11:00 AM - 12:00 PM" }
        ]
      }
    },

    // --- MEETING ROOMS ---
    {
      id: "WS007",
      name: "Small Meeting Room Alpha",
      type: "meeting-room",
      typeLabel: "Meeting Room",
      location: "Manhattan",
      hubName: "Manhattan Central Hub",
      hourlyPrice: 75,
      dailyPrice: 280,
      capacity: "4-6 People",
      availableSeats: 4,
      status: "Partially Booked",
      statusType: "partially-booked",
      availabilityNote: "🟡 Booked at 10 AM & 1 PM • Available at 12 PM & 3 PM",
      nextAvailable: "12:00 PM",
      rating: 4.7,
      description: "Intimate huddle room equipped with video conferencing camera and wireless screen sharing.",
      amenities: ["HD Video Cam", "Screen Sharing", "Whiteboard", "AC"],
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "available", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "12:00", status: "booked", display: "10:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "available", display: "12:00 PM - 01:00 PM" },
          { start: "13:00", end: "15:00", status: "booked", display: "01:00 PM - 03:00 PM" },
          { start: "15:00", end: "17:00", status: "available", display: "03:00 PM - 05:00 PM" }
        ]
      }
    },
    {
      id: "WS008",
      name: "Premium Meeting Room B",
      type: "meeting-room",
      typeLabel: "Meeting Room",
      location: "Tech Plaza",
      hubName: "Tech Plaza Hub",
      hourlyPrice: 120,
      dailyPrice: 450,
      capacity: "10-12 People",
      availableSeats: 12,
      status: "Available",
      statusType: "available",
      availabilityNote: "🟢 Available Now for instant booking",
      nextAvailable: "09:00 AM",
      rating: 5.0,
      description: "High-tech boardroom suite with 85-inch video conferencing screen, Surround Audio, and catering.",
      amenities: ["85\" Screen", "Surround Audio", "Catering Service", "Wi-Fi"],
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "09:00", end: "10:00", status: "available", display: "09:00 AM - 10:00 AM" },
          { start: "10:00", end: "11:00", status: "available", display: "10:00 AM - 11:00 AM" },
          { start: "11:00", end: "12:00", status: "available", display: "11:00 AM - 12:00 PM" },
          { start: "12:00", end: "13:00", status: "available", display: "12:00 PM - 01:00 PM" },
          { start: "13:00", end: "14:00", status: "available", display: "01:00 PM - 02:00 PM" },
          { start: "14:00", end: "15:00", status: "available", display: "02:00 PM - 03:00 PM" },
          { start: "15:00", end: "16:00", status: "available", display: "03:00 PM - 04:00 PM" },
          { start: "16:00", end: "17:00", status: "available", display: "04:00 PM - 05:00 PM" }
        ]
      }
    },

    // --- CONFERENCE ROOMS ---
    {
      id: "WS009",
      name: "Business Conference Hall",
      type: "conference-room",
      typeLabel: "Conference Room",
      location: "Downtown District",
      hubName: "Downtown Executive Hub",
      hourlyPrice: 200,
      dailyPrice: 800,
      capacity: "25-30 People",
      availableSeats: 25,
      status: "Currently Occupied",
      statusType: "currently-occupied",
      availabilityNote: "🟠 Booked 10 AM - 2 PM • Next available at 3:00 PM",
      nextAvailable: "03:00 PM",
      rating: 4.9,
      description: "State-of-the-art conference hall with tiered seating, dual projectors, and podium presentation system.",
      amenities: ["Dual Projectors", "Podium", "Wireless Mics", "AC"],
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": [
          { start: "10:00", end: "14:00", status: "booked", display: "10:00 AM - 02:00 PM" },
          { start: "15:00", end: "17:00", status: "available", display: "03:00 PM - 05:00 PM" },
          { start: "17:00", end: "19:00", status: "available", display: "05:00 PM - 07:00 PM" }
        ]
      }
    },
    {
      id: "WS010",
      name: "Grand Auditorium Hall",
      type: "conference-room",
      typeLabel: "Conference Room",
      location: "Brooklyn Hub",
      hubName: "Brooklyn Creative Center",
      hourlyPrice: 250,
      dailyPrice: 950,
      capacity: "50-75 People",
      availableSeats: 0,
      status: "Temporarily Unavailable",
      statusType: "unavailable",
      availabilityNote: "⚪ Temporarily Unavailable for maintenance",
      nextAvailable: "N/A",
      rating: 4.9,
      description: "Expansive event hall equipped with stage lighting, live broadcasting equipment, and green room access.",
      amenities: ["Stage Lighting", "Live Stream Gear", "Green Room", "Catering"],
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80",
      availabilitySchedule: {
        "2026-07-31": []
      }
    }
  ],

  // Initial Bookings Database
  initialBookings: [
    {
      bookingId: "BK20260731-8F4K",
      type: "membership",
      title: "Business Plan Membership",
      planName: "Business Plan",
      workspaceName: "WorkHub Central Executive Suite",
      location: "Manhattan Hub, NY",
      bookingDate: "July 31, 2026",
      timeSlot: "Full Monthly Access (24/7)",
      userName: "Sarah Jenkins",
      userEmail: "sarah.jenkins@cloudscale.ai",
      phone: "+1 (555) 982-1044",
      totalAmount: "$74.00",
      paymentMethod: "Credit Card (VISA **** 9012)",
      status: "Active"
    }
  ]
};

// REST API Placeholder Interface
const API = {
  isAuthenticated() {
    return localStorage.getItem(WorkHubData.LOGGED_IN_KEY) === 'true';
  },

  async loginUser(email, password) {
    if (!email || !password) throw new Error('Email and password required');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(WorkHubData.LOGGED_IN_KEY, 'true');
        if (data.token) {
          localStorage.setItem('token', data.token);
          sessionStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem(WorkHubData.SESSION_KEY, JSON.stringify(data.user));
        }
        return data;
      } else {
        throw new Error(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      if (err.message && !err.message.toLowerCase().includes('fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the server. Please try again later.');
    }
  },

  async adminLogin(email, pin) {
    if (!email || !pin) throw new Error('Admin email and Secret PIN required');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(WorkHubData.LOGGED_IN_KEY, 'true');
        if (data.token) {
          localStorage.setItem('token', data.token);
          sessionStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem(WorkHubData.SESSION_KEY, JSON.stringify(data.user));
        }
        return data;
      } else {
        throw new Error(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      if (err.message && !err.message.toLowerCase().includes('fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the server. Please try again later.');
    }
  },

  async registerUser(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          email: userData.email,
          password: userData.password || 'Password123!',
          phone: userData.phone || ''
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Registration failed.');
      }
    } catch (err) {
      if (err.message && !err.message.toLowerCase().includes('fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the server. Please try again later.');
    }
  },

  async googleSignInUser(googlePayload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googlePayload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(WorkHubData.LOGGED_IN_KEY, 'true');
        if (data.token) {
          localStorage.setItem('token', data.token);
          sessionStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem(WorkHubData.SESSION_KEY, JSON.stringify(data.user));
        }
        return data;
      } else {
        throw new Error(data.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      if (err.message && !err.message.toLowerCase().includes('fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the server. Please try again later.');
    }
  },

  async logoutUser() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
    } catch(e){}
    localStorage.removeItem(WorkHubData.LOGGED_IN_KEY);
    localStorage.removeItem(WorkHubData.SESSION_KEY);
    localStorage.removeItem('token');
    sessionStorage.clear();
    return Promise.resolve({ success: true, message: 'Logged out successfully.' });
  },

  async fetchUserProfile() {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      if (!token) return { success: false, data: null };
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem(WorkHubData.SESSION_KEY, JSON.stringify(data.user));
        return { success: true, data: data.user };
      }
    } catch(e){}

    const stored = localStorage.getItem(WorkHubData.SESSION_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.email) return { success: true, data: user };
      } catch(e){}
    }
    return { success: false, data: null };
  },

  async getUserMemberships() {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      if (!token) return { success: false, memberships: [] };
      const res = await fetch(`${API_BASE_URL}/api/users/me/memberships`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      }
    } catch(e){}
    return { success: false, memberships: [] };
  },

  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      if (!token) throw new Error('Authentication token missing.');

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const storedStr = localStorage.getItem(WorkHubData.SESSION_KEY);
        let storedUser = storedStr ? JSON.parse(storedStr) : {};
        const mergedUser = { ...storedUser, ...data.user, ...profileData };
        localStorage.setItem(WorkHubData.SESSION_KEY, JSON.stringify(mergedUser));
        return { success: true, data: mergedUser, message: 'Profile updated!' };
      } else {
        throw new Error(data.message || 'Failed to update profile.');
      }
    } catch(err) {
      if (err.message && !err.message.toLowerCase().includes('fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the server. Please try again later.');
    }
  },

  async fetchWorkspaces(filters = {}) {
    let result = [...WorkHubData.workspaces];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(w => 
        w.name.toLowerCase().includes(q) || 
        w.location.toLowerCase().includes(q) || 
        w.typeLabel.toLowerCase().includes(q)
      );
    }
    if (filters.type && filters.type !== 'all') {
      result = result.filter(w => w.type.toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.location && filters.location !== 'all') {
      result = result.filter(w => w.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.price && filters.price !== 'all') {
      if (filters.price === 'under-20') result = result.filter(w => w.hourlyPrice < 20);
      else if (filters.price === '20-50') result = result.filter(w => w.hourlyPrice >= 20 && w.hourlyPrice <= 50);
      else if (filters.price === '50-100') result = result.filter(w => w.hourlyPrice >= 50 && w.hourlyPrice <= 100);
      else if (filters.price === 'above-100') result = result.filter(w => w.hourlyPrice > 100);
    }
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'Available Now') {
        result = result.filter(w => w.statusType === 'available' || w.statusType === 'partially-booked');
      } else if (filters.status === 'Limited') {
        result = result.filter(w => w.statusType === 'partially-booked' || w.statusType === 'currently-occupied');
      } else if (filters.status === 'Booked') {
        result = result.filter(w => w.statusType === 'fully-booked');
      }
    }
    if (filters.sort) {
      if (filters.sort === 'price-low') result.sort((a,b) => a.hourlyPrice - b.hourlyPrice);
      else if (filters.sort === 'price-high') result.sort((a,b) => b.hourlyPrice - a.hourlyPrice);
      else if (filters.sort === 'rating') result.sort((a,b) => b.rating - a.rating);
    }
    return Promise.resolve({ success: true, data: result });
  },

  async getWorkspaceById(id) {
    const space = WorkHubData.workspaces.find(w => w.id === id) || WorkHubData.workspaces[0];
    return Promise.resolve({ success: true, data: space });
  },

  async getWorkspaceAvailability(id, dateStr = "2026-07-31") {
    try {
      const res = await fetch(`${API_BASE_URL}/api/workspaces/${id}/availability?date=${dateStr}`);
      const data = await res.json();
      if (data.success && data.schedule) {
        return { success: true, date: dateStr, schedule: data.schedule };
      }
    } catch (e) {}

    const space = WorkHubData.workspaces.find(w => w.id === id) || WorkHubData.workspaces[0];
    const schedule = (space.availabilitySchedule && space.availabilitySchedule[dateStr]) || [
      { start: "09:00", end: "10:00", status: "available", display: "09:00 AM - 10:00 AM" },
      { start: "10:00", end: "11:00", status: "booked", display: "10:00 AM - 11:00 AM" },
      { start: "11:00", end: "12:00", status: "available", display: "11:00 AM - 12:00 PM" },
      { start: "12:00", end: "13:00", status: "available", display: "12:00 PM - 01:00 PM" },
      { start: "13:00", end: "14:00", status: "booked", display: "01:00 PM - 02:00 PM" },
      { start: "14:00", end: "15:00", status: "booked", display: "02:00 PM - 03:00 PM" },
      { start: "15:00", end: "16:00", status: "available", display: "03:00 PM - 04:00 PM" },
      { start: "16:00", end: "17:00", status: "available", display: "04:00 PM - 05:00 PM" }
    ];
    return Promise.resolve({ success: true, date: dateStr, schedule });
  },

  async createBooking(bookingPayload) {
    const bookingId = bookingPayload.bookingId || ('BK' + new Date().toISOString().slice(0,10).replace(/-/g,"") + '-' + Math.random().toString(36).substring(2,7).toUpperCase());
    const sessUser = JSON.parse(localStorage.getItem('workhub_user_session') || '{}');
    const newBooking = {
      bookingId,
      userName: bookingPayload.userName || sessUser.name || 'Member',
      userEmail: bookingPayload.userEmail || sessUser.email || '',
      workspaceName: bookingPayload.workspaceName || bookingPayload.title || 'Executive Desk',
      workspaceType: bookingPayload.workspaceType || bookingPayload.deskType || 'Dedicated Desk',
      bookingDate: bookingPayload.bookingDate || bookingPayload.date || new Date().toISOString().split('T')[0],
      arrivalTime: bookingPayload.arrivalTime || (bookingPayload.timeSlot ? bookingPayload.timeSlot.split('–')[0].trim() : '10:00 AM'),
      duration: bookingPayload.duration || '1 Hour',
      totalPrice: bookingPayload.totalAmount || bookingPayload.subtotal || '$49.50',
      bookingStatus: 'Active',
      paymentStatus: 'Paid',
      ...bookingPayload
    };

    let backendResult = null;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBooking)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        backendResult = result;
        console.log('✅ Booking successfully saved to MongoDB via Express API:', result.booking);
      } else {
        return result;
      }
    } catch (apiErr) {
      console.warn('⚠️ Express backend unreachable, using fallback sync:', apiErr.message);
    }

    // Keep LocalStorage synchronized
    let history = JSON.parse(localStorage.getItem(WorkHubData.BOOKINGS_KEY) || 'null');
    if (!history) history = [...WorkHubData.initialBookings];
    history.unshift(newBooking);
    localStorage.setItem(WorkHubData.BOOKINGS_KEY, JSON.stringify(history));

    // Synchronize Admin Dashboard local store
    try {
      const adminBookings = JSON.parse(localStorage.getItem('workhub_bookings_data') || '[]');
      adminBookings.unshift({
        id: newBooking.bookingId,
        user: newBooking.userName,
        arrivalTime: newBooking.arrivalTime,
        date: newBooking.bookingDate,
        duration: newBooking.duration,
        workspaceType: newBooking.workspaceType,
        space: newBooking.workspaceName,
        status: 'Active'
      });
      localStorage.setItem('workhub_bookings_data', JSON.stringify(adminBookings));
    } catch(e){}

    return backendResult || { success: true, bookingId, booking: newBooking };
  },

  async createPayment(paymentPayload) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentPayload)
      });
      const result = await response.json();
      return result;
    } catch(err) {
      return { success: false, message: err.message };
    }
  },

  async getBookingHistory() {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE_URL}/api/users/me/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings) && data.bookings.length > 0) {
        return { success: true, data: data.bookings };
      }
    } catch (e) {}

    let history = JSON.parse(localStorage.getItem(WorkHubData.BOOKINGS_KEY) || 'null');
    if (!history) {
      history = [...WorkHubData.initialBookings];
      localStorage.setItem(WorkHubData.BOOKINGS_KEY, JSON.stringify(history));
    }
    return Promise.resolve({ success: true, data: history });
  },

  async cancelBooking(bookingId) {
    let history = JSON.parse(localStorage.getItem(WorkHubData.BOOKINGS_KEY) || 'null') || [...WorkHubData.initialBookings];
    history = history.map(b => b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b);
    localStorage.setItem(WorkHubData.BOOKINGS_KEY, JSON.stringify(history));
    return Promise.resolve({ success: true, message: 'Booking cancelled successfully.' });
  }
};
