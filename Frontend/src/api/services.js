import API from './axios';

// ─── Service Requests ────────────────────────────────────────────────────────
export const createServiceRequest = (data) => API.post('/requests', data);
export const getMyRequests = () => API.get('/requests/me');
export const getAvailableRequests = () => API.get('/requests/available');
export const getAllRequests = (params) => API.get('/requests', { params });
export const getRequestById = (id) => API.get(`/requests/${id}`);

// ─── Quotes ───────────────────────────────────────────────────────────────────
export const submitQuote = (data) => API.post('/quotes', data);
export const getMyQuotes = () => API.get('/quotes/me');
export const getQuotesForRequest = (id) => API.get(`/quotes/request/${id}`);
export const acceptQuote = (id) => API.put(`/quotes/${id}/accept`);
export const rejectQuote = (id) => API.put(`/quotes/${id}/reject`);
export const updateQuoteStatus = (id, status) => API.put(`/quotes/${id}/status`, { status });

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const getMyBookings = () => API.get('/bookings/me');
export const createBooking = (data) => API.post('/bookings', data);
export const getProviderBookings = () => API.get('/bookings/provider');
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const rateBooking = (id, rating, review) => API.put(`/bookings/${id}/rating`, { rating, review });
export const getAllBookings = () => API.get('/bookings');

// ─── Providers ────────────────────────────────────────────────────────────────
export const getProviderProfile = () => API.get('/providers/me');
export const updateProviderProfile = (data) => API.put('/providers/me', data);
export const getAllProviders = (params) => API.get('/providers', { params });

// ─── Services / Categories ───────────────────────────────────────────────────
export const getServiceCategories = () => API.get('/services');
export const createServiceCategory = (data) => API.post('/services', data);
export const updateServiceCategory = (id, data) => API.put(`/services/${id}`, data);
export const deleteServiceCategory = (id) => API.delete(`/services/${id}`);

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = () => API.get('/auth/admin/stats');
export const getAllUsers = (params) => API.get('/auth/admin/users', { params });
export const updateUserStatus = (id, data) => API.put(`/auth/admin/users/${id}`, data);
