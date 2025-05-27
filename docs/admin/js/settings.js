// Settings Module
const Settings = {
    // Initialize settings page
    init() {
        this.loadSettings();
        this.setupEventListeners();
    },

    // Load all settings from localStorage
    loadSettings() {
        // Load account settings
        const account = JSON.parse(localStorage.getItem('account') || '{}');
        document.getElementById('accountName').value = account.name || '';
        document.getElementById('accountEmail').value = account.email || '';
        document.getElementById('accountPhone').value = account.phone || '';
        
        if (account.avatar) {
            document.getElementById('avatarPreview').src = account.avatar;
        }

        // Load company settings
        const company = JSON.parse(localStorage.getItem('company') || '{}');
        document.getElementById('companyName').value = company.name || '';
        document.getElementById('companyEmail').value = company.email || '';
        document.getElementById('companyPhone').value = company.phone || '';
        document.getElementById('companyWebsite').value = company.website || '';
        document.getElementById('companyAddress').value = company.address || '';
        
        if (company.logo) {
            document.getElementById('logoPreview').src = company.logo;
        }

        // Load invoice settings
        const invoiceSettings = JSON.parse(localStorage.getItem('invoiceSettings') || '{}');
        document.getElementById('defaultTaxRate').value = invoiceSettings.defaultTaxRate || '0';
        document.getElementById('defaultDueDays').value = invoiceSettings.defaultDueDays || '30';
        document.getElementById('invoiceNotes').value = invoiceSettings.defaultNotes || '';
        document.getElementById('paymentInstructions').value = invoiceSettings.paymentInstructions || '';
        document.getElementById('autoSendInvoices').checked = invoiceSettings.autoSend || false;
        document.getElementById('autoReminders').checked = invoiceSettings.autoReminders || false;

        // Load notification settings
        const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        document.getElementById('notifyNewCustomer').checked = notificationSettings.newCustomer || false;
        document.getElementById('notifyNewContract').checked = notificationSettings.newContract || false;
        document.getElementById('notifyPaymentReceived').checked = notificationSettings.paymentReceived || false;
        document.getElementById('notifyInvoiceOverdue').checked = notificationSettings.invoiceOverdue || false;
        document.getElementById('showDesktopNotifications').checked = notificationSettings.desktop || false;
        document.getElementById('showSoundNotifications').checked = notificationSettings.sound || false;
    },

    // Setup event listeners
    setupEventListeners() {
        // Account form
        const accountForm = document.getElementById('accountForm');
        if (accountForm) {
            accountForm.addEventListener('submit', (e) => this.handleAccountSubmit(e));
        }

        // Company form
        const companyForm = document.getElementById('companyForm');
        if (companyForm) {
            companyForm.addEventListener('submit', (e) => this.handleCompanySubmit(e));
        }

        // Invoice settings form
        const invoiceSettingsForm = document.getElementById('invoiceSettingsForm');
        if (invoiceSettingsForm) {
            invoiceSettingsForm.addEventListener('submit', (e) => this.handleInvoiceSettingsSubmit(e));
        }

        // Notification settings form
        const notificationSettingsForm = document.getElementById('notificationSettingsForm');
        if (notificationSettingsForm) {
            notificationSettingsForm.addEventListener('submit', (e) => this.handleNotificationSettingsSubmit(e));
        }

        // File upload buttons
        const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
        if (uploadAvatarBtn) {
            uploadAvatarBtn.addEventListener('click', () => document.getElementById('accountAvatar').click());
        }

        const uploadLogoBtn = document.getElementById('uploadLogoBtn');
        if (uploadLogoBtn) {
            uploadLogoBtn.addEventListener('click', () => document.getElementById('companyLogo').click());
        }

        // File input change handlers
        const accountAvatar = document.getElementById('accountAvatar');
        if (accountAvatar) {
            accountAvatar.addEventListener('change', (e) => this.handleImageUpload(e, 'avatarPreview'));
        }

        const companyLogo = document.getElementById('companyLogo');
        if (companyLogo) {
            companyLogo.addEventListener('change', (e) => this.handleImageUpload(e, 'logoPreview'));
        }

        // Data management buttons
        document.getElementById('exportCustomersBtn')?.addEventListener('click', () => this.exportData('customers'));
        document.getElementById('exportContractsBtn')?.addEventListener('click', () => this.exportData('contracts'));
        document.getElementById('exportInvoicesBtn')?.addEventListener('click', () => this.exportData('invoices'));
        document.getElementById('importCustomersBtn')?.addEventListener('click', () => this.importData('customers'));
        document.getElementById('importContractsBtn')?.addEventListener('click', () => this.importData('contracts'));
        document.getElementById('importInvoicesBtn')?.addEventListener('click', () => this.importData('invoices'));
        document.getElementById('backupDataBtn')?.addEventListener('click', () => this.backupData());
        document.getElementById('restoreDataBtn')?.addEventListener('click', () => this.restoreData());
        document.getElementById('clearDataBtn')?.addEventListener('click', () => this.showClearDataConfirmation());

        // Modal close buttons
        document.querySelectorAll('.close-modal, [data-dismiss="modal"]').forEach(button => {
            button.addEventListener('click', () => this.hideModals());
        });

        // Confirmation modal
        document.getElementById('confirmActionBtn')?.addEventListener('click', () => this.handleConfirmAction());
    },

    // Handle account form submission
    handleAccountSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const accountData = {
            name: form.querySelector('#accountName').value,
            email: form.querySelector('#accountEmail').value,
            phone: form.querySelector('#accountPhone').value,
            avatar: document.getElementById('avatarPreview').src
        };
        localStorage.setItem('account', JSON.stringify(accountData));
        this.showToast('Account settings saved successfully', 'success');
    },

    // Handle company form submission
    handleCompanySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const companyData = {
            name: form.querySelector('#companyName').value,
            email: form.querySelector('#companyEmail').value,
            phone: form.querySelector('#companyPhone').value,
            website: form.querySelector('#companyWebsite').value,
            address: form.querySelector('#companyAddress').value,
            logo: document.getElementById('logoPreview').src
        };
        localStorage.setItem('company', JSON.stringify(companyData));
        this.showToast('Company information saved successfully', 'success');
    },

    // Handle invoice settings form submission
    handleInvoiceSettingsSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const invoiceSettings = {
            defaultTaxRate: form.querySelector('#defaultTaxRate').value,
            defaultDueDays: form.querySelector('#defaultDueDays').value,
            defaultNotes: form.querySelector('#invoiceNotes').value,
            paymentInstructions: form.querySelector('#paymentInstructions').value,
            autoSend: form.querySelector('#autoSendInvoices').checked,
            autoReminders: form.querySelector('#autoReminders').checked
        };
        localStorage.setItem('invoiceSettings', JSON.stringify(invoiceSettings));
        this.showToast('Invoice settings saved successfully', 'success');
    },

    // Handle notification settings form submission
    handleNotificationSettingsSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const notificationSettings = {
            newCustomer: form.querySelector('#notifyNewCustomer').checked,
            newContract: form.querySelector('#notifyNewContract').checked,
            paymentReceived: form.querySelector('#notifyPaymentReceived').checked,
            invoiceOverdue: form.querySelector('#notifyInvoiceOverdue').checked,
            desktop: form.querySelector('#showDesktopNotifications').checked,
            sound: form.querySelector('#showSoundNotifications').checked
        };
        localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
        this.showToast('Notification settings saved successfully', 'success');
    },

    // Handle image upload
    handleImageUpload(e, previewId) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById(previewId).src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    // Export data
    exportData(type) {
        const data = JSON.parse(localStorage.getItem(type) || '[]');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast(`${type} data exported successfully`, 'success');
    },

    // Import data
    importData(type) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        localStorage.setItem(type, JSON.stringify(data));
                        this.showToast(`${type} data imported successfully`, 'success');
                    } catch (error) {
                        this.showToast('Invalid file format', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    },

    // Backup data
    backupData() {
        const backup = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup[key] = localStorage.getItem(key);
        }
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Backup created successfully', 'success');
    },

    // Restore data
    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        localStorage.clear();
                        for (const key in backup) {
                            localStorage.setItem(key, backup[key]);
                        }
                        this.loadSettings();
                        this.showToast('Data restored successfully', 'success');
                    } catch (error) {
                        this.showToast('Invalid backup file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    },

    // Show clear data confirmation
    showClearDataConfirmation() {
        const modal = document.getElementById('confirmationModal');
        const title = document.getElementById('confirmationTitle');
        const message = document.getElementById('confirmationMessage');
        const warning = document.getElementById('confirmationWarning');

        title.textContent = 'Clear All Data';
        message.textContent = 'Are you sure you want to clear all data? This action cannot be undone.';
        warning.style.display = 'block';
        warning.querySelector('span').textContent = 'This will permanently delete all your data. Please make sure you have a backup before proceeding.';

        modal.classList.add('show');
        modal.dataset.action = 'clearData';
    },

    // Handle confirm action
    handleConfirmAction() {
        const modal = document.getElementById('confirmationModal');
        const action = modal.dataset.action;

        if (action === 'clearData') {
            localStorage.clear();
            this.loadSettings();
            this.showToast('All data cleared successfully', 'success');
        }

        this.hideModals();
    },

    // Hide modals
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Get toast icon based on type
    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-times-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => Settings.init()); 