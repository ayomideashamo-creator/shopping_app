const KNOWN_OWNERS = [
    {id:'owner_olurotimi', name:'Olurotimi’s Shop', description:'Warm neighborhood staples and quick service.'},
    {id:'owner_nadine', name:'Nadine’s Pantry', description:'Fresh everyday goods curated for your counter.'},
    {id:'owner_tunde', name:'Tunde’s Corner', description:'Friendly service and well-stocked shelves all week.'}
];

const state = {
    selectedOwnerId: null,
    user: null,
    shops: []
};

const ownerList = document.getElementById('owner-list');
const continueBtn = document.getElementById('continue-btn');
const ownerWelcome = document.getElementById('owner-welcome');

function loadUser(){
    return loadStored('shop-user', null, { sessionFallback: true });
}

function loadSavedShops(){
    const ownerScope = state.user?.email || state.user?.name || 'guest';
    return loadStored('shop-list', [], { ownerId: ownerScope });
}

function getOwnerList(){
    const savedShops = state.shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        description: shop.description
    }));
    return [...KNOWN_OWNERS, ...savedShops];
}

function renderOwners(){
    ownerList.innerHTML = getOwnerList().map(owner => {
        const active = owner.id === state.selectedOwnerId ? 'active' : '';
        return `
            <button type="button" class="owner-tile ${active}" data-owner="${owner.id}">
                <h3>${escapeHtml(owner.name)}</h3>
                <p>${escapeHtml(owner.description)}</p>
            </button>
        `;
    }).join('');
    document.querySelectorAll('.owner-tile').forEach(tile => {
        tile.addEventListener('click', () => selectOwner(tile.dataset.owner));
    });
}

function escapeHtml(s){
    return String(s).replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function selectOwner(ownerId){
    state.selectedOwnerId = ownerId;
    continueBtn.disabled = false;
    renderOwners();
}

function saveSelectedOwner(owner){
    saveStored('shop-owner', owner);
}

function continueToCustomer(){
    if (!state.selectedOwnerId) return;
    const selected = getOwnerList().find(owner => owner.id === state.selectedOwnerId);
    if (!selected) return;
    saveSelectedOwner(selected);
    window.location.href = 'customer.html';
}

function init(){
    state.user = loadUser();
    state.shops = loadSavedShops();
    if (state.user && state.user.name) {
        ownerWelcome.textContent = `Welcome back, ${state.user.name}. Pick a shop owner to start shopping.`;
    }
    continueBtn.addEventListener('click', continueToCustomer);
    renderOwners();
}

init();