// Admin Module
const Admin = {
    // Initialize admin functionality
    init() {
        // Check authentication first
        if (!this.checkAuth()) {
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Display user information
        this.displayUserInfo();
        
        // Load settings if we're on the settings page
        if (document.querySelector('.settings-container')) {
            // Check if Settings module is already loaded
            if (typeof Settings !== 'undefined' && typeof Settings.init === 'function') {
                Settings.init();
            } else {
                // Wait for settings.js to load
                const script = document.createElement('script');
                script.src = 'js/settings.js';
                script.onload = () => {
                    if (typeof Settings !== 'undefined' && typeof Settings.init === 'function') {
                        Settings.init();
                    } else {
                        console.error('Settings module not available after loading script');
                    }
                };
                script.onerror = () => {
                    console.error('Failed to load settings.js script');
                };
                document.head.appendChild(script);
            }
        }
        
        // Initialize mobile menu
        this.initMobileMenu();
    },

    // Check authentication status
    checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            // Clear any remaining user data
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Set up event listeners
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Clear localStorage
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                
                // Show logout message
                this.showToast('Logged out successfully!', 'success');
                
                // Redirect to login page
                window.location.href = 'login.html';
            });
        }

        // Print report button
        const printReportBtn = document.getElementById('printReportBtn');
        if (printReportBtn) {
            printReportBtn.addEventListener('click', () => this.showPrintModal());
        }

        // Print modal events
        const printModal = document.getElementById('printModal');
        if (printModal) {
            // Close modal button
            const closeModal = printModal.querySelector('.close-modal');
            if (closeModal) {
                closeModal.addEventListener('click', () => this.closePrintModal());
            }

            // Cancel button
            const cancelPrint = document.getElementById('cancelPrint');
            if (cancelPrint) {
                cancelPrint.addEventListener('click', () => this.closePrintModal());
            }

            // Confirm print button
            const confirmPrint = document.getElementById('confirmPrint');
            if (confirmPrint) {
                confirmPrint.addEventListener('click', () => this.generateReport());
            }

        }
    },

    // Show print modal
    showPrintModal() {
        const modal = document.getElementById('printModal');
        if (modal) {
            modal.style.display = 'block';
        }
    },

    // Close print modal
    closePrintModal() {
        const modal = document.getElementById('printModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Generate report
    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!reportType || !startDate || !endDate) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        try {
            // Get data based on report type
            let data;
            switch (reportType) {
                case 'customers':
                    data = JSON.parse(localStorage.getItem('customers') || '[]');
                    break;
                case 'contracts':
                    data = JSON.parse(localStorage.getItem('contracts') || '[]');
                    break;
                case 'invoices':
                    data = JSON.parse(localStorage.getItem('invoices') || '[]');
                    break;
                default:
                    throw new Error('Invalid report type');
            }

            // Filter data by date range
            const filteredData = data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
            });

            // Generate report content
            const content = this.generateReportContent(filteredData, reportType);

            // Create and show print modal
            this.showPrintModal();
            
            // Create print area
            const printArea = document.createElement('div');
            printArea.className = 'print-area';
            printArea.innerHTML = content;
            document.body.appendChild(printArea);

            // Print when modal is closed
            window.onbeforeunload = () => {
                window.print();
            };

            // Clean up
            window.onafterprint = () => {
                printArea.remove();
                this.closePrintModal();
            };
        } catch (error) {
            console.error('Error generating report:', error);
            this.showToast('Failed to generate report', 'error');
        }
    },

    // Generate report content
    generateReportContent(data, reportType) {
        // TO DO: implement report content generation
        return '';
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            // Trigger reflow
            toast.offsetHeight;
            
            // Show toast
            toast.classList.add('show');
            
            // Remove toast after animation
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    },

    // Format time
    formatTime(date) {
        return new Date(date).toLocaleTimeString();
    },

    // Display user information
    displayUserInfo() {
        const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const userNameElement = document.querySelector('.user-name');
        const userAvatarElement = document.querySelector('.user-avatar');

        if (userNameElement && userAvatarElement && user) {
            // Set username based on role
            userNameElement.textContent = user.role === 'CEO' ? 'CEO' : 'CFO';

            // Set avatar
            if (user.avatar) {
                const img = document.createElement('img');
                img.src = user.avatar;
                img.alt = user.role === 'CEO' ? 'CEO' : 'CFO';
                userAvatarElement.innerHTML = '';
                userAvatarElement.appendChild(img);
            } else {
                // Show initials if no avatar
                const initials = (user.role === 'CEO' ? 'CEO' : 'CFO').split(' ').map(word => word[0]).join('').toUpperCase();
                userAvatarElement.textContent = initials;
            }
        }
    },

    // Get relative time
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (days < 7) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return this.formatDate(date);
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => Admin.init());