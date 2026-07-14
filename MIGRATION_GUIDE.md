# Repository Cleanup & Setup Guide

## Complete Action Plan for Shopping App Migration

This guide walks you through exactly what to delete and what to keep in your repository.

---

## 🗑️ STEP 1: Delete the Old Vanilla JavaScript Implementation

### Files to Delete (in `/file` directory):

**Location:** `file/` directory at root level

**What's being deleted:**
- Old vanilla JavaScript customer interface
- Old vanilla JavaScript owner dashboard
- Old authentication system
- Old localStorage-based storage utilities
- Test files for old implementation

**Exact files & directories to remove:**

```
file/
├── .gitignore                     ← DELETE
├── package.json                   ← DELETE
├── package-lock.json              ← DELETE
├── storage.js                     ← DELETE
├── storage.test.js                ← DELETE
├── supabase.js                    ← DELETE
├── choose_owner/                  ← DELETE (entire directory)
├── customer/                       ← DELETE (entire directory)
│   ├── customer.css
│   ├── C_home/
│   │   ├── home.html
│   │   └── home.js
│   └── ...
├── new/                           ← DELETE (entire directory)
│   ├── customer.js
│   ├── owner.js
│   └── ...
├── owner/                         ← DELETE (entire directory)
│   └── owner.css
└── sign_in/                       ← DELETE (entire directory)
    ├── signin.html
    ├── signin.css
    └── signin.js
```

### How to Delete:

**Using Git Commands:**

```bash
# Navigate to your repo
cd shopping_app

# Delete the entire /file directory
git rm -r file/

# Check what will be deleted
git status

# Commit the deletion
git commit -m "Remove old vanilla JS implementation - migrate to React + Supabase"

# Push to your repository
git push origin shopping-app
```

**Using GitHub Web UI (if you prefer):**

1. Go to https://github.com/ayomideashamo-creator/shopping_app
2. Click on the `file` folder
3. Click the `...` menu (three dots)
4. Select "Delete directory"
5. Commit the change

**Using File Explorer (then Git):**

```bash
# Remove the directory manually
rm -rf file/

# Stage the deletion
git add -A

# Commit
git commit -m "Remove old vanilla JS implementation"

# Push
git push origin shopping-app
```

---

## ✅ STEP 2: Keep & Use the New React Implementation

### Directory to Keep: `/worked`

**Location:** `worked/` directory (the new React + Supabase app)

**What's inside (KEEP ALL OF THIS):**

```
worked/
├── src/                           ← KEEP ✅
│   ├── components/
│   │   ├── Customer/
│   │   │   ├── CustomerPage.tsx
│   │   │   └── Customer.css
│   │   ├── Owner/
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── OwnerLedger.tsx
│   │   │   ├── OwnerTickets.tsx
│   │   │   ├── Receipt.tsx
│   │   │   └── Owner.css
│   │   └── Auth/
│   │       ├── SignIn.tsx
│   │       └── Auth.css
│   ├── context/
│   │   ├── ShopContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useShopItems.ts
│   │   ├── useShopOrders.ts
│   │   ├── useShopItemsSupabase.ts
│   │   ├── useShopOrdersSupabase.ts
│   │   └── useShopOwner.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── storage.ts
│   └── types.ts
├── public/                        ← KEEP ✅ (for assets)
├── .env.example                   ← KEEP ✅ (template for env vars)
├── .gitignore                     ← KEEP ✅
├── package.json                   ← KEEP ✅ (React + Supabase deps)
├── package-lock.json              ← KEEP ✅
├── index.html                     ← KEEP ✅ (Vite entry point)
├── vite.config.ts                 ← KEEP ✅ (Vite config)
├── tsconfig.json                  ← KEEP ✅ (TypeScript config)
├── tsconfig.app.json              ← KEEP ✅
├── tsconfig.node.json             ← KEEP ✅
├── eslint.config.js               ← KEEP ✅ (code quality)
├── README.md                      ← KEEP ✅ (setup guide)
├── TESTING.md                     ← KEEP ✅ (testing guide)
└── database.sql                   ← KEEP ✅ (Supabase schema)
```

---

## 📋 STEP 3: Optional Files to Remove (Clean Up)

### Inside `/worked/src/` - Files to REMOVE:

**`App.css`** - Unnecessary (we use component-specific CSS)

```bash
cd worked/src
rm App.css
git add -A
git commit -m "Remove old centralized App.css - using component CSS instead"
git push origin shopping-app
```

### Inside `/worked/src/` - Files to CONDITIONALLY REMOVE:

**`storage.ts`** - Can remove IF you only want Supabase (keep if you want offline support)

```bash
# Remove only if not using localStorage/offline features
rm worked/src/storage.ts
git add -A
git commit -m "Remove localStorage utilities - using Supabase exclusively"
git push origin shopping-app
```

### Inside `/worked/src/` - Directories to REMOVE:

**`assets/` directory** - If empty (no images/assets used)

```bash
# Remove if empty
rm -rf worked/src/assets
git add -A
git commit -m "Remove unused assets directory"
git push origin shopping-app
```

---

## 📊 Summary: Before & After

### BEFORE (Current State):
```
shopping_app/
├── file/                    ← OLD VANILLA JS (TO DELETE)
│   ├── customer/
│   ├── owner/
│   ├── storage.js
│   └── ...
└── worked/                  ← NEW REACT (TO KEEP)
    ├── src/
    ├── package.json
    └── ...
```

### AFTER (Final State):
```
shopping_app/
├── worked/                  ← ACTIVE PROJECT
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── README.md
│   ├── TESTING.md
│   ├── database.sql
│   └── ...
├── README.md               ← Root level docs (if exists)
└── CLEANUP.md              ← This guide
```

---

## 🚀 STEP 4: Setup & Run the New App

After cleanup, set up the React app:

```bash
# Navigate to the project
cd worked

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local  # or use your editor

# Setup Supabase database
# 1. Open Supabase dashboard
# 2. Go to SQL Editor
# 3. Copy contents of database.sql
# 4. Run in SQL Editor

# Start development server
npm run dev

# App will be at http://localhost:5173
```

---

## 📝 Checklist: Step-by-Step Execution

Follow this checklist to complete the migration:

### Phase 1: Deletion
- [ ] Verify `/file` directory exists at: https://github.com/ayomideashamo-creator/shopping_app/tree/shopping-app/file
- [ ] Run: `git rm -r file/`
- [ ] Run: `git commit -m "Remove old vanilla JS implementation"`
- [ ] Run: `git push origin shopping-app`
- [ ] Verify deletion on GitHub (file/ directory should be gone)

### Phase 2: Optional Cleanup
- [ ] Run: `rm worked/src/App.css` (optional)
- [ ] Run: `rm worked/src/storage.ts` (if not using offline mode)
- [ ] Run: `git add -A && git commit -m "Clean up unused files"`
- [ ] Run: `git push origin shopping-app`

### Phase 3: Setup
- [ ] Navigate: `cd worked`
- [ ] Run: `npm install`
- [ ] Create: `cp .env.example .env.local`
- [ ] Edit: `.env.local` with Supabase credentials
- [ ] Create: Supabase tables from `database.sql`
- [ ] Run: `npm run dev`
- [ ] Verify: App loads at http://localhost:5173

### Phase 4: Testing
- [ ] Test customer shopping flow
- [ ] Test owner login
- [ ] Test inventory management
- [ ] Test real-time updates
- [ ] Follow: `TESTING.md` for full test cases

---

## 🔗 Direct Links to Files to Delete

Click these links to navigate to files in the GitHub UI:

**Root level `/file` directory:**
- https://github.com/ayomideashamo-creator/shopping_app/tree/shopping-app/file

**Files inside `/file`:**
- `/file/storage.js`: https://github.com/ayomideashamo-creator/shopping_app/blob/shopping-app/file/storage.js
- `/file/supabase.js`: https://github.com/ayomideashamo-creator/shopping_app/blob/shopping-app/file/supabase.js
- `/file/package.json`: https://github.com/ayomideashamo-creator/shopping_app/blob/shopping-app/file/package.json

**Subdirectories in `/file`:**
- `/file/customer`: https://github.com/ayomideashamo-creator/shopping_app/tree/shopping-app/file/customer
- `/file/owner`: https://github.com/ayomideashamo-creator/shopping_app/tree/shopping-app/file/owner
- `/file/new`: https://github.com/ayomideashamo-creator/shopping_app/tree/shopping-app/file/new
- `/file/sign_in`: https://github.com/ayomideashamo-creator/shopping_app/tree/shopping-app/file/sign_in

---

## ⚠️ Important Notes

1. **Commit to correct branch:** Make sure you're on the `shopping-app` branch
   ```bash
   git checkout shopping-app
   git status  # Should show "On branch shopping-app"
   ```

2. **Verify before deletion:** Always check `git status` before committing
   ```bash
   git status  # Review what will be deleted
   git diff --cached  # See exact changes
   ```

3. **Environment variables:** Never commit `.env.local` to Git
   - Keep `.env.example` as template
   - Add `*.local` to `.gitignore`

4. **Supabase setup is critical:** The app won't run without:
   - Valid Supabase URL
   - Valid Supabase Anon Key
   - Database tables created from `database.sql`

5. **Test thoroughly:** Follow `TESTING.md` to verify everything works after cleanup

---

## 🆘 If Something Goes Wrong

### Accidentally deleted something important?
```bash
# Undo the last commit
git revert HEAD

# Or reset to previous state
git reset --hard HEAD~1
```

### Forgot to delete something?
```bash
# Go back and delete it
git rm -r file/
git commit -m "Remove remaining files"
git push origin shopping-app
```

### Can't see changes on GitHub?
```bash
# Verify your push worked
git log --oneline  # Check local commits
git push origin shopping-app --force  # Force push if needed

# Then refresh GitHub page (Cmd+Shift+R or Ctrl+Shift+R)
```

---

## ✅ Success Criteria

You'll know the cleanup was successful when:

- [ ] `/file` directory is completely gone from GitHub
- [ ] `/worked` directory contains all React source code
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts the development server
- [ ] App loads at `http://localhost:5173`
- [ ] No console errors in browser DevTools
- [ ] Customer and Owner interfaces are both accessible

---

## 📞 Summary

**Total Actions Required:**
1. Delete `/file` directory (1 action)
2. Optional: Clean up unused files in `/worked/src` (2-3 actions)
3. Setup `.env.local` and Supabase (2 actions)
4. Run `npm install && npm run dev` (2 commands)
5. Run through test scenarios from `TESTING.md` (1-2 hours)

**Time Estimate:** 30-45 minutes total (including testing)

**After Completion:** You'll have a modern, production-ready React + Supabase shopping app! 🎉

---

*For detailed testing instructions, see: `worked/TESTING.md`*  
*For setup instructions, see: `worked/README.md`*
