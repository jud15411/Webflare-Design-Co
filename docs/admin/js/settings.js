// Settings Module
const Settings = {
    // Initialize settings functionality
    init: function() {
        try {
            console.log('Settings module initialized');
            
            // Check authentication first
            if (!this.checkAuth()) {
                console.log('Not authenticated, redirecting to login');
                return;
            }
            
            // Wait for DOM to be fully loaded AND styles to be applied
            document.addEventListener('DOMContentLoaded', () => {
                try {
                    console.log('DOM fully loaded, checking styles...');
                    
                    // Check if styles are loaded
                    const styleCheck = setInterval(() => {
                        const adminNav = document.querySelector('.admin-nav');
                        if (adminNav && adminNav.style.width) {
                            clearInterval(styleCheck);
                            console.log('Styles loaded, initializing header...');
                            
                            // First check if header element exists
                            const headerElement = document.getElementById('header');
                            if (!headerElement) {
                                console.error('Header element not found');
                                throw new Error('Header element not found');
                            }
                            
                            // Load header component
                            fetch('./components/header.html')
                                .then(response => response.text())
                                .then(data => {
                                    // Insert header content
                                    headerElement.innerHTML = data;
                                    
                                    // Wait for styles to be applied
                                    setTimeout(() => {
                                        // Initialize admin functionality
                                        Admin.init();
                                        
                                        // Setup event listeners and load settings
                                        this.setupEventListeners();
                                        this.loadSettings();
                                        
                                        // Apply role-based restrictions
                                        this.checkUserRole();
                                    }, 100); // Small delay to ensure styles are applied
                                })
                                .catch(error => {
                                    console.error('Error loading header component:', error);
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'error-message';
                                    errorDiv.textContent = 'Error loading header component. Please try refreshing the page.';
                                    document.body.appendChild(errorDiv);
                                });
                        }
                    }, 100); // Check every 100ms
                    
                } catch (error) {
                    console.error('Error during DOM initialization:', error);
                    throw error;
                }
            });
            
        } catch (error) {
            console.error('Error initializing settings:', error);
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Error loading settings. Please try refreshing the page.';
            document.body.appendChild(errorDiv);
            return;
        }
    },

    // Check authentication status
    checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Setup event listeners
    setupEventListeners: function() {
        try {
            console.log('Setting up event listeners');
            
            // Handle logo upload
            const logoInput = document.querySelector('#companyLogo');
            if (logoInput) {
                logoInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const preview = document.querySelector('#logoPreview');
                            if (preview) {
                                preview.src = e.target.result;
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    this.backupData();
                });
            }

            // Clear data button
            const clearDataButton = document.getElementById('clearDataButton');
            if (clearDataButton) {
                clearDataButton.addEventListener('click', () => {
                    this.showClearDataConfirmation();
                });
            }

            // File input click handlers
            document.querySelectorAll('.file-input-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    this.handleFileInputClick(e);
                });
            });

            // Modal close buttons
            document.querySelectorAll('.close-modal, [data-dismiss="modal"]').forEach(button => {
                button.addEventListener('click', () => this.hideModals());
            });

            // Confirmation modal
            document.getElementById('confirmActionBtn')?.addEventListener('click', () => this.handleConfirmAction());

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

            // File upload buttons
            document.getElementById('uploadAvatarBtn')?.addEventListener('click', () => document.getElementById('accountAvatar').click());
            document.getElementById('uploadLogoBtn')?.addEventListener('click', () => document.getElementById('companyLogo').click());

            // File input change handlers
            const accountAvatar = document.getElementById('accountAvatar');
            if (accountAvatar) {
                accountAvatar.addEventListener('change', (e) => this.handleImageUpload(e, 'avatarPreview'));
            }

            const companyLogo = document.getElementById('companyLogo');
            if (companyLogo) {
                companyLogo.addEventListener('change', (e) => this.handleImageUpload(e, 'logoPreview'));
            }

            // Username change button
            const changeUsernameBtn = document.getElementById('changeUsernameBtn');
            if (changeUsernameBtn) {
                changeUsernameBtn.addEventListener('click', () => {
                    const usernameInput = document.getElementById('accountUsername');
                    const currentUsername = usernameInput.value;
                    
                    // Show confirmation modal
                    const modal = document.getElementById('confirmationModal');
                    const modalContent = modal.querySelector('.modal-content');
                    
                    modalContent.innerHTML = `
                        <h3>Change Username</h3>
                        <p>Current Username: <strong>${currentUsername}</strong></p>
                        <p>Are you sure you want to change your username?</p>
                        <div class="modal-actions">
                            <button class="btn-secondary" onclick="Settings.hideModals()">Cancel</button>
                            <button class="btn-primary" onclick="Settings.handleUsernameChange('${currentUsername}')">Confirm Change</button>
                        </div>
                    `;
                    
                    modal.style.display = 'block';
                });
            }

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

            // Notification settings form
            const notificationSettingsForm = document.getElementById('notificationSettingsForm');
            if (notificationSettingsForm) {
                notificationSettingsForm.addEventListener('submit', (e) => this.handleNotificationSettingsSubmit(e));
            }

        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
    },

    // Load settings
    loadSettings: function() {
        try {
            this.loadAllSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            throw error;
        }
    },

    // Check user role and apply restrictions
    checkUserRole: function() {
        try {
            console.log('Running checkUserRole function...');
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const role = user.role || 'admin';
            console.log('User role:', role);
            
            // Get all settings sections
            const settingsSections = document.querySelectorAll('.settings-section');
            console.log('Found settings sections:', settingsSections.length);
            settingsSections.forEach(section => {
                const sectionClasses = section.classList;
                console.log('Checking section:', section.id, 'Classes:', sectionClasses);
                
                // Check section types
                const isCompanyInfo = sectionClasses.contains('company-info-section');
                const isNotificationSettings = sectionClasses.contains('notification-settings-section');
                const isDataManagement = sectionClasses.contains('data-management-section');
                console.log('Section types:', { 
                    isCompanyInfo, 
                    isNotificationSettings, 
                    isDataManagement 
                });

                // Remove all role-related classes
                section.classList.remove('hidden', 'disabled', 'cfo-restricted');

                if (role === 'admin') {
                    // Admin can see and edit all settings
                    console.log('Admin role - showing section:', section.id);
                    section.classList.remove('hidden');
                } else if (role === 'cfo') {
                    // CFO can only see company info
                    if (isCompanyInfo) {
                        // Show company info but disable editing
                        console.log('CFO role - showing company info section');
                        section.classList.remove('hidden');
                        section.classList.add('disabled', 'cfo-restricted');
                        
                        // Add disabled message
                        const message = section.querySelector('.disabled-message');
                        if (!message) {
                            const message = document.createElement('div');
                            message.className = 'disabled-message';
                            message.innerHTML = '<i class="fas fa-lock"></i> View only - editing disabled for CFO role';
                            section.insertBefore(message, section.querySelector('.settings-form'));
                        }
                        
                        // Disable all form elements
                        const form = section.querySelector('form');
                        if (form) {
                            form.querySelectorAll('input, textarea, button, select, .file-input-btn').forEach(el => {
                                el.disabled = true;
                                el.style.cursor = 'not-allowed';
                                el.style.opacity = '0.6';
                                el.title = 'View only - editing disabled for CFO role';
                            });
                            
                            // Disable file inputs
                            const fileInputs = section.querySelectorAll('input[type="file"]');
                            fileInputs.forEach(input => {
                                input.disabled = true;
                                input.style.display = 'none';
                                
                                // Add message for file upload
                                const label = input.parentElement.querySelector('label');
                                if (label) {
                                    label.style.cursor = 'not-allowed';
                                    label.title = 'View only - file upload disabled for CFO role';
                                }
                            });
                            
                            // Add visual indication
                            section.style.opacity = '0.8';
                            section.style.pointerEvents = 'none';
                        }
                    } else {
                        // Hide notification settings and data management for CFO
                        console.log('CFO role - hiding section:', section.id);
                        section.classList.add('hidden');
                    }
                } else {
                    // Hide admin-only sections for other roles
                    if (isCompanyInfo) {
                        console.log('Other role - hiding section:', section.id);
                        section.classList.add('hidden');
                    } else {
                        console.log('Other role - showing section:', section.id);
                        section.classList.remove('hidden');
                    }
                }
            });
            
            // Add CFO-specific styles
            if (role === 'cfo') {
                document.body.classList.add('cfo-role');
            }
            
        } catch (error) {
            console.error('Error in checkUserRole:', error);
            throw error;
        }
    },

    // Load all settings from localStorage
    loadAllSettings: function() {
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

    // Handle company settings submission
    handleCompanySubmit: function(e) {
        e.preventDefault();
        const form = e.target;
        const companyData = {
            name: form.companyName.value,
            email: form.companyEmail.value,
            phone: form.companyPhone.value,
            website: form.companyWebsite.value,
            address: form.companyAddress.value,
            logo: form.companyLogo.value
        };
        localStorage.setItem('company', JSON.stringify(companyData));
        this.showToast('Company settings saved successfully', 'success');
    },



    // Handle notification settings submission
    handleNotificationSettingsSubmit: function(e) {
        e.preventDefault();
        const form = e.target;
        const settings = {
            newCustomer: form.notifyNewCustomer.checked,
            newContract: form.notifyNewContract.checked,
            paymentReceived: form.notifyPaymentReceived.checked,
            invoiceOverdue: form.notifyInvoiceOverdue.checked,
            desktop: form.showDesktopNotifications.checked,
            sound: form.showSoundNotifications.checked
        };
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        this.showToast('Notification settings saved successfully', 'success');
    },

    // Handle image upload
    handleImageUpload: function(e, previewId) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    },

    // Handle username change confirmation
    handleUsernameChange: function(currentUsername) {
        try {
            const usernameInput = document.getElementById('accountUsername');
            const newUsername = usernameInput.value.trim();
            
            // Validate new username
            if (!newUsername) {
                this.showToast('Username cannot be empty', 'error');
                return;
            }

            // Check if username is different
            if (newUsername === currentUsername) {
                this.showToast('Username is unchanged', 'warning');
                return;
            }

            // Show confirmation modal
            const modal = document.getElementById('confirmationModal');
            const title = document.getElementById('confirmationTitle');
            const message = document.getElementById('confirmationMessage');
            const confirmButton = document.getElementById('confirmButton');
            const cancelButton = document.getElementById('cancelButton');

            title.textContent = 'Change Username';
            message.innerHTML = `Are you sure you want to change your username to <strong>${newUsername}</strong>?`;
            confirmButton.textContent = 'Change Username';
            confirmButton.onclick = () => {
                // Update username in localStorage
                const account = JSON.parse(localStorage.getItem('account') || '{}');
                account.username = newUsername;
                localStorage.setItem('account', JSON.stringify(account));
                this.showToast('Username changed successfully', 'success');
                this.hideModals();
            };
            cancelButton.onclick = () => this.hideModals();
            modal.classList.add('show');
        } catch (error) {
            console.error('Error handling username change:', error);
            this.showToast('An error occurred while changing username', 'error');
        }
    },

    // Show clear data confirmation
    showClearDataConfirmation: function() {
        const modal = document.getElementById('confirmationModal');
        const title = document.getElementById('confirmationTitle');
        const message = document.getElementById('confirmationMessage');
        const confirmButton = document.getElementById('confirmButton');
        const cancelButton = document.getElementById('cancelButton');

        title.textContent = 'Clear All Data';
        message.innerHTML = 'Are you sure you want to clear all settings data? This action cannot be undone.';
        confirmButton.textContent = 'Clear Data';
        confirmButton.onclick = () => {
            this.clearAllData();
            this.hideModals();
        };
        cancelButton.onclick = () => this.hideModals();
        modal.classList.add('show');
    },

    // Clear all data
    clearAllData: function() {
        localStorage.clear();
        this.showToast('All data has been cleared', 'warning');
    },

    // Handle file input click
    handleFileInputClick: function(e) {
        const input = e.target;
        input.click();
    },

    // Hide modals
    hideModals: function() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    },

    // Show toast message
    showToast: function(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.textContent = message;
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Get toast icon based on type
    getToastIcon: function(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-times-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }
};