const PublisherModule = {
        showPublisherManagement() {
            const content = document.getElementById('content');
            const publishers = DataStore.getAll('publishers');

            content.innerHTML = `
            <h2>Quản lý Nhà xuất bản</h2>
            <div class="actions">
                <button class="button button-primary" onclick="PublisherModule.showAddPublisherForm()">Thêm Nhà xuất bản Mới</button>
            </div>
            <div class="search-bar">
                <input type="text" id="publisherSearch" placeholder="Tìm kiếm theo tên, điện thoại hoặc email..." 
                       onkeyup="PublisherModule.filterPublishers()">
            </div>
            ${this.createPublisherTable(publishers)}
        `;
        },

        createPublisherTable(publishers) {
            const headers = ['Tên', 'Điện thoại', 'Email', 'Địa chỉ', 'Số sách'];
            const rows = publishers.map(publisher => ({
                id: publisher.id,
                data: [
                    publisher.name,
                    publisher.phone,
                    publisher.email,
                    publisher.address,
                    this.getBookCount(publisher.id)
                ]
            }));

            const actions = [
                { text: 'Sửa', onclick: 'PublisherModule.editPublisher({id})', class: 'button-secondary' },
                { text: 'Xem sách', onclick: 'PublisherModule.viewBooks({id})', class: 'button-secondary' },
                { text: 'Xóa', onclick: 'PublisherModule.deletePublisher({id})', class: 'button-danger' }
            ];

            return UI.createTable(headers, rows, actions);
        },

        showAddPublisherForm() {
            const fields = [
                { type: 'text', id: 'name', label: 'Tên nhà xuất bản', required: true },
                { type: 'tel', id: 'phone', label: 'Số điện thoại', required: true },
                { type: 'email', id: 'email', label: 'Email', required: true },
                { type: 'textarea', id: 'address', label: 'Địa chỉ', required: true }
            ];

            const content = document.getElementById('content');
            content.innerHTML = `
            <h2>Thêm Nhà xuất bản Mới</h2>
            ${UI.createForm(fields, 'PublisherModule.addPublisher(event)', 'PublisherModule.showPublisherManagement()')}
        `;
        },

        addPublisher(event) {
            event.preventDefault();
            const publisher = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value
            };

            DataStore.addPublisher(publisher);
            UI.showMessage('Thêm nhà xuất bản thành công!', 'success');
            this.showPublisherManagement();
        },

        editPublisher(publisherId) {
            const publisher = DataStore.getAll('publishers').find(p => p.id === publisherId);
            if (!publisher) return;

            const fields = [
                { type: 'text', id: 'name', label: 'Tên nhà xuất bản', required: true, value: publisher.name },
                { type: 'tel', id: 'phone', label: 'Số điện thoại', required: true, value: publisher.phone },
                { type: 'email', id: 'email', label: 'Email', required: true, value: publisher.email },
                { type: 'textarea', id: 'address', label: 'Địa chỉ', required: true, value: publisher.address }
            ];

            const content = document.getElementById('content');
            content.innerHTML = `
            <h2>Chỉnh sửa Nhà xuất bản</h2>
            ${UI.createForm(fields, `PublisherModule.updatePublisher(event, ${publisherId})`, 'PublisherModule.showPublisherManagement()')}
        `;
    },

    updatePublisher(event, publisherId) {
        event.preventDefault();
        const updatedPublisher = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };

        if (DataStore.updatePublisher(publisherId, updatedPublisher)) {
            UI.showMessage('Cập nhật nhà xuất bản thành công!', 'success');
            this.showPublisherManagement();
        } else {
            UI.showMessage('Cập nhật nhà xuất bản thất bại', 'error');
        }
    },

    deletePublisher(publisherId) {
        // Check if publisher has books
        const books = DataStore.getAll('books').filter(book => book.publisherId === publisherId);
        
        if (books.length > 0) {
            UI.showMessage('Không thể xóa nhà xuất bản đang có sách', 'error');
            return;
        }

        if (confirm('Bạn có chắc chắn muốn xóa nhà xuất bản này?')) {
            DataStore.deletePublisher(publisherId);
            UI.showMessage('Xóa nhà xuất bản thành công!', 'success');
            this.showPublisherManagement();
        }
    },

    viewBooks(publisherId) {
        const publisher = DataStore.getAll('publishers').find(p => p.id === publisherId);
        if (!publisher) return;

        const books = DataStore.getAll('books').filter(book => book.publisherId === publisherId);
        const authors = DataStore.getAll('authors');

        const content = document.getElementById('content');
        content.innerHTML = `
            <h2>Sách của ${publisher.name}</h2>
            <div class="publisher-info">
                <p><strong>Nhà xuất bản:</strong> ${publisher.name}</p>
                <p><strong>Điện thoại:</strong> ${publisher.phone}</p>
                <p><strong>Email:</strong> ${publisher.email}</p>
                <p><strong>Địa chỉ:</strong> ${publisher.address}</p>
            </div>
            ${this.createPublisherBooksTable(books, authors)}
            <div class="actions">
                <button class="button" onclick="PublisherModule.showPublisherManagement()">Quay lại</button>
            </div>
        `;
    },

    createPublisherBooksTable(books, authors) {
        if (books.length === 0) {
            return '<p>Không tìm thấy sách nào của nhà xuất bản này.</p>';
        }

        const headers = ['Tên sách', 'Tác giả', 'Thể loại', 'Số lượng', 'Vị trí'];
        const rows = books.map(book => {
            const author = authors.find(a => a.id === book.authorId);
            return {
                id: book.id,
                data: [
                    book.title,
                    author ? author.name : 'Tác giả không xác định',
                    book.category,
                    book.quantity,
                    book.location
                ]
            };
        });

        return UI.createTable(headers, rows);
    },

    filterPublishers() {
        const searchTerm = document.getElementById('publisherSearch').value.toLowerCase();
        const publishers = DataStore.getAll('publishers');
        const filteredPublishers = publishers.filter(publisher => 
            publisher.name.toLowerCase().includes(searchTerm) ||
            publisher.phone.includes(searchTerm) ||
            publisher.email.toLowerCase().includes(searchTerm) ||
            publisher.address.toLowerCase().includes(searchTerm)
        );
        
        document.querySelector('.table-container').outerHTML = this.createPublisherTable(filteredPublishers);
    },

    getBookCount(publisherId) {
        const books = DataStore.getAll('books');
        return books.filter(book => book.publisherId === publisherId).length;
    }
};