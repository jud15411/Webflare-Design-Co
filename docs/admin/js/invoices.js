// Invoices Module
const Invoices = {
    // Initialize invoices page
    init() {
        this.invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        this.customers = JSON.parse(localStorage.getItem('customers') || '[]');
        this.contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.setupEventListeners();
        this.populateFilters();
        this.loadInvoices();
        this.updateSummaryCards();
    },

    // Setup event listeners
    setupEventListeners() {
        // Add invoice button
        const addInvoiceBtn = document.getElementById('addInvoiceBtn');
        if (addInvoiceBtn) {
            addInvoiceBtn.addEventListener('click', () => this.showModal());
        }

        // Search and filters
        const searchInput = document.getElementById('searchInvoice');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterInvoices());
        }

        const customerFilter = document.getElementById('customerFilter');
        if (customerFilter) {
            customerFilter.addEventListener('change', () => this.filterInvoices());
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterInvoices());
        }

        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => this.filterInvoices());
        }

        // Pagination
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        if (prevPage && nextPage) {
            prevPage.addEventListener('click', () => this.changePage(-1));
            nextPage.addEventListener('click', () => this.changePage(1));
        }

        // Invoice form
        const invoiceForm = document.getElementById('invoiceForm');
        if (invoiceForm) {
            invoiceForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Customer selection change
        const invoiceCustomer = document.getElementById('invoiceCustomer');
        if (invoiceCustomer) {
            invoiceCustomer.addEventListener('change', (e) => this.updateContractOptions(e.target.value));
        }

        // Add item button
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addItem());
        }

        // Tax rate change
        const taxRate = document.getElementById('taxRate');
        if (taxRate) {
            taxRate.addEventListener('input', () => this.calculateTotals());
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal, [data-dismiss="modal"]').forEach(button => {
            button.addEventListener('click', () => this.hideModals());
        });

        // Delete confirmation
        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deleteInvoice());
        }

        // View invoice actions
        const editInvoiceBtn = document.getElementById('editInvoiceBtn');
        if (editInvoiceBtn) {
            editInvoiceBtn.addEventListener('click', () => {
                const invoiceId = document.getElementById('viewInvoiceModal').dataset.invoiceId;
                this.hideModals();
                this.showModal(invoiceId);
            });
        }

        const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
        if (downloadInvoiceBtn) {
            downloadInvoiceBtn.addEventListener('click', () => {
                const invoiceId = document.getElementById('viewInvoiceModal').dataset.invoiceId;
                this.downloadInvoice(invoiceId);
            });
        }

        const sendInvoiceBtn = document.getElementById('sendInvoiceBtn');
        if (sendInvoiceBtn) {
            sendInvoiceBtn.addEventListener('click', () => {
                const invoiceId = document.getElementById('viewInvoiceModal').dataset.invoiceId;
                this.sendInvoice(invoiceId);
            });
        }
    },

    // Populate filters
    populateFilters() {
        const customerFilter = document.getElementById('customerFilter');
        const invoiceCustomer = document.getElementById('invoiceCustomer');

        if (customerFilter && invoiceCustomer) {
            const customers = this.customers.map(customer => `
                <option value="${customer.id}">${customer.name}</option>
            `).join('');

            customerFilter.innerHTML += customers;
            invoiceCustomer.innerHTML += customers;
        }
    },

    // Update contract options based on selected customer
    updateContractOptions(customerId) {
        const contractSelect = document.getElementById('invoiceContract');
        if (contractSelect) {
            contractSelect.innerHTML = '<option value="">Select Contract</option>';
            
            if (customerId) {
                const customerContracts = this.contracts.filter(
                    contract => contract.customerId === customerId && 
                    ['active', 'pending'].includes(contract.status)
                );

                const options = customerContracts.map(contract => `
                    <option value="${contract.id}">${contract.project}</option>
                `).join('');

                contractSelect.innerHTML += options;
            }
        }
    },

    // Show add/edit invoice modal
    showModal(invoiceId = null) {
        const modal = document.getElementById('invoiceModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('invoiceForm');

        if (invoiceId) {
            const invoice = this.invoices.find(i => i.id === invoiceId);
            if (invoice) {
                modalTitle.textContent = 'Edit Invoice';
                form.elements.invoiceCustomer.value = invoice.customerId;
                this.updateContractOptions(invoice.customerId);
                form.elements.invoiceContract.value = invoice.contractId || '';
                form.elements.invoiceDate.value = invoice.issueDate;
                form.elements.invoiceDueDate.value = invoice.dueDate;
                form.elements.taxRate.value = invoice.taxRate || 0;
                form.elements.invoiceNotes.value = invoice.notes || '';
                form.dataset.invoiceId = invoiceId;

                // Load items
                document.getElementById('itemsList').innerHTML = '';
                invoice.items.forEach(item => this.addItem(item));
                this.calculateTotals();
            }
        } else {
            modalTitle.textContent = 'Create Invoice';
            form.reset();
            delete form.dataset.invoiceId;
            document.getElementById('itemsList').innerHTML = '';
            this.addItem(); // Add one empty item by default
        }

        modal.classList.add('show');
        document.body.classList.add('modal-open');
    },

    // Show view invoice modal
    showViewModal(invoiceId) {
        const modal = document.getElementById('viewInvoiceModal');
        const invoice = this.invoices.find(i => i.id === invoiceId);
        
        if (invoice) {
            const customer = this.customers.find(c => c.id === invoice.customerId);
            const contract = this.contracts.find(c => c.id === invoice.contractId);
            
            modal.dataset.invoiceId = invoiceId;
            document.getElementById('viewInvoiceNumber').textContent = invoice.id.slice(0, 8);
            document.getElementById('viewCustomerName').textContent = customer ? customer.name : 'Unknown Customer';
            document.getElementById('viewCustomerAddress').textContent = customer ? customer.address : '';
            document.getElementById('viewCustomerEmail').textContent = customer ? customer.email : '';
            document.getElementById('viewIssueDate').textContent = new Date(invoice.issueDate).toLocaleDateString();
            document.getElementById('viewDueDate').textContent = new Date(invoice.dueDate).toLocaleDateString();
            document.getElementById('viewContract').textContent = contract ? contract.project : 'No Contract';
            
            const statusBadge = document.getElementById('viewStatus');
            statusBadge.textContent = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
            statusBadge.className = `status-badge ${invoice.status}`;

            // Display items
            const itemsList = document.getElementById('viewItemsList');
            itemsList.innerHTML = invoice.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${this.formatCurrency(item.rate)}</td>
                    <td>${this.formatCurrency(item.quantity * item.rate)}</td>
                </tr>
            `).join('');

            // Display totals
            document.getElementById('viewSubtotal').textContent = this.formatCurrency(invoice.subtotal);
            document.getElementById('viewTax').textContent = this.formatCurrency(invoice.tax);
            document.getElementById('viewTotal').textContent = this.formatCurrency(invoice.total);
            document.getElementById('viewNotes').textContent = invoice.notes || 'No notes';

            modal.classList.add('show');
            document.body.classList.add('modal-open');
        }
    },

    // Hide all modals
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.classList.remove('modal-open');
    },

    // Add item to invoice
    addItem(item = null) {
        const itemsList = document.getElementById('itemsList');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'invoice-item';
        itemDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group col-md-5">
                    <input type="text" class="item-description" placeholder="Item Description" value="${item ? item.description : ''}" required>
                </div>
                <div class="form-group col-md-2">
                    <input type="number" class="item-quantity" min="1" step="1" placeholder="Quantity" value="${item ? item.quantity : '1'}" required>
                </div>
                <div class="form-group col-md-3">
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="number" class="item-rate" min="0" step="0.01" placeholder="Rate" value="${item ? item.rate : ''}" required>
                    </div>
                </div>
                <div class="form-group col-md-2">
                    <button type="button" class="btn-icon" onclick="Invoices.removeItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        itemsList.appendChild(itemDiv);

        // Add event listeners for calculation
        const inputs = itemDiv.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculateTotals());
        });

        this.calculateTotals();
    },

    // Remove item from invoice
    removeItem(button) {
        button.closest('.invoice-item').remove();
        this.calculateTotals();
    },

    // Calculate invoice totals
    calculateTotals() {
        const items = document.querySelectorAll('.invoice-item');
        let subtotal = 0;

        items.forEach(item => {
            const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
            subtotal += quantity * rate;
        });

        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;

        document.getElementById('subtotal').value = this.formatCurrency(subtotal);
        document.getElementById('total').value = this.formatCurrency(total);
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const invoiceId = form.dataset.invoiceId;

        // Collect items data
        const items = Array.from(form.querySelectorAll('.invoice-item')).map(item => ({
            description: item.querySelector('.item-description').value.trim(),
            quantity: parseInt(item.querySelector('.item-quantity').value),
            rate: parseFloat(item.querySelector('.item-rate').value)
        }));

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const taxRate = parseFloat(form.elements.taxRate.value) || 0;
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;

        const invoiceData = {
            customerId: form.elements.invoiceCustomer.value,
            contractId: form.elements.invoiceContract.value || null,
            issueDate: form.elements.invoiceDate.value,
            dueDate: form.elements.invoiceDueDate.value,
            items: items,
            subtotal: subtotal,
            taxRate: taxRate,
            tax: tax,
            total: total,
            notes: form.elements.invoiceNotes.value.trim(),
            status: this.determineInvoiceStatus(form.elements.invoiceDueDate.value)
        };

        if (invoiceId) {
            // Update existing invoice
            const index = this.invoices.findIndex(i => i.id === invoiceId);
            if (index !== -1) {
                this.invoices[index] = {
                    ...this.invoices[index],
                    ...invoiceData,
                    updatedAt: new Date().toISOString()
                };
                this.showToast('Invoice updated successfully', 'success');
            }
        } else {
            // Add new invoice
            const newInvoice = {
                id: crypto.randomUUID(),
                ...invoiceData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.invoices.unshift(newInvoice);
            this.showToast('Invoice created successfully', 'success');
        }

        this.saveInvoices();
        this.loadInvoices();
        this.updateSummaryCards();
        this.hideModals();
    },

    // Determine invoice status based on due date
    determineInvoiceStatus(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        return now > due ? 'overdue' : 'pending';
    },

    // Show delete confirmation modal
    showDeleteModal(invoiceId) {
        const modal = document.getElementById('deleteModal');
        modal.dataset.invoiceId = invoiceId;
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    },

    // Delete invoice
    deleteInvoice() {
        const modal = document.getElementById('deleteModal');
        const invoiceId = modal.dataset.invoiceId;
        
        if (invoiceId) {
            this.invoices = this.invoices.filter(i => i.id !== invoiceId);
            this.saveInvoices();
            this.loadInvoices();
            this.updateSummaryCards();
            this.showToast('Invoice deleted successfully', 'success');
        }
        
        this.hideModals();
    },

    // Download invoice as PDF
    downloadInvoice(invoiceId) {
        // TODO: Implement PDF generation and download
        this.showToast('PDF download feature coming soon', 'info');
    },

    // Send invoice via email
    sendInvoice(invoiceId) {
        // TODO: Implement email sending functionality
        this.showToast('Email sending feature coming soon', 'info');
    },

    // Filter and sort invoices
    filterInvoices() {
        const searchTerm = document.getElementById('searchInvoice').value.toLowerCase();
        const customerFilter = document.getElementById('customerFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        let filtered = this.invoices.filter(invoice => {
            const customer = this.customers.find(c => c.id === invoice.customerId);
            const contract = this.contracts.find(c => c.id === invoice.contractId);
            
            const matchesSearch = 
                invoice.id.toLowerCase().includes(searchTerm) ||
                customer?.name.toLowerCase().includes(searchTerm) ||
                contract?.project.toLowerCase().includes(searchTerm);
            
            const matchesCustomer = !customerFilter || invoice.customerId === customerFilter;
            const matchesStatus = !statusFilter || invoice.status === statusFilter;

            return matchesSearch && matchesCustomer && matchesStatus;
        });

        // Sort invoices
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.issueDate) - new Date(a.issueDate);
                case 'customer':
                    const customerA = this.customers.find(c => c.id === a.customerId)?.name || '';
                    const customerB = this.customers.find(c => c.id === b.customerId)?.name || '';
                    return customerA.localeCompare(customerB);
                case 'amount':
                    return b.total - a.total;
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'dueDate':
                    return new Date(a.dueDate) - new Date(b.dueDate);
                default:
                    return 0;
            }
        });

        this.currentPage = 1;
        this.displayInvoices(filtered);
    },

    // Display invoices with pagination
    displayInvoices(invoices) {
        const tbody = document.getElementById('invoicesTableBody');
        const totalPages = Math.ceil(invoices.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedInvoices = invoices.slice(start, end);

        // Update pagination buttons
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages || 1}`;

        // Clear table
        tbody.innerHTML = '';

        // Add invoices to table
        paginatedInvoices.forEach(invoice => {
            const customer = this.customers.find(c => c.id === invoice.customerId);
            const contract = this.contracts.find(c => c.id === invoice.contractId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${invoice.id.slice(0, 8)}</td>
                <td>${customer ? customer.name : 'Unknown Customer'}</td>
                <td>${contract ? contract.project : 'No Contract'}</td>
                <td>${new Date(invoice.issueDate).toLocaleDateString()}</td>
                <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td>${this.formatCurrency(invoice.total)}</td>
                <td>
                    <span class="status-badge ${invoice.status}">
                        ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="View" onclick="Invoices.showViewModal('${invoice.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" title="Edit" onclick="Invoices.showModal('${invoice.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="Delete" onclick="Invoices.showDeleteModal('${invoice.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Update summary cards
    updateSummaryCards() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

        let totalOutstanding = 0;
        let totalOverdue = 0;
        let paidThisMonth = 0;
        let dueThisWeek = 0;

        this.invoices.forEach(invoice => {
            const dueDate = new Date(invoice.dueDate);
            
            if (invoice.status === 'pending' || invoice.status === 'overdue') {
                totalOutstanding += invoice.total;
            }
            
            if (invoice.status === 'overdue') {
                totalOverdue += invoice.total;
            }
            
            if (invoice.status === 'paid' && new Date(invoice.updatedAt) >= startOfMonth) {
                paidThisMonth += invoice.total;
            }
            
            if ((invoice.status === 'pending' || invoice.status === 'overdue') && 
                dueDate <= endOfWeek && dueDate >= now) {
                dueThisWeek += invoice.total;
            }
        });

        document.getElementById('totalOutstanding').textContent = this.formatCurrency(totalOutstanding);
        document.getElementById('totalOverdue').textContent = this.formatCurrency(totalOverdue);
        document.getElementById('paidThisMonth').textContent = this.formatCurrency(paidThisMonth);
        document.getElementById('dueThisWeek').textContent = this.formatCurrency(dueThisWeek);
    },

    // Change page
    changePage(delta) {
        this.currentPage += delta;
        this.loadInvoices();
    },

    // Load invoices
    loadInvoices() {
        this.displayInvoices(this.invoices);
    },

    // Save invoices to localStorage
    saveInvoices() {
        localStorage.setItem('invoices', JSON.stringify(this.invoices));
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
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
document.addEventListener('DOMContentLoaded', () => Invoices.init()); 