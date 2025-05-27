// Admin Module
const Admin = {
    // Initialize admin functionality
    init() {
        this.setupEventListeners();
    },

    // Set up event listeners
    setupEventListeners() {
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

            // Report period change
            const reportPeriod = document.getElementById('reportPeriod');
            if (reportPeriod) {
                reportPeriod.addEventListener('change', (e) => {
                    const customDateRange = document.getElementById('customDateRange');
                    if (customDateRange) {
                        customDateRange.style.display = e.target.value === 'custom' ? 'block' : 'none';
                    }
                });
            }
        }
    },

    // Show print modal
    showPrintModal() {
        const modal = document.getElementById('printModal');
        if (modal) {
            modal.classList.add('show');
        }
    },

    // Close print modal
    closePrintModal() {
        const modal = document.getElementById('printModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    // Generate report
    generateReport() {
        const reportPeriod = document.getElementById('reportPeriod').value;
        const includeSummary = document.getElementById('includeSummary').checked;
        const includeCharts = document.getElementById('includeCharts').checked;
        const includeActivity = document.getElementById('includeActivity').checked;

        let startDate, endDate;
        if (reportPeriod === 'custom') {
            startDate = document.getElementById('startDate').value;
            endDate = document.getElementById('endDate').value;
            
            if (!startDate || !endDate) {
                this.showToast('Please select both start and end dates', 'error');
                return;
            }
        }

        // TODO: Implement report generation based on selected options
        this.showToast('Report generation started...', 'info');
        this.closePrintModal();

        // Simulate report generation
        setTimeout(() => {
            this.showToast('Report generated successfully!', 'success');
            // Here you would typically trigger the actual report download
        }, 1500);
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
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format time
    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get relative time
    getRelativeTime(date) {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const now = new Date();
        const diff = new Date(date) - now;
        const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
        
        return rtf.format(diffDays, 'day');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => Admin.init()); 