# Testing Guide - The Counter Shopping App

## Quick Start for Testing

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Git
- Supabase account (for real database testing)

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd worked
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

3. **Setup Supabase Database**
   - Go to your Supabase project dashboard
   - Open SQL Editor
   - Copy the contents of `database.sql`
   - Paste and execute in the SQL Editor
   - This creates all necessary tables and demo data

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

---

## Testing Scenarios

### Scenario 1: Customer Shopping Flow

**Objective:** Test the customer interface for browsing items and placing orders

**Steps:**

1. Click on the **"Customer"** button at the top
2. You should see the shopping menu with available items (Burger, Fries, Drink)
3. Click **"Add to Cart"** on a few items
4. Verify items appear in the cart on the right side
5. Adjust quantities using +/- buttons
6. Verify total price updates correctly
7. Enter a customer name in the "Customer Name" field
8. Click **"Place Order"** button
9. Verify you see a success message with a **ticket number**
10. Note the ticket number for verification in the owner dashboard

**Expected Results:**
- ✅ Items display with correct prices
- ✅ Cart updates in real-time
- ✅ Total calculates correctly
- ✅ Order is placed successfully
- ✅ Unique ticket number is generated

---

### Scenario 2: Owner Login & Dashboard

**Objective:** Test owner authentication and dashboard access

**Steps:**

1. Click on the **"Owner"** button at the top
2. You should see the SignIn form
3. Enter demo credentials:
   - Email: `demo@counter.com`
   - Password: `password123`
4. Click **"Sign In"**
5. Verify you're logged into the Owner Dashboard
6. Confirm the email address displays in the top right
7. Verify two tabs are visible: "Incoming Tickets" and "Stock Ledger"

**Expected Results:**
- ✅ SignIn form appears and accepts input
- ✅ Authentication succeeds with demo credentials
- ✅ Owner Dashboard loads
- ✅ Email is displayed correctly
- ✅ Both tabs are accessible

---

### Scenario 3: View Incoming Orders (Tickets)

**Objective:** Test the incoming tickets/orders view

**Steps:**

1. Stay in Owner Dashboard with "Incoming Tickets" tab active
2. You should see the ticket(s) from Scenario 1
3. Verify the ticket displays:
   - Ticket number (matches the one from customer order)
   - Customer name
   - Number of items
   - Total amount
4. Click the **"View"** button on a ticket
5. Verify the receipt displays with:
   - Ticket number
   - Customer name
   - Itemized list of ordered items
   - Total amount
   - Timestamp
6. Click **"Back to Tickets"** button
7. Click the **"✓ Done"** button to mark order as fulfilled
8. Verify the ticket moves to the "Fulfilled" section

**Expected Results:**
- ✅ Pending orders display correctly
- ✅ Receipt view shows all order details
- ✅ Tickets can be marked as fulfilled
- ✅ Fulfilled orders appear in separate section
- ✅ Order details are accurate

---

### Scenario 4: Manage Inventory (Stock Ledger)

**Objective:** Test inventory management functionality

**Steps:**

1. Click the **"Stock Ledger"** tab in Owner Dashboard
2. You should see current inventory items (Burger, Fries, Drink)
3. **Add a new item:**
   - Enter name: `Pizza`
   - Enter price: `3500`
   - Enter stock: `8`
   - Click **"Add Item"**
4. Verify the new item appears in the inventory list
5. **Edit an existing item:**
   - Click on the price field of "Burger"
   - Change price to `2800`
   - Verify it updates automatically
6. **Edit stock quantity:**
   - Change stock of "Fries" to `25`
   - Verify update
7. **Delete an item:**
   - Click **"Delete"** button on "Pizza"
   - Verify it's removed from the list

**Expected Results:**
- ✅ New items can be added
- ✅ Item prices update in real-time
- ✅ Stock quantities can be modified
- ✅ Items can be deleted
- ✅ All changes persist and reflect in customer menu

---

### Scenario 5: Real-time Synchronization

**Objective:** Test real-time updates across multiple sessions

**Steps:**

1. Open app in two browser windows/tabs
2. In Window 1: Login as Owner, go to Stock Ledger
3. In Window 2: Navigate to Customer interface
4. In Window 1: Add a new item "Coffee" with price 1500
5. In Window 2: Verify "Coffee" appears in the menu (may need to refresh)
6. In Window 2: Add "Coffee" to cart and place an order
7. In Window 1: Verify the new order appears in "Incoming Tickets" immediately
8. In Window 1: Mark the order as fulfilled
9. Verify order status changes in real-time

**Expected Results:**
- ✅ Inventory changes sync between sessions
- ✅ New orders appear immediately on owner dashboard
- ✅ Real-time subscriptions are working
- ✅ No manual refresh needed for updates

---

### Scenario 6: Clear All Orders

**Objective:** Test clearing all orders at end of day

**Steps:**

1. Ensure you have multiple orders in "Incoming Tickets"
2. Click **"Clear All"** button
3. Confirm the warning dialog
4. Verify all pending orders are removed
5. Verify fulfilled orders are also cleared

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ All orders are cleared
- ✅ Page updates correctly after clearing

---

### Scenario 7: Logout & Reauthenticate

**Objective:** Test logout and authentication persistence

**Steps:**

1. While logged in as owner, click **"Logout"** button
2. Confirm the logout dialog
3. Verify you're returned to SignIn form
4. Try signing in with wrong credentials (e.g., wrong password)
5. Verify error message appears
6. Sign in with correct credentials again
7. Verify you're back in the dashboard with previous session data

**Expected Results:**
- ✅ Logout confirmation works
- ✅ Wrong credentials show error
- ✅ Re-login is successful
- ✅ Session data is preserved

---

## Browser Testing

Test on multiple browsers to ensure compatibility:

- [ ] Chrome/Edge (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Mobile Testing Steps:

1. Open app on mobile device
2. Customer interface should be responsive
3. Buttons should be easily tappable
4. Forms should be usable on small screens
5. No horizontal scrolling should be required

---

## Database Testing

### Verify Supabase Connection

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any Supabase connection errors
4. Check Network tab for API calls to Supabase

### Verify Real-time Subscriptions

1. In Console, look for subscription connection messages
2. Perform an action (add item, place order)
3. Check that real-time updates occur without page refresh

### Check Data in Supabase

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run queries to verify data:
   ```sql
   SELECT * FROM shop_items;
   SELECT * FROM shop_orders;
   SELECT * FROM shop_owners;
   ```

---

## Performance Testing

### Load Testing

1. Add 50+ items to inventory
2. Verify dashboard still loads quickly
3. Add 20+ orders
4. Check that ticket list renders smoothly
5. Monitor browser performance (DevTools > Performance tab)

### Expected Performance:
- Page load: < 2 seconds
- Real-time updates: < 500ms
- No memory leaks over 5 minute session

---

## Error Handling Testing

### Test Error Scenarios

1. **No Internet Connection:**
   - Disconnect WiFi/Network
   - Try to perform actions
   - Verify graceful error handling

2. **Supabase Down:**
   - Stop Supabase temporarily (or use wrong credentials)
   - Try to load app
   - Verify error messages are user-friendly

3. **Invalid Input:**
   - Try to add item with empty name
   - Try to add item with negative price
   - Try to place order with empty customer name
   - Verify validation messages appear

4. **Large Data:**
   - Add 100+ items
   - Verify app still functions
   - Check for performance degradation

---

## Accessibility Testing

- [ ] Keyboard navigation (Tab through all elements)
- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Color contrast (use WCAG color contrast checker)
- [ ] Form labels properly associated with inputs
- [ ] Focus indicators visible on all interactive elements

---

## Automated Testing (Future Enhancement)

To run automated tests (once Jest/Vitest is configured):

```bash
npm test
```

---

## Debugging Tips

### Enable Verbose Logging

Add to `lib/supabase.ts`:
```typescript
const supabase = createClient(url, key);
supabase.on('*', (event) => {
  console.log('Supabase Event:', event);
});
```

### Check Local Storage

```javascript
// In browser console
localStorage.getItem('auth_user_id')
localStorage.getItem('auth_user_email')
```

### Monitor Network Requests

1. Open DevTools Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `supabase.co`
4. Check response status and data

---

## Known Limitations & Workarounds

| Issue | Workaround |
|-------|-----------|
| Real-time not working | Check Supabase project settings > Realtime |
| Orders not appearing | Verify owner_id matches between tables |
| Auth not persisting | Check browser localStorage is enabled |
| Slow performance | Clear browser cache and restart |

---

## Test Checklist

Use this checklist to track your testing progress:

- [ ] Customer shopping flow works
- [ ] Owner login works
- [ ] Incoming tickets display correctly
- [ ] Receipts show accurate data
- [ ] Inventory management works
- [ ] Real-time synchronization works
- [ ] Clear all orders works
- [ ] Logout and re-login works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Error handling is graceful
- [ ] Performance is acceptable

---

## Reporting Issues

When reporting bugs, please include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser/Device info**
5. **Console errors (if any)**
6. **Screenshots/videos (if applicable)**

---

## Support & Questions

For issues or questions:
1. Check the README.md for setup help
2. Review browser console for errors
3. Check Supabase status page
4. Verify Supabase credentials are correct
5. Try clearing browser cache and local storage

---

**Last Updated:** July 2026  
**Test Environment:** Vite + React 19 + Supabase  
**Status:** Ready for Full Testing ✅
