// Contracts Module
const Contracts = {
    // Initialize contracts page
    init() {
        this.contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
        this.customers = JSON.parse(localStorage.getItem('customers') || '[]');
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.setupEventListeners();
        this.populateCustomerFilter();
        this.loadContracts();
    },

    // Setup event listeners
    setupEventListeners() {
        // Add contract button
        const addContractBtn = document.getElementById('addContractBtn');
        if (addContractBtn) {
            addContractBtn.addEventListener('click', () => this.showModal());
        }

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

        if (customerFilter && contractCustomer) {
            const customers = this.customers.map(customer => `
                <option value="${customer.id}">${customer.name}</option>
            `).join('');

            customerFilter.innerHTML += customers;
            contractCustomer.innerHTML += customers;
        }
    },

    // Show add/edit contract modal
    showModal(contractId = null) {
        const modal = document.getElementById('contractModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('contractForm');

        if (contractId) {
            const contract = this.contracts.find(c => c.id === contractId);
            if (contract) {
                modalTitle.textContent = 'Edit Contract';
                form.elements.contractCustomer.value = contract.customerId;
                form.elements.contractProject.value = contract.project;
                form.elements.contractDescription.value = contract.description;
                form.elements.contractStartDate.value = contract.startDate;
                form.elements.contractEndDate.value = contract.endDate;
                form.elements.contractAmount.value = contract.amount;
                form.elements.contractPaymentTerms.value = contract.paymentTerms;
                form.elements.contractStatus.value = contract.status;
                form.elements.contractTerms.value = contract.terms || '';
                form.dataset.contractId = contractId;

                this.toggleMilestones(contract.paymentTerms);
                if (contract.milestones) {
                    contract.milestones.forEach(milestone => this.addMilestone(milestone));
                }
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

        // Add contracts to table
        paginatedContracts.forEach(contract => {
            const customer = this.customers.find(c => c.id === contract.customerId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${contract.id.slice(0, 8)}</td>
                <td>${customer ? customer.name : 'Unknown Customer'}</td>
                <td>${contract.project}</td>
                <td>${new Date(contract.startDate).toLocaleDateString()}</td>
                <td>${new Date(contract.endDate).toLocaleDateString()}</td>
                <td>${this.formatCurrency(contract.amount)}</td>
                <td>
                    <span class="status-badge ${contract.status}">
                        ${contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="View" onclick="Contracts.showViewModal('${contract.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" title="Edit" onclick="Contracts.showModal('${contract.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="Delete" onclick="Contracts.showDeleteModal('${contract.id}')">
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