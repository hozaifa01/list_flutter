document.addEventListener('DOMContentLoaded', () => {
    // جلب العناصر من الصفحة
    const addItemForm = document.getElementById('add-item-form');
    const itemNameInput = document.getElementById('item-name');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemUnit = document.getElementById('item-unit');
    const itemPriceInput = document.getElementById('item-price');
    const shoppingList = document.getElementById('shopping-list');
    const totalPriceEl = document.getElementById('total-price');
    const newListBtn = document.getElementById('new-list-btn');
    const saveListBtn = document.getElementById('save-list-btn');
    const savedListsTableBody = document.querySelector('#saved-lists-table tbody');
    const currentListTitle = document.getElementById('current-list-title');

    // متغيرات لتخزين حالة التطبيق
    let currentList = [];
    let savedLists = JSON.parse(localStorage.getItem('shoppingLists')) || [];
    let currentListId = null;

    // دالة لرسم قائمة التسوق الحالية
    function renderCurrentList() {
        shoppingList.innerHTML = '';
        let total = 0;
        currentList.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <span>${item.name} (الكمية: ${item.quantity} ${item.unit})</span>
                    <span> - ${item.price.toFixed(2)}</span>
                </div>
                <div class="item-actions">
                    <button class="remove-item-btn" data-index="${index}" title="حذف المنتج">❌</button>
                </div>
            `;
            shoppingList.appendChild(li);
            total += item.price ;
        });
        totalPriceEl.textContent = total.toFixed(2);
        updateSaveButtonState();
    }

    // دالة لرسم جدول القوائم المحفوظة
    function renderSavedLists() {
        savedListsTableBody.innerHTML = '';
        savedLists.forEach((list, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(list.id).toLocaleString('en-US')}</td>
                <td>${list.items.length}</td>
                <td>
                    <button class="action-btn view-btn" data-index="${index}">استعراض</button>
                    <button class="action-btn delete-btn" data-index="${index}">حذف</button>
                </td>
            `;
            savedListsTableBody.appendChild(tr);
        });
    }

    // دالة لتحديث حالة زر الحفظ
    function updateSaveButtonState() {
        if (currentList.length === 0) {
            saveListBtn.disabled = true;
            saveListBtn.style.cursor = 'not-allowed';
        } else {
            saveListBtn.disabled = false;
            saveListBtn.style.cursor = 'pointer';
        }
    }

    // إضافة منتج جديد
    addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newItem = {
        name: itemNameInput.value,
        quantity: parseFloat(itemQuantityInput.value),
        unit: itemUnit.value,
        price: parseFloat(itemPriceInput.value)
    };
    currentList.push(newItem);
    renderCurrentList();
    itemNameInput.value = '';
    itemQuantityInput.value = '1';
    itemPriceInput.value = '';
});

    // حذف منتج من القائمة الحالية
    shoppingList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
          
            if (confirm('هل أنت متأكد من رغبتك في حذف هذه القائمة؟')) {
            
            const index = e.target.getAttribute('data-index');
            currentList.splice(index, 1);
            renderCurrentList();
        }}
    });

    // بدء قائمة جديدة
    newListBtn.addEventListener('click', () => {
        currentList = [];
        currentListId = null;
        currentListTitle.textContent = 'قائمة تسوق جديدة';
        renderCurrentList();
    });

    // حفظ القائمة الحالية
    saveListBtn.addEventListener('click', () => {
        if (currentList.length === 0) return;
        if (currentListId) {
            // تحديث قائمة موجود
            const listIndex = savedLists.findIndex(list => list.id === currentListId);
            if (listIndex > -1) {
                savedLists[listIndex].items = currentList;
            }
        } else {
            // حفظ قائمة جديدة
            const newList = {
                id: Date.now(),
                items: currentList
            };
            savedLists.push(newList);
            currentListId = newList.id;
            currentListTitle.textContent = `قائمة تسوق (${new Date(currentListId).toLocaleDateString('en-US')})`;
        }
        localStorage.setItem('shoppingLists', JSON.stringify(savedLists));
        renderSavedLists();
        alert('تم حفظ القائمة بنجاح!');
    });

    // التعامل مع أزرار القوائم المحفوظة (استعراض وحذف)
    savedListsTableBody.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('view-btn')) {
            const listToView = savedLists[index];
            currentList = [...listToView.items];
            currentListId = listToView.id;
            currentListTitle.textContent = `قائمة تسوق (${new Date(currentListId).toLocaleDateString('en-US')})`;
            renderCurrentList();
            window.scrollTo(0, 0); // الانتقال لأعلى الصفحة
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('هل أنت متأكد من رغبتك في حذف هذه القائمة؟')) {
                savedLists.splice(index, 1);
                localStorage.setItem('shoppingLists', JSON.stringify(savedLists));
                renderSavedLists();
                // إذا كانت القائمة المحذوفة هي نفسها القائمة الحالية
                if (currentListId === savedLists[index]?.id) {
                    newListBtn.click();
                }
            }
        }
    });
    // تهيئة التطبيق عند التحميل
    renderCurrentList();
    renderSavedLists();
});