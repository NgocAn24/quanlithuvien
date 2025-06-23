const ReaderModule = {
        showReaderManagement() {
            const content = document.getElementById('content');
            const readers = DataStore.getAll('readers');

            content.innerHTML = `
            <h2>Quản lý Độc giả</h2>
            <div class="actions">
                <button class="button button-primary" onclick="ReaderModule.showAddReaderForm()">Thêm Độc giả Mới</button>
            </div>
            <div class="search-bar">
                <input type="text" id="readerSearch" placeholder="Tìm kiếm theo tên, ID, hoặc liên hệ..." 
                       onkeyup="ReaderModule.filterReaders()">
            </div>
            ${this.createReaderTable(readers)}
        `;
        },

        createReaderTable(readers) {
            const headers = ['Mã độc giả', 'Tên', 'Điện thoại', 'Email', 'Sách đang mượn'];
            const rows = readers.map(reader => ({
                id: reader.id,
                data: [
                    reader.id,
                    reader.name,
                    reader.phone,
                    reader.email,
                    this.getActiveLoanCount(reader.id)
                ]
            }));

            const actions = [
                { text: 'Sửa', onclick: 'ReaderModule.editReader({id})', class: 'button-secondary' },
                { text: 'Xem lịch sử', onclick: 'ReaderModule.viewHistory({id})', class: 'button-secondary' },
                { text: 'Xóa', onclick: 'ReaderModule.deleteReader({id})', class: 'button-danger' }
            ];

            return UI.createTable(headers, rows, actions);
        },

        showAddReaderForm() {
            const fields = [
                { type: 'text', id: 'name', label: 'Họ và tên', required: true },
                { type: 'tel', id: 'phone', label: 'Số điện thoại', required: true },
                { type: 'email', id: 'email', label: 'Email', required: true },
                { type: 'textarea', id: 'address', label: 'Địa chỉ', required: true }
            ];

            const content = document.getElementById('content');
            content.innerHTML = `
            <h2>Thêm Độc giả Mới</h2>
            ${UI.createForm(fields, 'ReaderModule.addReader(event)', 'ReaderModule.showReaderManagement()')}
        `;
        },

        addReader(event) {
            event.preventDefault();
            const reader = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value
            };

            DataStore.addReader(reader);
            UI.showMessage('Thêm độc giả thành công!', 'success');
            this.showReaderManagement();
        },

        editReader(readerId) {
            const reader = DataStore.getAll('readers').find(r => r.id === readerId);
            if (!reader) return;

            const fields = [
                { type: 'text', id: 'name', label: 'Họ và tên', required: true, value: reader.name },
                { type: 'tel', id: 'phone', label: 'Số điện thoại', required: true, value: reader.phone },
                { type: 'email', id: 'email', label: 'Email', required: true, value: reader.email },
                { type: 'textarea', id: 'address', label: 'Địa chỉ', required: true, value: reader.address }
            ];

            const content = document.getElementById('content');
            content.innerHTML = `
            <h2>Chỉnh sửa Độc giả</h2>
            ${UI.createForm(fields, `ReaderModule.updateReader(event, ${readerId})`, 'ReaderModule.showReaderManagement()')}
        `;
    },

    updateReader(event, readerId) {
        event.preventDefault();
        const updatedReader = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };

        if (DataStore.updateReader(readerId, updatedReader)) {
            UI.showMessage('Cập nhật độc giả thành công!', 'success');
            this.showReaderManagement();
        } else {
            UI.showMessage('Cập nhật độc giả thất bại', 'error');
        }
    },

    deleteReader(readerId) {
        // Check if reader has active loans
        const activeLoans = DataStore.getAll('loans')
            .filter(loan => loan.readerId === readerId && loan.status === 'active');

        if (activeLoans.length > 0) {
            UI.showMessage('Không thể xóa độc giả đang có sách mượn', 'error');
            return;
        }

        if (confirm('Bạn có chắc chắn muốn xóa độc giả này?')) {
            DataStore.deleteReader(readerId);
            UI.showMessage('Xóa độc giả thành công!', 'success');
            this.showReaderManagement();
        }
    },

    viewHistory(readerId) {
        const reader = DataStore.getAll('readers').find(r => r.id === readerId);
        if (!reader) return;

        const loans = DataStore.getAll('loans').filter(loan => loan.readerId === readerId);
        const books = DataStore.getAll('books');

        const content = document.getElementById('content');
        content.innerHTML = `
            <h2>Lịch sử mượn sách - ${reader.name}</h2>
            <div class="reader-info">
                <p><strong>Mã độc giả:</strong> ${reader.id}</p>
                <p><strong>Email:</strong> ${reader.email}</p>
                <p><strong>Điện thoại:</strong> ${reader.phone}</p>
            </div>
            ${this.createLoanHistoryTable(loans, books)}
            <div class="actions">
                <button class="button" onclick="ReaderModule.showReaderManagement()">Quay lại</button>
            </div>
        `;
    },

    createLoanHistoryTable(loans, books) {
        const headers = ['Tên sách', 'Ngày mượn', 'Ngày hết hạn', 'Ngày trả', 'Trạng thái'];
        const rows = loans.map(loan => {
            const book = books.find(b => b.id === loan.bookId);
            return {
                id: loan.id,
                data: [
                    book ? book.title : 'Sách không xác định',
                    UI.formatDate(loan.loanDate),
                    UI.formatDate(loan.dueDate),
                    loan.returnDate ? UI.formatDate(loan.returnDate) : '-',
                    this.getLoanStatus(loan)
                ]
            };
        });

        return UI.createTable(headers, rows);
    },

    filterReaders() {
        const searchTerm = document.getElementById('readerSearch').value.toLowerCase();
        const readers = DataStore.getAll('readers');
        const filteredReaders = readers.filter(reader => 
            reader.id.toLowerCase().includes(searchTerm) ||
            reader.name.toLowerCase().includes(searchTerm) ||
            reader.phone.includes(searchTerm) ||
            reader.email.toLowerCase().includes(searchTerm)
        );
        
        document.querySelector('.table-container').outerHTML = this.createReaderTable(filteredReaders);
    },

    getActiveLoanCount(readerId) {
        const loans = DataStore.getAll('loans');
        return loans.filter(loan => 
            loan.readerId === readerId && loan.status === 'active'
        ).length;
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