const authState = {
    mode: 'signin',
    role: 'customer'
};

const roleButtons = Array.from(document.querySelectorAll('.role-card'));
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const submitBtn = document.getElementById('submit-btn');
const toggleBtn = document.getElementById('toggle-mode');
const statusNote = document.getElementById('status-note');
const authForm = document.getElementById('auth-form');

function updateRoleSelection(role){
    authState.role = role;
    roleButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });
    statusNote.textContent = `Signing in as a ${role === 'owner' ? 'shop owner' : 'customer'}.`;
    statusNote.style.color = 'var(--ink)';
}

function updateMode(mode){
    authState.mode = mode;
    if (mode === 'signup'){
        formTitle.textContent = 'Create account';
        formSubtitle.textContent = 'Start a new customer or owner account with the same theme.';
        submitBtn.textContent = 'Create account';
        toggleBtn.textContent = 'Already have an account? Sign in';
    } else {
        formTitle.textContent = 'Sign in';
        formSubtitle.textContent = 'Pick an account type and continue to the right workspace.';
        submitBtn.textContent = 'Continue';
        toggleBtn.textContent = 'Create account';
    }
}

function persistAuth(user){
    const sessionUser = { ...user, password: undefined };
    const ok = saveStored('shop-user', sessionUser, { alsoSession: true });
    if (!ok) {
        statusNote.textContent = 'Your browser blocked sign-in state from being stored. Please allow local storage for this demo.';
        statusNote.style.color = '#bf3f3f';
        return false;
    }
    return true;
}

roleButtons.forEach(button => {
    button.addEventListener('click', () => updateRoleSelection(button.dataset.role));
});

toggleBtn.addEventListener('click', () => {
    updateMode(authState.mode === 'signin' ? 'signup' : 'signin');
});

authForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    if (!name || !email) {
        statusNote.textContent = 'Please provide both name and email to continue.';
        statusNote.style.color = '#bf3f3f';
        return;
    }
    const user = {
        name,
        email,
        role: authState.role,
        type: authState.mode === 'signup' ? 'new' : 'returning',
        authenticated: true
    };
    if (!persistAuth(user)) return;
    statusNote.textContent = `${authState.mode === 'signup' ? 'Account created' : 'Signed in'} as ${authState.role === 'owner' ? 'shop owner' : 'customer'}. Redirecting…`;
    statusNote.style.color = 'var(--ink)';
    setTimeout(() => {
        window.location.href = authState.role === 'owner' ? 'owner.html' : 'choose-owner.html';
    }, 450);
});

updateRoleSelection(authState.role);
updateMode('signin');
