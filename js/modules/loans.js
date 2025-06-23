const LoanModule = {
        showLoanManagement() {
            const content = document.getElementById('content');
            const tabs = [{
                    title: 'Sách đang mượn',
                    content: this.createActiveLoansSection()
                },
                {
                    title: 'Mượn sách mới',
                    content: this.createNewLoanSection()
                },
                {
                    title: 'Sách quá hạn',
                    content: this.createOverdueSection()
                }
            ];

            content.innerHTML = `
            <h2>Quản lý Mượn - Trả</h2>
            ${UI.createTabs(tabs)}
        `;
        },

        createActiveLoansSection() {
            const loans = DataStore.getAll('loans').filter(loan => loan.status === 'active');
            const books = DataStore.getAll('books');
            const readers = DataStore.getAll('readers');

            return `
            <div class="search-bar">
                <input type="text" id="activeLoanSearch" placeholder="Tìm kiếm theo tên sách hoặc tên độc giả..." 
                       onkeyup="LoanModule.filterActiveLoans()">
            </div>
            ${this.createActiveLoansTable(loans, books, readers)}
        `;
        },

        createActiveLoansTable(loans, books, readers) {
            const headers = ['Tên sách', 'Tên độc giả', 'Ngày mượn', 'Ngày hết hạn', 'Trạng thái'];
            const rows = loans.map(loan => {
                const book = books.find(b => b.id === loan.bookId);
                const reader = readers.find(r => r.id === loan.readerId);
                return {
                    id: loan.id,
                    data: [
                        book ? book.title : 'Sách không xác định',
                        reader ? reader.name : 'Độc giả không xác định',
                        UI.formatDate(loan.loanDate),
                        UI.formatDate(loan.dueDate),
                        this.getLoanStatus(loan)
                    ]
                };
            });

            const actions = [
                { text: 'Trả sách', onclick: 'LoanModule.returnBook({id})', class: 'button-primary' }
            ];

            return UI.createTable(headers, rows, actions);
        },

        createNewLoanSection() {
            const books = DataStore.getAll('books').filter(book => {
                const activeLoans = DataStore.getAll('loans').filter(loan =>
                    loan.bookId === book.id && loan.status === 'active'
                ).length;
                return book.quantity > activeLoans;
            });

            const readers = DataStore.getAll('readers');

            return `
            <div class="form-container">
                <form id="newLoanForm" onsubmit="LoanModule.createLoan(event)">
                    <div class="form-group">
                        <label for="bookId">Sách</label>
                        <select id="bookId" required>
                            <option value="">Chọn sách...</option>
                            ${books.map(book => `
                                <option value="${book.id}">${book.title}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="readerId">Độc giả</label>
                        <select id="readerId" required>
                            <option value="">Chọn độc giả...</option>
                            ${readers.map(reader => `
                                <option value="${reader.id}">${reader.name} (${reader.id})</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dueDate">Ngày hết hạn</label>
                        <input type="date" id="dueDate" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <button type="submit" class="button button-primary">Tạo phiếu mượn</button>
                </form>
            </div>
        `;
    },

    createOverdueSection() {
        const overdueLoans = this.getOverdueLoans();
        const books = DataStore.getAll('books');
        const readers = DataStore.getAll('readers');

        return `
            <div class="search-bar">
                <input type="text" id="overdueLoanSearch" placeholder="Tìm kiếm theo tên sách hoặc tên độc giả..." 
                       onkeyup="LoanModule.filterOverdueLoans()">
            </div>
            ${this.createOverdueLoansTable(overdueLoans, books, readers)}
        `;
    },

    createOverdueLoansTable(loans, books, readers) {
        if (loans.length === 0) {
            return '<p>Không có sách quá hạn.</p>';
        }

        const headers = ['Tên sách', 'Tên độc giả', 'Ngày mượn', 'Ngày hết hạn', 'Số ngày quá hạn'];
        const rows = loans.map(loan => {
            const book = books.find(b => b.id === loan.bookId);
            const reader = readers.find(r => r.id === loan.readerId);
            const daysOverdue = this.calculateDaysOverdue(loan.dueDate);
            return {
                id: loan.id,
                data: [
                    book ? book.title : 'Sách không xác định',
                    reader ? reader.name : 'Độc giả không xác định',
                    UI.formatDate(loan.loanDate),
                    UI.formatDate(loan.dueDate),
                    `${daysOverdue} ngày`
                ]
            };
        });

        const actions = [
            { text: 'Trả sách', onclick: 'LoanModule.returnBook({id})', class: 'button-primary' },
            { text: 'Liên hệ độc giả', onclick: 'LoanModule.contactReader({id})', class: 'button-secondary' }
        ];

        return UI.createTable(headers, rows, actions);
    },

    createLoan(event) {
        event.preventDefault();
        const loan = {
            bookId: parseInt(document.getElementById('bookId').value),
            readerId: parseInt(document.getElementById('readerId').value),
            loanDate: new Date().toISOString(),
            dueDate: document.getElementById('dueDate').value,
            status: 'active'
        };

        // Check if reader has too many active loans
        const activeLoans = DataStore.getAll('loans').filter(l => 
            l.readerId === loan.readerId && l.status === 'active'
        );
        if (activeLoans.length >= 5) {
            UI.showMessage('Độc giả đã đạt số lượng sách mượn tối đa', 'error');
            return;
        }

        // Check if book is available
        const book = DataStore.getAll('books').find(b => b.id === loan.bookId);
        const bookActiveLoans = DataStore.getAll('loans').filter(l => 
            l.bookId === loan.bookId && l.status === 'active'
        ).length;
        if (bookActiveLoans >= book.quantity) {
            UI.showMessage('Sách không có sẵn để cho mượn', 'error');
            return;
        }

        DataStore.addLoan(loan);
        UI.showMessage('Tạo phiếu mượn thành công!', 'success');
        this.showLoanManagement();
    },

    returnBook(loanId) {
        if (confirm('Bạn có chắc chắn muốn đánh dấu sách này đã được trả?')) {
            if (DataStore.returnBook(loanId)) {
                UI.showMessage('Trả sách thành công!', 'success');
                this.showLoanManagement();
            } else {
                UI.showMessage('Trả sách thất bại', 'error');
            }
        }
    },

    contactReader(loanId) {
        const loan = DataStore.getAll('loans').find(l => l.id === loanId);
        const reader = DataStore.getAll('readers').find(r => r.id === loan.readerId);
        const book = DataStore.getAll('books').find(b => b.id === loan.bookId);

        if (reader && book) {
            const daysOverdue = this.calculateDaysOverdue(loan.dueDate);
            const mailtoLink = `mailto:${reader.email}?subject=Nhắc nhở sách quá hạn&body=Kính gửi ${reader.name},%0D%0A%0D%0AThư viện xin thông báo sách "${book.title}" đã quá hạn ${daysOverdue} ngày. Vui lòng trả sách cho thư viện trong thời gian sớm nhất.%0D%0A%0D%0ANgày hết hạn: ${UI.formatDate(loan.dueDate)}%0D%0A%0D%0AXin cảm ơn sự hợp tác của bạn.`;
            window.location.href = mailtoLink;
        }
    },

    filterActiveLoans() {
        const searchTerm = document.getElementById('activeLoanSearch').value.toLowerCase();
        const loans = DataStore.getAll('loans').filter(loan => loan.status === 'active');
        const books = DataStore.getAll('books');
        const readers = DataStore.getAll('readers');

        const filteredLoans = loans.filter(loan => {
            const book = books.find(b => b.id === loan.bookId);
            const reader = readers.find(r => r.id === loan.readerId);
            return (book && book.title.toLowerCase().includes(searchTerm)) ||
                   (reader && reader.name.toLowerCase().includes(searchTerm));
        });

        document.querySelector('.table-container').outerHTML = 
            this.createActiveLoansTable(filteredLoans, books, readers);
    },

    filterOverdueLoans() {
        const searchTerm = document.getElementById('overdueLoanSearch').value.toLowerCase();
        const overdueLoans = this.getOverdueLoans();
        const books = DataStore.getAll('books');
        const readers = DataStore.getAll('readers');

        const filteredLoans = overdueLoans.filter(loan => {
            const book = books.find(b => b.id === loan.bookId);
            const reader = readers.find(r => r.id === loan.readerId);
            return (book && book.title.toLowerCase().includes(searchTerm)) ||
                   (reader && reader.name.toLowerCase().includes(searchTerm));
        });

        document.querySelector('.table-container').outerHTML = 
            this.createOverdueLoansTable(filteredLoans, books, readers);
    },

    getOverdueLoans() {
        const loans = DataStore.getAll('loans');
        const today = new Date();
        return loans.filter(loan => {
            if (loan.status !== 'active') return false;
            const dueDate = new Date(loan.dueDate);
            return dueDate < today;
        });
    },

    calculateDaysOverdue(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = Math.abs(today - due);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    getLoanStatus(loan) {
        if (loan.status === 'returned') {
            return '<span class="status-available">Đã trả</span>';
        }
        
        const dueDate = new Date(loan.dueDate);
        const today = new Date();
        
        if (dueDate < today) {
            return '<span class="status-overdue">Quá hạn</span>';
        }
        return '<span class="status-borrowed">Đang mượn</span>';
    }
};