const BookModule = {
        showBookManagement() {
            const content = document.getElementById('content');
            const books = DataStore.getAll('books');

            content.innerHTML = `
            <h2>Quản lý Sách</h2>
            <div class="actions">
                <button class="button button-primary" onclick="BookModule.showAddBookForm()">Thêm Sách Mới</button>
            </div>
            <div class="search-bar">
                <input type="text" id="bookSearch" placeholder="Tìm kiếm theo tên sách, tác giả, thể loại..." 
                       onkeyup="BookModule.filterBooks()">
            </div>
            ${this.createBookTable(books)}
        `;
        },

        createBookTable(books) {
            const headers = ['Tên sách', 'Tác giả', 'Thể loại', 'Nhà xuất bản', 'Số lượng', 'Trạng thái'];
            const rows = books.map(book => ({
                id: book.id,
                data: [
                    book.title,
                    this.getAuthorName(book.authorId),
                    book.category,
                    this.getPublisherName(book.publisherId),
                    book.quantity,
                    this.getBookStatus(book)
                ]
            }));

            const actions = [
                { text: 'Sửa', onclick: 'BookModule.editBook({id})', class: 'button-secondary' },
                { text: 'Xóa', onclick: 'BookModule.deleteBook({id})', class: 'button-danger' }
            ];

            return UI.createTable(headers, rows, actions);
        },

        showAddBookForm() {
            const content = document.getElementById('content');
            const authors = DataStore.getAll('authors');
            const publishers = DataStore.getAll('publishers');
            const categories = DataStore.getCategories();

            content.innerHTML = `
            <h2>Thêm Sách Mới</h2>
            <div class="form-container">
                <form onsubmit="BookModule.addBook(event)">
                    <div class="form-group">
                        <label for="title">Tên sách *</label>
                        <input type="text" id="title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="authorId">Tác giả *</label>
                        <div class="input-with-button">
                            <select id="authorId" required>
                                <option value="">Chọn tác giả...</option>
                                ${authors.map(author => `
                                    <option value="${author.id}">${author.name}</option>
                                `).join('')}
                            </select>
                            <button type="button" class="button button-secondary" onclick="BookModule.showQuickAddAuthor()">+ Thêm tác giả mới</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="category">Thể loại *</label>
                        <select id="category" required>
                            <option value="">Chọn thể loại...</option>
                            ${categories.map(category => `
                                <option value="${category}">${category}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="publisherId">Nhà xuất bản *</label>
                        <div class="input-with-button">
                            <select id="publisherId" required>
                                <option value="">Chọn nhà xuất bản...</option>
                                ${publishers.map(publisher => `
                                    <option value="${publisher.id}">${publisher.name}</option>
                                `).join('')}
                            </select>
                            <button type="button" class="button button-secondary" onclick="BookModule.showQuickAddPublisher()">+ Thêm NXB mới</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="quantity">Số lượng *</label>
                        <input type="number" id="quantity" required min="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="location">Vị trí trong thư viện *</label>
                        <input type="text" id="location" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="button button-primary">Thêm sách</button>
                        <button type="button" class="button" onclick="BookModule.showBookManagement()">Hủy</button>
                    </div>
                </form>
            </div>

            <!-- Modal for new author -->
            <div id="authorModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Thêm Tác giả Mới</h3>
                    <form onsubmit="BookModule.addNewAuthor(event)">
                        <div class="form-group">
                            <label for="newAuthorName">Tên tác giả</label>
                            <input type="text" id="newAuthorName" required>
                        </div>
                        <div class="form-group">
                            <label for="newAuthorBio">Tiểu sử</label>
                            <textarea id="newAuthorBio"></textarea>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary">Thêm</button>
                            <button type="button" class="button" onclick="BookModule.closeModal('authorModal')">Hủy</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Modal for new publisher -->
            <div id="publisherModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Thêm Nhà xuất bản Mới</h3>
                    <form onsubmit="BookModule.addNewPublisher(event)">
                        <div class="form-group">
                            <label for="newPublisherName">Tên nhà xuất bản</label>
                            <input type="text" id="newPublisherName" required>
                        </div>
                        <div class="form-group">
                            <label for="newPublisherPhone">Số điện thoại</label>
                            <input type="tel" id="newPublisherPhone" required>
                        </div>
                        <div class="form-group">
                            <label for="newPublisherEmail">Email</label>
                            <input type="email" id="newPublisherEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="newPublisherAddress">Địa chỉ</label>
                            <textarea id="newPublisherAddress" required></textarea>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary">Thêm</button>
                            <button type="button" class="button" onclick="BookModule.closeModal('publisherModal')">Hủy</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        },

        addBook(event) {
            event.preventDefault();
            const book = {
                title: document.getElementById('title').value,
                authorId: parseInt(document.getElementById('authorId').value),
                category: document.getElementById('category').value,
                publisherId: parseInt(document.getElementById('publisherId').value),
                quantity: parseInt(document.getElementById('quantity').value),
                location: document.getElementById('location').value
            };

            DataStore.addBook(book);
            UI.showMessage('Thêm sách thành công!', 'success');
            this.showBookManagement();
        },

        editBook(bookId) {
            const book = DataStore.getAll('books').find(b => b.id === bookId);
            if (!book) return;

            const authors = DataStore.getAll('authors');
            const publishers = DataStore.getAll('publishers');
            const categories = DataStore.getCategories();

            const content = document.getElementById('content');
            content.innerHTML = `
            <h2>Chỉnh sửa Sách</h2>
            <div class="form-container">
                <form onsubmit="BookModule.updateBook(event, ${bookId})">
                    <div class="form-group">
                        <label for="title">Tên sách</label>
                        <input type="text" id="title" required value="${book.title}">
                    </div>
                    
                    <div class="form-group">
                        <label for="authorId">Tác giả</label>
                        <div style="display: flex; gap: 10px;">
                            <select id="authorId" required style="flex: 1;">
                                <option value="">Chọn tác giả...</option>
                                ${authors.map(author => `
                                    <option value="${author.id}" ${author.id === book.authorId ? 'selected' : ''}>${author.name}</option>
                                `).join('')}
                            </select>
                            <button type="button" class="button button-secondary" onclick="BookModule.showNewAuthorForm()">Thêm tác giả mới</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="category">Thể loại</label>
                        <select id="category" required>
                            <option value="">Chọn thể loại...</option>
                            ${categories.map(category => `
                                <option value="${category}" ${category === book.category ? 'selected' : ''}>${category}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="publisherId">Nhà xuất bản</label>
                        <div style="display: flex; gap: 10px;">
                            <select id="publisherId" required style="flex: 1;">
                                <option value="">Chọn nhà xuất bản...</option>
                                ${publishers.map(publisher => `
                                    <option value="${publisher.id}" ${publisher.id === book.publisherId ? 'selected' : ''}>${publisher.name}</option>
                                `).join('')}
                            </select>
                            <button type="button" class="button button-secondary" onclick="BookModule.showNewPublisherForm()">Thêm NXB mới</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="quantity">Số lượng</label>
                        <input type="number" id="quantity" required min="0" value="${book.quantity}">
                    </div>
                    
                    <div class="form-group">
                        <label for="location">Vị trí trong thư viện</label>
                        <input type="text" id="location" required value="${book.location}">
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="button button-primary">Cập nhật</button>
                        <button type="button" class="button" onclick="BookModule.showBookManagement()">Hủy</button>
                    </div>
                </form>
            </div>
            
            <!-- Modal for new author -->
            <div id="authorModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Thêm Tác giả Mới</h3>
                    <form onsubmit="BookModule.addNewAuthor(event)">
                        <div class="form-group">
                            <label for="newAuthorName">Tên tác giả</label>
                            <input type="text" id="newAuthorName" required>
                        </div>
                        <div class="form-group">
                            <label for="newAuthorBio">Tiểu sử</label>
                            <textarea id="newAuthorBio"></textarea>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary">Thêm</button>
                            <button type="button" class="button" onclick="BookModule.closeModal('authorModal')">Hủy</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Modal for new publisher -->
            <div id="publisherModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Thêm Nhà xuất bản Mới</h3>
                    <form onsubmit="BookModule.addNewPublisher(event)">
                        <div class="form-group">
                            <label for="newPublisherName">Tên nhà xuất bản</label>
                            <input type="text" id="newPublisherName" required>
                        </div>
                        <div class="form-group">
                            <label for="newPublisherPhone">Số điện thoại</label>
                            <input type="tel" id="newPublisherPhone" required>
                        </div>
                        <div class="form-group">
                            <label for="newPublisherEmail">Email</label>
                            <input type="email" id="newPublisherEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="newPublisherAddress">Địa chỉ</label>
                            <textarea id="newPublisherAddress" required></textarea>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="button button-primary">Thêm</button>
                            <button type="button" class="button" onclick="BookModule.closeModal('publisherModal')">Hủy</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        },

    updateBook(event, bookId) {
        event.preventDefault();
        const updatedBook = {
            title: document.getElementById('title').value,
            authorId: parseInt(document.getElementById('authorId').value),
            category: document.getElementById('category').value,
            publisherId: parseInt(document.getElementById('publisherId').value),
            quantity: parseInt(document.getElementById('quantity').value),
            location: document.getElementById('location').value
        };

        if (DataStore.updateBook(bookId, updatedBook)) {
            UI.showMessage('Cập nhật sách thành công!', 'success');
            this.showBookManagement();
        } else {
            UI.showMessage('Cập nhật sách thất bại', 'error');
        }
    },

    deleteBook(bookId) {
        if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
            DataStore.deleteBook(bookId);
            UI.showMessage('Xóa sách thành công!', 'success');
            this.showBookManagement();
        }
    },

    filterBooks() {
        const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
        const books = DataStore.getAll('books');
        const filteredBooks = books.filter(book => {
            const authorName = this.getAuthorName(book.authorId).toLowerCase();
            const publisherName = this.getPublisherName(book.publisherId).toLowerCase();
            
            return book.title.toLowerCase().includes(searchTerm) ||
                   authorName.includes(searchTerm) ||
                   book.category.toLowerCase().includes(searchTerm) ||
                   publisherName.includes(searchTerm);
        });
        
        document.querySelector('.table-container').outerHTML = this.createBookTable(filteredBooks);
    },

    getAuthorName(authorId) {
        const author = DataStore.getAll('authors').find(a => a.id === authorId);
        return author ? author.name : 'Tác giả không xác định';
    },

    getPublisherName(publisherId) {
        const publisher = DataStore.getAll('publishers').find(p => p.id === publisherId);
        return publisher ? publisher.name : 'NXB không xác định';
    },

    getBookStatus(book) {
        if (book.quantity <= 0) {
            return '<span class="status-borrowed">Hết sách</span>';
        }

        const loans = DataStore.getAll('loans');
        const activeLoans = loans.filter(loan => 
            loan.bookId === book.id && loan.status === 'active'
        ).length;
        
        if (activeLoans >= book.quantity) {
            return '<span class="status-borrowed">Đã mượn hết</span>';
        }
        return `<span class="status-available">Còn ${book.quantity - activeLoans} quyển</span>`;
    },

    showNewAuthorForm() {
        document.getElementById('authorModal').style.display = 'block';
    },

    showNewPublisherForm() {
        document.getElementById('publisherModal').style.display = 'block';
    },

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        // Clear form fields
        const form = document.querySelector(`#${modalId} form`);
        if (form) form.reset();
    },

    addNewAuthor(event) {
        event.preventDefault();
        const author = {
            name: document.getElementById('newAuthorName').value,
            bio: document.getElementById('newAuthorBio').value || ''
        };

        const newAuthor = DataStore.addAuthor(author);
        
        // Add to select dropdown
        const authorSelect = document.getElementById('authorId');
        const option = document.createElement('option');
        option.value = newAuthor.id;
        option.text = newAuthor.name;
        option.selected = true;
        authorSelect.appendChild(option);

        UI.showMessage('Thêm tác giả thành công!', 'success');
        this.closeModal('authorModal');
    },

    addNewPublisher(event) {
        event.preventDefault();
        const publisher = {
            name: document.getElementById('newPublisherName').value,
            phone: document.getElementById('newPublisherPhone').value,
            email: document.getElementById('newPublisherEmail').value,
            address: document.getElementById('newPublisherAddress').value
        };

        const newPublisher = DataStore.addPublisher(publisher);
        
        // Add to select dropdown
        const publisherSelect = document.getElementById('publisherId');
        const option = document.createElement('option');
        option.value = newPublisher.id;
        option.text = newPublisher.name;
        option.selected = true;
        publisherSelect.appendChild(option);

        UI.showMessage('Thêm nhà xuất bản thành công!', 'success');
        this.closeModal('publisherModal');
    },

    showQuickAddAuthor() {
        this.showNewAuthorForm();
    },

    showQuickAddPublisher() {
        this.showNewPublisherForm();
    }
};