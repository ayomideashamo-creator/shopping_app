/* ================= STATE ================= */
const S = {
    view: 'customer',
    items: [],
    orders: [],
    cart: {},            // itemId -> qty
    searchQuery: '',
    loading: true,
    storageError: null,
    cartMessage: null,   // {type:'error'|'success', text}
    confirmation: null,
    ownerTab: 'tickets',
    receiptOrder: null,
    showReceiptModal: false,
    showConfirmModal: false
};

const SHOP_NAME = "The Counter";
const SHOP_TAGLINE = "Order it. We'll have it ready.";

function defaultItems(){
    return [
        {id:'itm_bread', name:'Bread', price:3.00, stock:20},
        {id:'itm_milk', name:'Milk', price:2.50, stock:15},
        {id:'itm_eggs', name:'Eggs (dozen)', price:4.20, stock:10},
        {id:'itm_coffee', name:'Coffee', price:7.50, stock:8},
        {id:'itm_apples', name:'Apples (kg)', price:2.80, stock:25},
        {id:'itm_soap', name:'Soap', price:1.90, stock:30}
    ];
}

async function loadItemsFromStorage(){
    return loadStored('shop-items', null);
}
async function saveItemsToStorage(items){
    return saveStored('shop-items', items);
}
async function loadOrdersFromStorage(){
    return loadStored('shop-orders', []);
}
async function saveOrdersToStorage(orders){
    return saveStored('shop-orders', orders);
}

function loadUserFromLocalStorage(){
    return loadStored('shop-user', null, { sessionFallback: true });
}

function getStartingView(){
    const user = loadUserFromLocalStorage();
    if (user && (user.role === 'owner' || user.role === 'customer')){
        return user.role;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('role') === 'owner' ? 'owner' : 'customer';
}

async function init(){
    S.view = getStartingView();
    const loadedItems = await loadItemsFromStorage();
    if (loadedItems){
        S.items = loadedItems;
    } else {
        S.items = defaultItems();
        await saveItemsToStorage(S.items);
    }
    S.orders = await loadOrdersFromStorage();
    S.loading = false;
    render();
}

/* ================= UTIL ================= */
function money(n){ return '₦' + Number(n).toFixed(2); }
function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function genId(){ return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function cartTotal(){
    return Object.entries(S.cart).reduce((sum,[id,qty]) => {
        const it = S.items.find(i => i.id === id);
        return it ? sum + it.price*qty : sum;
    }, 0);
}

/* ================= CUSTOMER ACTIONS ================= */
function changeCartQty(itemId, delta){
    const item = S.items.find(i => i.id === itemId);
    if (!item) return;
    const current = S.cart[itemId] || 0;
    const next = Math.max(0, Math.min(item.stock, current + delta));
    if (next === 0) delete S.cart[itemId];
    else S.cart[itemId] = next;
    S.cartMessage = null;
    render();
}

function removeCartItem(itemId){
    if (S.cart[itemId]){
        delete S.cart[itemId];
        S.cartMessage = null;
        render();
    }
}

function openConfirmModal(){
    if (Object.keys(S.cart).length === 0){
        S.cartMessage = {type:'error', text:'Add at least one item before reviewing your ticket.'};
        render();
        return;
    }
    S.showConfirmModal = true;
    S.cartMessage = null;
    render();
}

function closeConfirmModal(){
    S.showConfirmModal = false;
    render();
}

function confirmOrder(){
    S.showConfirmModal = false;
    sendTicket();
}

async function sendTicket(){
    S.showConfirmModal = false;
    const nameInput = document.getElementById('customer-name-input');
    const customerName = (nameInput && nameInput.value.trim()) || 'Guest';
    const cartEntries = Object.entries(S.cart);
    if (cartEntries.length === 0){
        S.cartMessage = {type:'error', text:'Add at least one item before sending your list.'};
        render();
        return;
    }
    const orderItems = cartEntries.map(([id,qty]) => {
        const it = S.items.find(i => i.id === id);
        return {id: it.id, name: it.name, price: it.price, qty};
    });
    const total = orderItems.reduce((s,i) => s + i.price*i.qty, 0);

    const latestOrders = await loadOrdersFromStorage();
    const ticketNumber = '#' + String(latestOrders.length + 1).padStart(4,'0');
    const order = {
        id: genId(),
        ticketNumber,
        customerName,
        items: orderItems,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    latestOrders.push(order);
    const ok = await saveOrdersToStorage(latestOrders);
    if (!ok){
        S.cartMessage = {type:'error', text:"Couldn't reach the shop right now. Try sending again."};
        render();
        return;
    }
    S.orders = latestOrders;
    S.cart = {};
    S.cartMessage = {type:'success', text: `Sent! Ticket ${ticketNumber} is on its way to the owner.`};
    if (nameInput) nameInput.value = '';
    render();
}

/* ================= OWNER: LEDGER (ITEMS) ACTIONS ================= */
function setOwnerTab(tab){ S.ownerTab = tab; render(); }

async function addItem(){
    const nameEl = document.getElementById('new-item-name');
    const priceEl = document.getElementById('new-item-price');
    const stockEl = document.getElementById('new-item-stock');
    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);
    const stock = parseInt(stockEl.value, 10);
    if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0){
        S.storageError = 'Give the item a name, a price, and a stock count to add it to the shelf.';
        render();
        return;
    }
    const latest = await loadItemsFromStorage() || S.items;
    latest.push({id: genId(), name, price, stock});
    await saveItemsToStorage(latest);
    S.items = latest;
    S.storageError = null;
    render();
}

async function removeItem(itemId){
    const latest = (await loadItemsFromStorage() || S.items).filter(i => i.id !== itemId);
    await saveItemsToStorage(latest);
    S.items = latest;
    render();
}

async function updateItemField(itemId, field, value){
    const latest = await loadItemsFromStorage() || S.items;
    const item = latest.find(i => i.id === itemId);
    if (!item) return;
    if (field === 'price'){
        const v = parseFloat(value);
        if (!isNaN(v) && v >= 0) item.price = v;
    } else if (field === 'stock'){
        const v = parseInt(value, 10);
        if (!isNaN(v) && v >= 0) item.stock = v;
    } else if (field === 'name'){
        if (value.trim()) item.name = value.trim();
    }
    await saveItemsToStorage(latest);
    S.items = latest;
    render();
}

/* ================= OWNER: ORDERS ACTIONS ================= */
async function markFulfilled(orderId){
    const latestOrders = await loadOrdersFromStorage();
    const order = latestOrders.find(o => o.id === orderId);
    if (!order || order.status === 'fulfilled') return;
    order.status = 'fulfilled';

    const latestItems = await loadItemsFromStorage() || S.items;
    order.items.forEach(li => {
        const it = latestItems.find(i => i.id === li.id);
        if (it) it.stock = Math.max(0, it.stock - li.qty);
    });

    await saveOrdersToStorage(latestOrders);
    await saveItemsToStorage(latestItems);
    S.orders = latestOrders;
    S.items = latestItems;
    render();
}

function openReceipt(orderId){
    const order = S.orders.find(o => o.id === orderId);
    if (!order) return;
    S.receiptOrder = order;
    S.showReceiptModal = true;
    render();
}
function closeReceiptModal(){
    S.showReceiptModal = false;
    S.receiptOrder = null;
    render();
}
function doPrint(){ window.print(); }

/* ================= VIEW SWITCH ================= */
function setView(v){
    S.view = v;
    S.cartMessage = null;
    render();
}

/* ================= RENDER ================= */
function render(){
    const app = document.getElementById('app');
    if (S.loading){
        app.innerHTML = `<div style="text-align:center;padding:80px 0;font-family:'Special Elite';color:var(--paper-2);">Opening the shop…</div>`;
        return;
    }
    app.innerHTML = renderHeader() + (S.view === 'customer' ? renderCustomer() : renderOwner()) + (S.showConfirmModal ? renderConfirmModal() : '') + (S.showReceiptModal ? renderReceiptModal() : '');
}

function renderHeader(){
    return `
<header>
    <div>
    <div class="shop-title display">${escapeHtml(SHOP_NAME)}</div>
    <div class="shop-tagline">${escapeHtml(SHOP_TAGLINE)}</div>
    </div>
    <div class="role-toggle">
    <button class="${S.view==='customer'?'active':''}" onclick="setView('customer')">Customer Counter</button>
    <button class="${S.view==='owner'?'active':''}" onclick="setView('owner')">Owner's Desk</button>
    </div>
</header>`;
}

function setSearchQuery(value){
    S.searchQuery = value;
    render();
}

function renderCustomer(){
    const cartEntries = Object.entries(S.cart);
    const searchTerm = S.searchQuery.trim().toLowerCase();
    const visibleItems = searchTerm
        ? S.items.filter(item => item.name.toLowerCase().includes(searchTerm))
        : S.items;
    const shelfHtml = S.items.length === 0
        ? `<div class="empty-note">The shelf is bare right now — check back soon.</div>`
        : visibleItems.length === 0
            ? `<div class="empty-note">No shelf items match “${escapeHtml(S.searchQuery)}”.</div>`
            : `<div class="shelf-grid">${visibleItems.map(renderItemCard).join('')}</div>`;

    const ticketRows = cartEntries.length === 0
        ? `<div class="empty-note">Your ticket is empty — pick items from the shelf to start one.</div>`
        : cartEntries.map(([id,qty]) => {
            const it = S.items.find(i => i.id === id) || {name:'Unknown item', price:0};
            return `<div class="ticket-row">
        <span class="li-name">${escapeHtml(it.name)}</span>
        <span class="li-qty">${qty}×</span>
        <span class="li-price">${money(it.price*qty)}</span>
        </div>`;
        }).join('');

    const msg = S.cartMessage ? `<div class="note ${S.cartMessage.type}">${escapeHtml(S.cartMessage.text)}</div>` : '';

    return `
<div class="customer-grid">
    <div class="panel">
        <div class="shelf-title">On the shelf</div>
        <div class="shelf-toolbar">
            <input
                class="search-input"
                type="text"
                placeholder="Search shelf items…"
                value="${escapeHtml(S.searchQuery)}"
                oninput="setSearchQuery(this.value)"
            >
        </div>
        ${shelfHtml}
    </div>
    <div class="panel ticket">
        <div class="ticket-header">Order ticket</div>
        <input type="text" id="customer-name-input" placeholder="Your name (optional)">
        ${ticketRows}
        <div class="ticket-total"><span>Total</span><span>${money(cartTotal())}</span></div>
        <button class="send-btn" onclick="openConfirmModal()" ${cartEntries.length===0?'disabled':''}>Review order</button>
        ${msg}
    </div>
</div>`;
}

function renderItemCard(item){
    const inCart = S.cart[item.id] || 0;
    const remaining = item.stock - inCart;
    const isOut = item.stock <= 0;
    return `
<div class="item-card ${isOut?'out':''}">
    <div class="item-name">${escapeHtml(item.name)}</div>
    <div class="item-price ledger-num">${money(item.price)}</div>
    <div class="item-stock">${isOut ? 'Out of stock' : remaining + ' left'}</div>
    <div class="qty-row">
    <div class="stepper">
        <button onclick="changeCartQty('${item.id}', -1)" ${inCart===0?'disabled':''}>−</button>
        <span>${inCart}</span>
        <button onclick="changeCartQty('${item.id}', 1)" ${remaining<=0?'disabled':''}>+</button>
    </div>
    </div>
</div>`;
}

function renderOwner(){
    return `
<div class="owner-tabs">
    <button class="${S.ownerTab==='tickets'?'active':''}" onclick="setOwnerTab('tickets')">Incoming Tickets</button>
    <button class="${S.ownerTab==='ledger'?'active':''}" onclick="setOwnerTab('ledger')">Stock Ledger</button>
</div>
<div class="panel">
    ${S.ownerTab === 'tickets' ? renderOwnerTickets() : renderOwnerLedger()}
</div>`;
}

function renderOwnerTickets(){
    if (S.orders.length === 0){
        return `<div class="empty-note">No tickets yet — orders sent by customers will land here.</div>`;
    }
    const sorted = [...S.orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted.map(order => {
        const stampColor = order.status === 'fulfilled' ? 'var(--mint)' : 'var(--brass)';
        const itemsHtml = order.items.map(li =>
        `<div class="row"><span>${li.qty}× ${escapeHtml(li.name)}</span><span>${money(li.price*li.qty)}</span></div>`
        ).join('');
        return `
    <div class="ticket-stub">
    <div class="stub-left">
        <div class="stub-customer">${escapeHtml(order.customerName)} <span class="ledger-num" style="color:#8a8273;font-size:12px;">${order.ticketNumber}</span></div>
        <div class="stub-meta">${new Date(order.createdAt).toLocaleString()}</div>
        <div class="stub-items">${itemsHtml}</div>
        <div class="stub-total">Total: ${money(order.total)}</div>
    </div>
    <div class="stub-right">
        <span class="stamp" style="color:${stampColor};border-color:${stampColor};">${order.status}</span>
        <div class="stub-actions">
        <button class="btn-outline" onclick="openReceipt('${order.id}')">Print Receipt</button>
        ${order.status === 'pending' ? `<button class="btn-fill" onclick="markFulfilled('${order.id}')">Mark Fulfilled</button>` : ''}
        </div>
    </div>
    </div>`;
    }).join('');
}

function renderOwnerLedger(){
    const errNote = S.storageError ? `<div class="note error">${escapeHtml(S.storageError)}</div>` : '';
    const rows = S.items.length === 0
        ? `<tr><td colspan="4" class="empty-note">The shelf is bare — add an item below to stock it.</td></tr>`
        : S.items.map(item => `
    <tr>
        <td><input value="${escapeHtml(item.name)}" onchange="updateItemField('${item.id}','name',this.value)"></td>
        <td><input type="number" step="0.01" min="0" value="${item.price}" onchange="updateItemField('${item.id}','price',this.value)"></td>
        <td><input type="number" min="0" value="${item.stock}" onchange="updateItemField('${item.id}','stock',this.value)"></td>
        <td><button class="remove-x" onclick="removeItem('${item.id}')" title="Remove item">×</button></td>
    </tr>`).join('');

    return `
<table class="ledger">
    <thead><tr><th>Item</th><th>Price</th><th>Stock</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
</table>
<div class="add-row">
    <input id="new-item-name" type="text" placeholder="Item name">
    <input id="new-item-price" type="number" step="0.01" min="0" placeholder="Price">
    <input id="new-item-stock" type="number" min="0" placeholder="Stock">
    <button onclick="addItem()">Add item</button>
</div>
${errNote}`;
}

function renderConfirmModal(){
    const cartEntries = Object.entries(S.cart);
    if (!S.showConfirmModal || cartEntries.length === 0) return '';
    const cartHtml = cartEntries.map(([id,qty]) => {
        const it = S.items.find(i => i.id === id) || {name:'Unknown item', stock:0};
        const remaining = Math.max(0, it.stock - qty);
        return `
    <div class="confirm-ticket-row">
        <div>${escapeHtml(it.name)}</div>
        <div class="confirm-qty-controls">
            <button onclick="changeCartQty('${id}', -1)" ${qty===0?'disabled':''}>−</button>
            <span>${qty}</span>
            <button onclick="changeCartQty('${id}', 1)" ${remaining===0?'disabled':''}>+</button>
            <button class="remove-x" onclick="removeCartItem('${id}')" title="Remove item">×</button>
        </div>
    </div>`;
    }).join('');
    const availableItems = S.items.filter(item => item.stock > (S.cart[item.id] || 0)).map(item => {
        const canAdd = item.stock > (S.cart[item.id] || 0);
        return `
    <div class="confirm-add-row">
        <span>${escapeHtml(item.name)} ${item.stock - (S.cart[item.id]||0)} left</span>
        <button class="btn-fill" onclick="changeCartQty('${item.id}', 1)" ${canAdd ? '' : 'disabled'}>Add</button>
    </div>`;
    }).join('');
    return `
<div class="modal-overlay" onclick="if(event.target===this) closeConfirmModal()">
    <div class="modal-box confirm-modal-box">
        <div class="r-center" style="margin-bottom:12px;">
            <div style="font-family:'Special Elite';font-size:16px;color:#1b1b1b;">Confirm your order</div>
            <div style="font-size:12px;color:#8a8273;">Review, update quantities, add more items, or remove items before sending.</div>
        </div>
        <div class="r-divider"></div>
        <div class="r-item" style="color:#1b1b1b;">${cartHtml}</div>
        <div class="r-total" style="margin-top:10px;color:#1b1b1b;"><span>Subtotal</span><span>${money(cartTotal())}</span></div>
        <div class="r-divider"></div>
        <div class="confirm-title">Add more items</div>
        <div class="r-item">${availableItems || '<div class="empty-note">Nothing else left on the shelf.</div>'}</div>
        <div class="modal-actions" style="margin-top:18px;">
            <button class="print-btn" onclick="confirmOrder()">Confirm order</button>
            <button class="close-btn" onclick="closeConfirmModal()">Cancel</button>
        </div>
    </div>
</div>`;
}

function renderReceiptModal(){
    const order = S.receiptOrder;
    if (!order) return '';
    const itemsHtml = order.items.map(li => `
    <div class="r-row"><span>${li.qty}× ${escapeHtml(li.name)}</span><span>${money(li.price*li.qty)}</span></div>
`).join('');
    return `
<div class="modal-overlay" onclick="if(event.target===this) closeReceiptModal()">
    <div class="modal-box">
    <div id="receipt-print-area">
        <div class="r-center" style="margin-bottom:6px;">
        <div style="font-family:'Special Elite';font-size:15px;">${escapeHtml(SHOP_NAME)}</div>
        <div style="font-size:11px;">${escapeHtml(SHOP_TAGLINE)}</div>
        </div>
        <div class="r-divider"></div>
        <div class="r-row"><span>Ticket ${order.ticketNumber}</span><span>${new Date(order.createdAt).toLocaleDateString()}</span></div>
        <div class="r-row"><span>Customer:</span><span>${escapeHtml(order.customerName)}</span></div>
        <div class="r-divider"></div>
        ${itemsHtml}
        <div class="r-divider"></div>
        <div class="r-total"><span>TOTAL</span><span>${money(order.total)}</span></div>
        <div class="r-center" style="margin-top:14px;font-size:11px;">THANK YOU — COME AGAIN</div>
        <div class="r-center" style="margin-top:10px;">
        <span class="stamp" style="color:var(--stamp);border-color:var(--stamp);">Paid ${order.ticketNumber}</span>
        </div>
    </div>
    <div class="modal-actions">
        <button class="print-btn" onclick="doPrint()">Print</button>
        <button class="close-btn" onclick="closeReceiptModal()">Close</button>
    </div>
    </div>
</div>`;
}

init();
