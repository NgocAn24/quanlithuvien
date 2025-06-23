const AuthorModule = {
        showAuthorManagement() {
            const content = document.getElementById('content');
            const authors = DataStore.getAll('authors');

            content.innerHTML = `
            <h2>Quản lý Tác giả</h2>
            <div class="actions">
                <button class="button button-primary" onclick="AuthorModule.showAddAuthorForm()">Thêm Tác giả Mới</button>
            </div>
            <div class="search-bar">
                <input type="text" id="authorSearch" placeholder="Tìm kiếm theo tên hoặc email..." 
                       onkeyup="AuthorModule.filterAuthors()">
            </div>
            ${this.createAuthorTable(authors)}
        `;
        },

        createAuthorTable(authors) {
            const headers = ['Tên', 'Bút danh', 'Email', 'Năm sinh', 'Số sách'];
            const rows = authors.map(author => ({
                id: author.id,
                data: [
                    author.name,
                    author.penName || '-',
                    author.email,
                    author.birthYear || '-',
                    this.getBookCount(author.id)
                ]
            }));

            const actions = [
                { text: 'Sửa', onclick: 'AuthorModule.editAuthor({id})', class: 'button-secondary' },
                { text: 'Xem sách', onclick: 'AuthorModule.viewBooks({id})', class: 'button-secondary' },
                { text: 'Xóa', onclick: 'AuthorModule.deleteAuthor({id})', class: 'button-danger' }
            ];

            return UI.createTable(headers, rows, actions);
        },

        showAddAuthorForm() {
            const fields = [
                { type: 'text', id: 'name', label: 'Họ và tên', required: true },
                { type: 'text', id: 'penName', label: 'Bút danh', required: false },
                { type: 'email', id: 'email', label: 'Email', required: true },
                { type: 'textarea', id: 'address', label: 'Địa chỉ', required: false },
                { type: 'number', id: 'birthYear', label: 'Năm sinh', required: false, min: 1800, max: new Date().getFullYear() }
            ];

            const content = document.getElementById('content');
            content.innerHTML = `
            <h2>Thêm Tác giả Mới</h2>
            ${UI.createForm(fields, 'AuthorModule.addAuthor(event)', 'AuthorModule.showAuthorManagement()')}
        `;
        },

        addAuthor(event) {
            event.preventDefault();
            const author = {
                name: document.getElementById('name').value,
                penName: document.getElementById('penName').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                birthYear: document.getElementById('birthYear').value ? parseInt(document.getElementById('birthYear').value) : null
            };

            DataStore.addAuthor(author);
            UI.showMessage('Thêm tác giả thành công!', 'success');
            this.showAuthorManagement();
        },

        editAuthor(authorId) {
            const author = DataStore.getAll('authors').find(a => a.id === authorId);
            if (!author) return;

            const fields = [
                { type: 'text', id: 'name', label: 'Full Name', required: true, value: author.name },
                { type: 'text', id: 'penName', label: 'Pen Name / Alias', required: false, value: author.penName || '' },
                { type: 'email', id: 'email', label: 'Email', required: true, value: author.email },
                { type: 'textarea', id: 'address', label: 'Address', required: false, value: author.address || '' },
                { type: 'number', id: 'birthYear', label: 'Birth Year', required: false, min: 1800, max: new Date().getFullYear(), value: author.birthYear || '' }
            ];

            const content = document.getElementById('content');
            content.innerHTML = `
            <h2>Chỉnh sửa Tác giả</h2>
            ${UI.createForm(fields, `AuthorModule.updateAuthor(event, ${authorId})`, 'AuthorModule.showAuthorManagement()')}
        `;
    },

    updateAuthor(event, authorId) {
        event.preventDefault();
        const updatedAuthor = {
            name: document.getElementById('name').value,
            penName: document.getElementById('penName').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            birthYear: document.getElementById('birthYear').value ? parseInt(document.getElementById('birthYear').value) : null
        };

        if (DataStore.updateAuthor(authorId, updatedAuthor)) {
            UI.showMessage('Cập nhật tác giả thành công!', 'success');
            this.showAuthorManagement();
        } else {
            UI.showMessage('Cập nhật tác giả thất bại', 'error');
        }
    },

    deleteAuthor(authorId) {
        // Check if author has books
        const books = DataStore.getAll('books').filter(book => book.authorId === authorId);
        
        if (books.length > 0) {
            UI.showMessage('Cannot delete author with existing books', 'error');
            return;
        }

        if (confirm('Bạn có chắc chắn muốn xóa tác giả này?')) {
            DataStore.deleteAuthor(authorId);
            UI.showMessage('Xóa tác giả thành công!', 'success');
            this.showAuthorManagement();
        }
    },

    viewBooks(authorId) {
        const author = DataStore.getAll('authors').find(a => a.id === authorId);
        if (!author) return;

        const books = DataStore.getAll('books').filter(book => book.authorId === authorId);
        const publishers = DataStore.getAll('publishers');

        const content = document.getElementById('content');
        content.innerHTML = `
            <h2>Books by ${author.name}</h2>
            <div class="author-info">
                <p><strong>Author:</strong> ${author.name}</p>
                ${author.penName ? `<p><strong>Pen Name:</strong> ${author.penName}</p>` : ''}
                <p><strong>Email:</strong> ${author.email}</p>
                ${author.birthYear ? `<p><strong>Birth Year:</strong> ${author.birthYear}</p>` : ''}
            </div>
            ${this.createAuthorBooksTable(books, publishers)}
            <div class="actions">
                <button class="button" onclick="AuthorModule.showAuthorManagement()">Back to Authors</button>
            </div>
        `;
    },

    createAuthorBooksTable(books, publishers) {
        if (books.length === 0) {
            return '<p>No books found for this author.</p>';
        }

        const headers = ['Title', 'Category', 'Publisher', 'Quantity', 'Location'];
        const rows = books.map(book => {
            const publisher = publishers.find(p => p.id === book.publisherId);
            return {
                id: book.id,
                data: [
                    book.title,
                    book.category,
                    publisher ? publisher.name : 'Unknown Publisher',
                    book.quantity,
                    book.location
                ]
            };
        });

        return UI.createTable(headers, rows);
    },

    filterAuthors() {
        const searchTerm = document.getElementById('authorSearch').value.toLowerCase();
        const authors = DataStore.getAll('authors');
        const filteredAuthors = authors.filter(author => 
            author.name.toLowerCase().includes(searchTerm) ||
            (author.penName && author.penName.toLowerCase().includes(searchTerm)) ||
            author.email.toLowerCase().includes(searchTerm)
        );
        
        document.querySelector('.table-container').outerHTML = this.createAuthorTable(filteredAuthors);
    },

    getBookCount(authorId) {
        const books = DataStore.getAll('books');
        return books.filter(book => book.authorId === authorId).length;
    }
};