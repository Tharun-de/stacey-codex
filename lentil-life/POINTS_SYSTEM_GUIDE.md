# Lentil Life Points System Guide

## Overview
The Lentil Life loyalty points system rewards customers with points for every purchase. By default, customers earn 1 point for every $1 spent, creating an incentive for repeat purchases and customer loyalty.

## Features

### ✅ Implemented Features
- **Points Earning**: Customers earn points automatically when orders are completed
- **Points Tracking**: Full balance and transaction history for each user
- **Points Display**: Components to show points balance and recent activity
- **Order Integration**: Points calculation shows during checkout
- **Email Notifications**: Points earned included in order confirmation and status emails
- **Admin Configuration**: Adjustable points rates and minimum order requirements
- **Points Refunding**: Automatic refund of points when orders are cancelled
- **Database Integration**: Full Supabase integration with proper security policies

### 🔄 Configurable Settings
- **Points per Dollar**: Default 1 point per $1 (configurable)
- **Minimum Order**: Set minimum order amount to earn points
- **Points Expiry**: Optional expiration date for points
- **Signup Bonus**: Optional points awarded when users sign up

## Database Schema

### Tables Created
1. **`user_points`** - Tracks current points balance for each user
2. **`points_transactions`** - Complete history of all points earned, spent, expired, or refunded
3. **`points_config`** - System-wide configuration for points behavior

### Key Features
- Row Level Security (RLS) policies ensure users can only see their own data
- Automatic triggers update points balances when transactions are created
- Database constraints ensure data integrity

## API Endpoints

### Points Configuration
```
GET /api/points/config - Get current points system configuration
PUT /api/points/config - Update points configuration (admin)
```

### Points Calculation
```
GET /api/points/calculate?amount=100 - Calculate points for order amount
```

### User Points
```
GET /api/points/user/:userId - Get user's current points balance
GET /api/points/user/:userId/history - Get user's points transaction history
```

### Points Management
```
POST /api/points/award - Award points to a user for an order
POST /api/points/spend - Spend user's points
POST /api/points/refund - Refund points for cancelled order
```

## Frontend Components

### PointsDisplay Component
Shows user's points balance and transaction history:

```tsx
import PointsDisplay from '../components/PointsDisplay';

// Full display with history
<PointsDisplay userId={user.id} showHistory={true} />

// Compact display for headers/navigation
<PointsDisplay userId={user.id} compact={true} />
```

### PointsCalculator Component
Shows points that will be earned during checkout:

```tsx
import PointsCalculator from '../components/PointsCalculator';

// Simple points preview
<PointsCalculator orderAmount={total} />

// Detailed breakdown
<PointsCalculator orderAmount={total} showDetailed={true} />
```

## Integration Examples

### 1. Add Points Display to User Dashboard
```tsx
// In your user dashboard/profile page
import PointsDisplay from '../components/PointsDisplay';

const UserDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <PointsDisplay userId={user.id} />
    </div>
  );
};
```

### 2. Add Points Calculator to Checkout
```tsx
// In your checkout page
import PointsCalculator from '../components/PointsCalculator';

const CheckoutPage = () => {
  const [total, setTotal] = useState(0);
  
  return (
    <div className="checkout">
      {/* Order summary */}
      <div className="order-summary">
        <div className="total">Total: ${total.toFixed(2)}</div>
        <PointsCalculator orderAmount={total} showDetailed={true} />
      </div>
    </div>
  );
};
```

### 3. Add Points to Navigation Header
```tsx
// In your navigation component
import PointsDisplay from '../components/PointsDisplay';

const Navigation = () => {
  const { user } = useAuth();
  
  return (
    <nav>
      {user && (
        <div className="user-info">
          <PointsDisplay userId={user.id} compact={true} />
        </div>
      )}
    </nav>
  );
};
```

## Order Integration

### Updated Order Creation
Orders now automatically:
1. Calculate points that will be earned
2. Include points info in confirmation emails
3. Store user ID for points tracking

```javascript
// Order creation includes:
{
  customer: customerInfo,
  items: orderItems,
  total: orderTotal,
  userId: user.id,  // Important for points tracking
  // ... other order data
}
```

### Automatic Points Awarding
Points are automatically awarded when:
- Order status changes to "completed"
- Payment is successfully processed
- Order meets minimum requirement

### Points Refunding
Points are automatically refunded when:
- Order is cancelled after being completed
- Order is refunded

## Email Integration

### Enhanced Email Templates
Order emails now include:
- Points earned information
- Current points balance
- Points rate explanation

## Setup Instructions

### 1. Database Setup
Run the SQL file to create points tables:
```sql
-- Execute: lentil-life/backend/points_system.sql
-- This creates all necessary tables and triggers
```

### 2. Environment Variables
Ensure your `.env` file includes:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Backend Integration
The points system is automatically integrated with:
- Order creation
- Order status updates
- Email notifications

### 4. Frontend Integration
Import and use the components where needed:
```tsx
import PointsDisplay from './components/PointsDisplay';
import PointsCalculator from './components/PointsCalculator';
```

## Configuration

### Adjust Points Rate
Update the points configuration:
```javascript
// Example: 2 points per dollar, minimum $10 order
PUT /api/points/config
{
  "points_per_dollar": 2.0,
  "min_order_for_points": 10.0
}
```

### Points Expiry (Optional)
Set points to expire after certain months:
```javascript
PUT /api/points/config
{
  "points_expiry_months": 12  // Points expire after 1 year
}
```

## Future Enhancements

### Planned Features
- **Points Redemption**: Allow customers to spend points for discounts
- **Tier System**: Different points rates based on customer loyalty level
- **Bonus Promotions**: Special events with increased points earning
- **Referral Program**: Earn points for referring friends
- **Birthday Bonuses**: Extra points on customer birthdays

### Redemption Implementation Example
```tsx
// Future redemption component
const PointsRedemption = ({ availablePoints, orderTotal }) => {
  const maxRedeemable = Math.min(availablePoints, Math.floor(orderTotal * 0.1)); // 10% max
  
  return (
    <div className="points-redemption">
      <h3>Use Points for Discount</h3>
      <p>Available: {availablePoints} points</p>
      <p>Redeem up to: {maxRedeemable} points (${(maxRedeemable * 0.01).toFixed(2)} off)</p>
    </div>
  );
};
```

## Testing

### Test Points Flow
1. Create user account
2. Place order with total > minimum requirement
3. Complete order (change status to "completed")
4. Check points were awarded
5. View points in user dashboard
6. Test points refund by cancelling completed order

### API Testing
```bash
# Test points calculation
curl "http://localhost:4000/api/points/calculate?amount=25"

# Test user points
curl "http://localhost:4000/api/points/user/USER_ID"

# Test points config
curl "http://localhost:4000/api/points/config"
```

## Troubleshooting

### Common Issues
1. **Points not awarded**: Check if order has `user_id` and status is "completed"
2. **Database errors**: Ensure points tables are created with proper permissions
3. **Component not showing**: Verify user authentication and API connectivity

### Debug Steps
1. Check browser console for API errors
2. Verify backend logs for points processing
3. Check database for points transactions
4. Ensure proper user ID is passed to components

## Security Notes

- Row Level Security ensures users only see their own points
- Points transactions are immutable (no updates, only inserts)
- Admin-only endpoints for configuration changes
- All points operations are logged for audit trail 