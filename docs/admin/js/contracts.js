// Contracts Module
const Contracts = {
    // Store contracts in localStorage
    contracts: JSON.parse(localStorage.getItem('contracts') || '[]'),

    printContract(contractId) {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'CFO') {
            // Find the contract
            const contract = this.contracts.find(c => c.id === contractId);
            if (contract) {
                // Create a print-friendly version of the contract
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Contract #${contract.id}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .contract-header { text-align: center; margin-bottom: 20px; }
                            .contract-details { margin: 20px 0; }
                            .contract-details h3 { margin: 15px 0; }
                            .contract-details table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                            .contract-details table td, .contract-details table th { 
                                padding: 8px; border: 1px solid #ddd;
                            }
                            .contract-footer { margin-top: 30px; text-align: right; }
                            @media print {
                                body { margin: 0; padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="contract-header">
                            <h1>Webflare Design Co.</h1>
                            <h2>Contract #${contract.id}</h2>
                        </div>

                        <div class="contract-details">
                            <table>
                                <tr>
                                    <td><strong>Customer:</strong></td>
                                    <td>${contract.customer}</td>
                                </tr>
                                <tr>
                                    <td><strong>Project:</strong></td>
                                    <td>${contract.project}</td>
                                </tr>
                                <tr>
                                    <td><strong>Status:</strong></td>
                                    <td>${contract.status}</td>
                                </tr>
                                <tr>
                                    <td><strong>Start Date:</strong></td>
                                    <td>${new Date(contract.startDate).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <td><strong>End Date:</strong></td>
                                    <td>${new Date(contract.endDate).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <td><strong>Amount:</strong></td>
                                    <td>$${contract.amount.toFixed(2)}</td>
                                </tr>
                            </table>

                            <h3>Project Description</h3>
                            <p>${contract.description}</p>

                            <h3>Terms & Conditions</h3>
                            <p>${contract.terms}</p>
                        </div>

                        <div class="contract-footer">
                            <p>Webflare Design Co. - ${new Date().getFullYear()}</p>
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    },

    // Show contract modal
    showModal(contractId = null) {
        const modal = document.getElementById('contractModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('contractForm');

        if (!modal || !modalTitle || !form) return;

        const userRole = localStorage.getItem('userRole');
        if (userRole === 'CFO') {
            alert('Only CEO can create or edit contracts');
            return;
        }

        form.reset();
        
        if (contractId) {
            const contract = this.contracts.find(c => c.id === contractId);
            if (contract) {
                modalTitle.textContent = 'Edit Contract';
                form.dataset.contractId = contractId;
                Object.keys(contract).forEach(key => {
                    const input = document.getElementById(`contract${key.charAt(0).toUpperCase() + key.slice(1)}`);
                    if (input) {
                        if (input.type === 'date') {
                            input.value = new Date(contract[key]).toISOString().split('T')[0];
                        } else {
                            input.value = contract[key];
                        }
                    }
                });
            }
        } else {
            modalTitle.textContent = 'Add Contract';
            delete form.dataset.contractId;
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const userRole = localStorage.getItem('userRole');
        
        if (userRole === 'CFO') {
            alert('Only CEO can create or edit contracts');
            return;
        }

        const contractId = form.dataset.contractId;
        const formData = new FormData(form);
        const contract = Object.fromEntries(formData.entries());

        if (contractId) {
            // Update existing contract
            const index = this.contracts.findIndex(c => c.id === contractId);
            if (index !== -1) {
                this.contracts[index] = { ...this.contracts[index], ...contract };
                localStorage.setItem('contracts', JSON.stringify(this.contracts));
                this.loadContracts();
                this.hideModals();
                this.showToast('Contract updated successfully', 'success');
            }
        } else {
            // Create new contract
            const newContract = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                ...contract
            };
            this.contracts.push(newContract);
            localStorage.setItem('contracts', JSON.stringify(this.contracts));
            this.loadContracts();
            this.hideModals();
            this.showToast('Contract created successfully', 'success');
        }
    },
    // Initialize contracts page
    init() {
        try {
            console.log('Contracts module initialized');
            
            // Check if user is logged in
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            if (!user.id) {
                window.location.href = '../login.html';
                return;
            }

            // Update user display
            updateUserInfo();

            // Initialize navigation
            this.initNavigation();

            // Initialize mobile touch support
            this.initTouchSupport();

            // Initialize all event listeners
            this.initEventListeners();

            // Initialize all modals
            this.initModals();

            // Initialize all filters
            this.initFilters();

            // Initialize all tables
            this.initTables();

            // Initialize all forms
            this.initForms();

            // Check user role and update UI accordingly
            this.checkUserRole();

            // Initialize tooltips
            initTooltips();

            // Initialize mobile menu
            this.initMobileMenu();

            console.log('Contracts module initialization complete');
        } catch (error) {
            console.error('Error initializing contracts module:', error);
        }
    },

    // Initialize event listeners
    initEventListeners() {
        const addContractBtn = document.getElementById('addContractBtn');
        if (addContractBtn) {
            addContractBtn.addEventListener('click', () => this.showModal());
        }

        const contractForm = document.getElementById('contractForm');
        if (contractForm) {
            contractForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Add touch support for form submission
        const formSubmitBtn = document.querySelector('.form-submit');
        if (formSubmitBtn) {
            formSubmitBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                contractForm.submit();
            });
        }
    },

    // Initialize filters
    initFilters() {
        const searchInput = document.getElementById('searchContract');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterContracts());
        }

        // Add touch support for filter dropdowns
        const filterDropdowns = document.querySelectorAll('.filter-dropdown');
        filterDropdowns.forEach(dropdown => {
            dropdown.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.toggleFilterMenu(dropdown);
            });
        });
    },

    // Initialize tables
    initTables() {
        const contractsTable = document.getElementById('contractsTable');
        if (contractsTable) {
            // Add touch support for table rows
            const tableRows = contractsTable.querySelectorAll('tbody tr');
            tableRows.forEach(row => {
                row.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    row.classList.toggle('selected');
                });
            });
        }
    },

    // Initialize forms
    initForms() {
        const contractForm = document.getElementById('contractForm');
        if (contractForm) {
            // Add touch support for date inputs
            const dateInputs = contractForm.querySelectorAll('input[type="date"]');
            dateInputs.forEach(input => {
                input.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    input.showPicker();
                });
            });
        }
    },

    // Mobile Touch Support
    initTouchSupport() {
        // Add touch support for filter dropdown
        const filterDropdowns = document.querySelectorAll('.filter-dropdown');
        filterDropdowns.forEach(dropdown => {
            dropdown.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.toggleFilterMenu(dropdown);
            });
        });

        // Add touch support for pagination
        const paginationButtons = document.querySelectorAll('.pagination button');
        paginationButtons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.click();
            });
        });

        // Add touch support for table rows
        const tableRows = document.querySelectorAll('.data-table tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('touchstart', (e) => {
                e.preventDefault();
                row.classList.toggle('selected');
            });
        });

        // Add touch support for date picker
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.addEventListener('touchstart', (e) => {
                e.preventDefault();
                input.showPicker();
            });
        });
    },

    // Mobile Menu Functions
    initMobileMenu() {
        const nav = document.querySelector('.admin-nav');
        if (nav) {
            // Close menu when clicking outside
            document.addEventListener('touchstart', (e) => {
                if (!nav.contains(e.target) && !document.querySelector('.mobile-menu-toggle').contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    },

    // Close mobile menu when clicking outside
    closeMobileMenu() {
        const nav = document.querySelector('.admin-nav');
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
        }
    },

    // Handle mobile form submissions
    handleMobileFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        // Process form data
        this.processFormData(formData);
        
        // Close any open modals

// Apply CFO restrictions
applyCFORestrictions() {
const userRole = localStorage.getItem('userRole');
if (userRole === 'CFO') {
// Hide add contract button
const addBtn = document.getElementById('addContractBtn');
if (addBtn) addBtn.style.display = 'none';

// Hide edit and delete buttons
const editButtons = document.querySelectorAll('.edit-contract');
const deleteButtons = document.querySelectorAll('.delete-contract');
editButtons.forEach(btn => btn.style.display = 'none');
deleteButtons.forEach(btn => btn.style.display = 'none');

// Show print buttons
const printButtons = document.querySelectorAll('.print-contract');
printButtons.forEach(btn => btn.style.display = 'inline-flex');
} else {
// For non-CFOs, hide print buttons
const printButtons = document.querySelectorAll('.print-contract');
printButtons.forEach(btn => btn.style.display = 'none');
}
};
            // Hide add contract button
            const addBtn = document.getElementById('addContractBtn');
            if (addBtn) addBtn.style.display = 'none';

            // Hide edit and delete buttons
            const editButtons = document.querySelectorAll('.edit-contract');
            const deleteButtons = document.querySelectorAll('.delete-contract');
            editButtons.forEach(btn => btn.style.display = 'none');
            deleteButtons.forEach(btn => btn.style.display = 'none');

            // Show print buttons
            const printButtons = document.querySelectorAll('.print-contract');
            printButtons.forEach(btn => btn.style.display = 'inline-flex');
        } else {
            // For non-CFOs, hide print buttons
            const printButtons = document.querySelectorAll('.print-contract');
            printButtons.forEach(btn => btn.style.display = 'none');
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Add contract button
        const addContractBtn = document.getElementById('addContractBtn');
        if (addContractBtn) {
            addContractBtn.addEventListener('click', () => this.showModal());
        }

        // Print button for CFOs
        const printButtons = document.querySelectorAll('.print-contract');
        printButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const contractId = row.getAttribute('data-contract-id');
                if (contractId) {
                    printContract(contractId);
                }
            });
        });

        // Search and filters
        const searchInput = document.getElementById('searchContract');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterContracts());
        }

        const customerFilter = document.getElementById('customerFilter');
        if (customerFilter) {
            customerFilter.addEventListener('change', () => this.filterContracts());
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterContracts());
        }

        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => this.filterContracts());
        }

        // Pagination
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        if (prevPage && nextPage) {
            prevPage.addEventListener('click', () => this.changePage(-1));
            nextPage.addEventListener('click', () => this.changePage(1));
        }

        // Contract form
        const contractForm = document.getElementById('contractForm');
        if (contractForm) {
            contractForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Payment terms change
        const paymentTerms = document.getElementById('contractPaymentTerms');
        if (paymentTerms) {
            paymentTerms.addEventListener('change', (e) => this.toggleMilestones(e.target.value));
        }

        // Add milestone button
        const addMilestoneBtn = document.getElementById('addMilestoneBtn');
        if (addMilestoneBtn) {
            addMilestoneBtn.addEventListener('click', () => this.addMilestone());
        }

        // Modal close buttons
        document.querySelectorAll('.close-modal, [data-dismiss="modal"]').forEach(button => {
            button.addEventListener('click', () => this.hideModals());
        });

        // Delete confirmation
        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deleteContract());
        }

        // View contract actions
        const editContractBtn = document.getElementById('editContractBtn');
        if (editContractBtn) {
            editContractBtn.addEventListener('click', () => {
                const contractId = document.getElementById('viewContractModal').dataset.contractId;
                this.hideModals();
                this.showModal(contractId);
            });
        }

        const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
        if (generateInvoiceBtn) {
            generateInvoiceBtn.addEventListener('click', () => {
                const contractId = document.getElementById('viewContractModal').dataset.contractId;
                this.generateInvoice(contractId);
            });
        }
    },

    // Populate customer filter
    populateCustomerFilter() {
        const customerFilter = document.getElementById('customerFilter');
        const contractCustomer = document.getElementById('contractCustomer');

            }
        } else {
            modalTitle.textContent = 'Add Contract';
            form.reset();
            delete form.dataset.contractId;
            document.getElementById('milestoneList').innerHTML = '';
            document.getElementById('milestoneContainer').style.display = 'none';
        }

        modal.classList.add('show');
        document.body.classList.add('modal-open');
    },

    // Show view contract modal
    showViewModal(contractId) {
        const modal = document.getElementById('viewContractModal');
        const contract = this.contracts.find(c => c.id === contractId);
        
        if (contract) {
            const customer = this.customers.find(c => c.id === contract.customerId);
            
            modal.dataset.contractId = contractId;
            document.getElementById('viewProjectName').textContent = contract.project;
            document.getElementById('viewCustomer').textContent = customer ? customer.name : 'Unknown Customer';
            document.getElementById('viewContractId').textContent = contract.id;
            document.getElementById('viewStartDate').textContent = new Date(contract.startDate).toLocaleDateString();
            document.getElementById('viewEndDate').textContent = new Date(contract.endDate).toLocaleDateString();
            document.getElementById('viewAmount').textContent = this.formatCurrency(contract.amount);
            document.getElementById('viewPaymentTerms').textContent = this.formatPaymentTerms(contract.paymentTerms);
            document.getElementById('viewDescription').textContent = contract.description;
            document.getElementById('viewTerms').textContent = contract.terms || 'No terms specified';
            
            const statusBadge = document.getElementById('viewStatus');
            statusBadge.textContent = contract.status.charAt(0).toUpperCase() + contract.status.slice(1);
            statusBadge.className = `status-badge ${contract.status}`;

            // Handle milestones
            const milestonesSection = document.getElementById('viewMilestones');
            const milestonesList = milestonesSection.querySelector('.milestone-list');
            
            if (contract.milestones && contract.milestones.length > 0) {
                milestonesList.innerHTML = contract.milestones.map(milestone => `
                    <div class="milestone-item">
                        <div class="milestone-header">
                            <span class="milestone-title">${milestone.title}</span>
                            <span class="milestone-amount">${this.formatCurrency(milestone.amount)}</span>
                        </div>
                        <div class="milestone-date">${new Date(milestone.date).toLocaleDateString()}</div>
                        <span class="milestone-status ${milestone.status || 'pending'}">${milestone.status || 'Pending'}</span>
                    </div>
                `).join('');
                milestonesSection.style.display = 'block';
            } else {
                milestonesSection.style.display = 'none';
            }

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

    // Toggle milestone section based on payment terms
    toggleMilestones(paymentTerms) {
        const milestoneContainer = document.getElementById('milestoneContainer');
        if (milestoneContainer) {
            milestoneContainer.style.display = paymentTerms === 'milestone' ? 'block' : 'none';
        }
    },

    // Add milestone to the form
    addMilestone(milestone = null) {
        const milestoneList = document.getElementById('milestoneList');
        const milestoneDiv = document.createElement('div');
        milestoneDiv.className = 'milestone-item';
        milestoneDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group col-md-4">
                    <input type="text" class="milestone-title" placeholder="Milestone Title" value="${milestone ? milestone.title : ''}" required>
                </div>
                <div class="form-group col-md-3">
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="number" class="milestone-amount" min="0" step="0.01" placeholder="Amount" value="${milestone ? milestone.amount : ''}" required>
                    </div>
                </div>
                <div class="form-group col-md-3">
                    <input type="date" class="milestone-date" value="${milestone ? milestone.date : ''}" required>
                </div>
                <div class="form-group col-md-2">
                    <button type="button" class="btn-icon" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        milestoneList.appendChild(milestoneDiv);
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const contractId = form.dataset.contractId;

        // Collect milestone data if payment terms is milestone
        let milestones = [];
        if (form.elements.contractPaymentTerms.value === 'milestone') {
            const milestoneItems = form.querySelectorAll('.milestone-item');
            milestones = Array.from(milestoneItems).map(item => ({
                title: item.querySelector('.milestone-title').value,
                amount: parseFloat(item.querySelector('.milestone-amount').value),
                date: item.querySelector('.milestone-date').value,
                status: 'pending'
            }));
        }

        const contractData = {
            customerId: form.elements.contractCustomer.value,
            project: form.elements.contractProject.value.trim(),
            description: form.elements.contractDescription.value.trim(),
            startDate: form.elements.contractStartDate.value,
            endDate: form.elements.contractEndDate.value,
            amount: parseFloat(form.elements.contractAmount.value),
            paymentTerms: form.elements.contractPaymentTerms.value,
            status: form.elements.contractStatus.value,
            terms: form.elements.contractTerms.value.trim(),
            milestones: milestones
        };

        if (contractId) {
            // Update existing contract
            const index = this.contracts.findIndex(c => c.id === contractId);
            if (index !== -1) {
                this.contracts[index] = {
                    ...this.contracts[index],
                    ...contractData,
                    updatedAt: new Date().toISOString()
                };
                this.showToast('Contract updated successfully', 'success');
            }
        } else {
            // Add new contract
            const newContract = {
                id: crypto.randomUUID(),
                ...contractData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.contracts.unshift(newContract);
            this.showToast('Contract added successfully', 'success');
        }

        this.saveContracts();
        this.loadContracts();
        this.hideModals();
    },

    // Show delete confirmation modal
    showDeleteModal(contractId) {
        const modal = document.getElementById('deleteModal');
        modal.dataset.contractId = contractId;
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    },

    // Delete contract
    deleteContract() {
        const modal = document.getElementById('deleteModal');
        const contractId = modal.dataset.contractId;
        
        if (contractId) {
            this.contracts = this.contracts.filter(c => c.id !== contractId);
            this.saveContracts();
            this.loadContracts();
            this.showToast('Contract deleted successfully', 'success');
        }
        
        this.hideModals();
    },

    // Generate invoice for contract
    generateInvoice(contractId) {
        const contract = this.contracts.find(c => c.id === contractId);
        if (contract) {
            // Redirect to invoices page with contract data
            window.location.href = `invoices.html?contract=${contractId}`;
        }
    },

    // Filter and sort contracts
    filterContracts() {
        const searchTerm = document.getElementById('searchContract').value.toLowerCase();
        const customerFilter = document.getElementById('customerFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        let filtered = this.contracts.filter(contract => {
            const customer = this.customers.find(c => c.id === contract.customerId);
            const matchesSearch = 
                contract.project.toLowerCase().includes(searchTerm) ||
                customer?.name.toLowerCase().includes(searchTerm) ||
                contract.description.toLowerCase().includes(searchTerm);
            
            const matchesCustomer = !customerFilter || contract.customerId === customerFilter;
            const matchesStatus = !statusFilter || contract.status === statusFilter;

            return matchesSearch && matchesCustomer && matchesStatus;
        });

        // Sort contracts
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'customer':
                    const customerA = this.customers.find(c => c.id === a.customerId)?.name || '';
                    const customerB = this.customers.find(c => c.id === b.customerId)?.name || '';
                    return customerA.localeCompare(customerB);
                case 'amount':
                    return b.amount - a.amount;
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        this.currentPage = 1;
        this.displayContracts(filtered);
    },

    // Display contracts with pagination
    displayContracts(contracts) {
        const tbody = document.getElementById('contractsTableBody');
        const totalPages = Math.ceil(contracts.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedContracts = contracts.slice(start, end);

        // Update pagination buttons
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages || 1}`;

        // Clear table
        tbody.innerHTML = '';

        paginatedContracts.forEach(contract => {
            const row = document.createElement('tr');
            row.setAttribute('data-contract-id', contract.id);
            row.innerHTML = `
                <td>${contract.id}</td>
                <td>${contract.customer}</td>
                <td>${contract.project}</td>
                <td>${new Date(contract.startDate).toLocaleDateString()}</td>
                <td>${new Date(contract.endDate).toLocaleDateString()}</td>
                <td>$${contract.amount.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${contract.status}">${contract.status}</span>
                </td>
                <td class="action-buttons">
                    <button class="btn-icon edit-contract" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-contract" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon print-contract" title="Print" style="display: none;">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Change page
    changePage(delta) {
        this.currentPage += delta;
        this.loadContracts();
    },

    // Load contracts
    loadContracts() {
        this.displayContracts(this.contracts);
    },

    // Save contracts to localStorage
    saveContracts() {
        localStorage.setItem('contracts', JSON.stringify(this.contracts));
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format payment terms
    formatPaymentTerms(terms) {
        const formattedTerms = {
            'full': 'Full Payment',
            '50-50': '50% Upfront, 50% on Completion',
            'milestone': 'Milestone Based',
            'monthly': 'Monthly Payments'
        };
        return formattedTerms[terms] || terms;
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
document.addEventListener('DOMContentLoaded', () => Contracts.init()); 