// Customers Module
const Customers = {
    // Initialize customers page
    init() {
        this.customers = JSON.parse(localStorage.getItem('customers') || '[]');
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.setupEventListeners();
        this.loadCustomers();
    },

    // Setup event listeners
    setupEventListeners() {
        // Add customer button
        const addCustomerBtn = document.getElementById('addCustomerBtn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => this.showModal());
        }

        // Search and filters
        const searchInput = document.getElementById('searchCustomer');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterCustomers());
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterCustomers());
        }

        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => this.filterCustomers());
        }

        // Pagination
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        if (prevPage && nextPage) {
            prevPage.addEventListener('click', () => this.changePage(-1));
            nextPage.addEventListener('click', () => this.changePage(1));
        }

        // Customer form
        const customerForm = document.getElementById('customerForm');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal, [data-dismiss="modal"]').forEach(button => {
            button.addEventListener('click', () => this.hideModals());
        });

        // Delete confirmation
        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deleteCustomer());
        }
    },

    // Show add/edit customer modal
    showModal(customerId = null) {
        const modal = document.getElementById('customerModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('customerForm');

        if (customerId) {
            const customer = this.customers.find(c => c.id === customerId);
            if (customer) {
                modalTitle.textContent = 'Edit Customer';
                form.elements.customerName.value = customer.name;
                form.elements.customerEmail.value = customer.email;
                form.elements.customerPhone.value = customer.phone;
                form.elements.customerCompany.value = customer.company || '';
                form.elements.customerStatus.value = customer.status;
                form.elements.customerNotes.value = customer.notes || '';
                form.dataset.customerId = customerId;
            }
        } else {
            modalTitle.textContent = 'Add Customer';
            form.reset();
            delete form.dataset.customerId;
        }

        modal.classList.add('show');
        document.body.classList.add('modal-open');
    },

    // Hide all modals
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.classList.remove('modal-open');
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const customerId = form.dataset.customerId;

        const customerData = {
            name: form.elements.customerName.value.trim(),
            email: form.elements.customerEmail.value.trim(),
            phone: form.elements.customerPhone.value.trim(),
            company: form.elements.customerCompany.value.trim(),
            status: form.elements.customerStatus.value,
            notes: form.elements.customerNotes.value.trim()
        };

        if (customerId) {
            // Update existing customer
            const index = this.customers.findIndex(c => c.id === customerId);
            if (index !== -1) {
                this.customers[index] = {
                    ...this.customers[index],
                    ...customerData,
                    updatedAt: new Date().toISOString()
                };
                this.showToast('Customer updated successfully', 'success');
            }
        } else {
            // Add new customer
            const newCustomer = {
                id: crypto.randomUUID(),
                ...customerData,
                projects: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.customers.unshift(newCustomer);
            this.showToast('Customer added successfully', 'success');
        }

        this.saveCustomers();
        this.loadCustomers();
        this.hideModals();
    },

    // Show delete confirmation modal
    showDeleteModal(customerId) {
        const modal = document.getElementById('deleteModal');
        modal.dataset.customerId = customerId;
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    },

    // Delete customer
    deleteCustomer() {
        const modal = document.getElementById('deleteModal');
        const customerId = modal.dataset.customerId;
        
        if (customerId) {
            this.customers = this.customers.filter(c => c.id !== customerId);
            this.saveCustomers();
            this.loadCustomers();
            this.showToast('Customer deleted successfully', 'success');
        }
        
        this.hideModals();
    },

    // Filter and sort customers
    filterCustomers() {
        const searchTerm = document.getElementById('searchCustomer').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        let filtered = this.customers.filter(customer => {
            const matchesSearch = 
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm) ||
                customer.company?.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || customer.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        // Sort customers
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        this.currentPage = 1;
        this.displayCustomers(filtered);
    },

    // Display customers with pagination
    displayCustomers(customers) {
        const tbody = document.getElementById('customersTableBody');
        const totalPages = Math.ceil(customers.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedCustomers = customers.slice(start, end);

        // Update pagination buttons
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages || 1}`;

        // Clear table
        tbody.innerHTML = '';

        // Add customers to table
        paginatedCustomers.forEach(customer => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="customer-name">
                        <span class="avatar">${this.getInitials(customer.name)}</span>
                        ${customer.name}
                    </div>
                </td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.company || '-'}</td>
                <td>
                    <span class="status-badge ${customer.status}">
                        ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                </td>
                <td>${customer.projects}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="Edit" onclick="Customers.showModal('${customer.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="Delete" onclick="Customers.showDeleteModal('${customer.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Change page
    changePage(delta) {
        this.currentPage += delta;
        this.loadCustomers();
    },

    // Load customers
    loadCustomers() {
        this.displayCustomers(this.customers);
    },

    // Save customers to localStorage
    saveCustomers() {
        localStorage.setItem('customers', JSON.stringify(this.customers));
    },

    // Get initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    },

    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => Customers.init()); 