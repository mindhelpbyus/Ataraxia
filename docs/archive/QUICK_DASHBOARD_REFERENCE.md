# Quick Dashboard Reference Guide

## 🎯 Which Dashboard Displays When?

```
User Login
    │
    ├─ Therapist Role ────────────► TherapistHomeView
    │                                 (Individual practice metrics)
    │
    ├─ Admin Role ────────────────► AdminDashboardView
    │                                 (Platform-wide oversight)
    │
    └─ Super Admin Role ──────────► AdminDashboardView
                                      (Platform-wide oversight)
```

---

## 📊 Therapist Dashboard - Quick Metrics List

### Top Stats (4 Cards)
1. Today's Sessions: **4**
2. Sessions This Month: **52**
3. Pending Notes: **3**
4. Active Clients: **24**

### Left Column
- 📅 Today's Schedule (4 sessions with times)
- ⚠️ Client Risk Alerts (2 high-priority)
- 💰 Revenue This Month ($7,800)

### Middle Column
- 👥 Upcoming Sessions (Next 3-5)
- 📊 Weekly Overview Chart

### Right Column
- 📝 Notes to Complete (3 pending)
- 📈 Quick Stats
- ⚡ Quick Actions

**Total Unique Metrics: 11**

---

## 📊 Admin Dashboard - Quick Metrics List

### Top Stats (4 Cards)
1. Daily Revenue: **$4,250**
2. MTD Revenue: **$127,500** (85% of forecast)
3. YTD Revenue: **$1.48M**
4. Active Clients: **86**

### Revenue Bar
- Forecast Progress: 85% complete

### Therapist Table (per therapist - 7 metrics)
1. Sessions This Week
2. Status (Completed/Missed/Cancelled)
3. Revenue This Month
4. Active Clients
5. Utilization %
6. Satisfaction Rating
7. New Intakes

### Charts Section
- 📊 Weekly Sessions Chart (Completed vs Missed)
- 🎯 Performance Comparison Radar

### Right Column
- 🚀 Client Journey Funnel (5 stages)
- 🏥 Condition Categories (6 types)
- 📦 Capacity Metrics (4 data points)
- ⭐ Quality Metrics (4 data points)

### Bottom Row
- 📈 Daily Active Users Chart
- 📉 Monthly Sessions Trend

**Total Unique Metrics: 40+**

---

## 🔑 Key Metric Definitions

### Therapist Dashboard

| Metric | Definition |
|--------|------------|
| **Today's Sessions** | Number of sessions scheduled for today |
| **Sessions This Month** | Completed sessions in current month |
| **Pending Notes** | Session notes not yet completed |
| **Active Clients** | Unique clients with recent activity |
| **Revenue This Month** | Total revenue from completed sessions ($150/session) |
| **Weekly Overview** | Session count by day of week |
| **Upcoming Sessions** | Next 3-5 chronological appointments |
| **Risk Alerts** | Clients flagged for missed appointments or concerns |
| **New Clients This Week** | New intakes in past 7 days |

### Admin Dashboard

| Metric | Definition |
|--------|------------|
| **Daily Revenue** | Today's completed session revenue |
| **MTD Revenue** | Month-to-date total revenue |
| **YTD Revenue** | Year-to-date total revenue |
| **Revenue Forecast** | Monthly revenue target |
| **Utilization %** | (Booked slots / Available slots) × 100 |
| **No-show Rate** | (No-shows / Total scheduled) × 100 |
| **Cancellation Rate** | (Cancellations / Total scheduled) × 100 |
| **Waitlist Count** | Clients waiting for assignment |
| **Avg Wait Time** | Days from intake to first session |
| **Intake Processing** | Days from submission to assignment |
| **Satisfaction Rating** | Average client rating (0-5 scale) |
| **Outcome Improvement** | % of clients showing progress |
| **Missing Notes** | Total incomplete session notes platform-wide |
| **Daily Active Users** | Unique users per hour |
| **Monthly Active Users** | Unique users per month |

---

## 🎨 Color Coding System

### Status Colors
- 🟢 **Green (#10B981)**: Completed, Success, Active
- 🔴 **Red (#EF4444)**: Missed, Error, Critical
- 🟡 **Amber (#F59E0B)**: Cancelled, Warning, Pending
- 🔵 **Blue (#3B82F6)**: Info, Waitlist, General
- 🟣 **Purple (#8B5CF6)**: Special, Active progress
- 🟠 **Orange (#F97316)**: Brand primary, Revenue

### Badge System
```
✅ Completed    → Green solid badge
❌ Missed       → Red outline badge
⚠️ Cancelled   → Amber outline badge
📊 Waitlist     → Blue solid badge
⭐ Rating       → Amber star + number
```

---

## 📱 Responsive Breakpoints

### Desktop (1920px+)
- Full 12-column grid
- All charts visible
- Sidebar expanded

### Laptop (1366px+)
- 12-column grid
- All features visible
- Sidebar can collapse

### Tablet (768px+)
- Stacked layout
- Charts adapt
- Sidebar auto-collapse

### Mobile (375px+)
- Single column
- Scrollable sections
- Compact stats

---

## 🔄 Data Refresh Strategy

### Therapist Dashboard
- **Real-time**: Today's sessions
- **On mount**: All metrics
- **On tab switch**: Refresh data
- **Manual**: Refresh button (future)

### Admin Dashboard
- **Real-time**: Active users (future)
- **Every 5 min**: Revenue, sessions (future)
- **On mount**: All metrics
- **Manual**: Refresh button (future)

---

## 🚀 Quick Navigation

### From Therapist Dashboard
```
[View Full Calendar] ──► Calendar Tab
[Complete Notes] ──────► Notes Tab  
[Schedule Session] ────► Calendar Tab
[View Clients] ───────► Clients Tab
[View Reports] ────────► Analytics Tab
```

### From Admin Dashboard
```
[View Calendar] ───────► Calendar Tab
[Detailed Reports] ────► Analytics Tab
[Therapist Name] ──────► Therapist Detail (future)
```

---

## 🧪 Testing Quick Commands

### Test Therapist Dashboard
```bash
# Login as therapist
Email: therapist3@bedrock.test
Password: Therapist123!

# Check for:
✓ Today's Sessions count
✓ Weekly chart displays
✓ Upcoming sessions list
✓ Revenue card shows
✓ Pending notes section
```

### Test Admin Dashboard
```bash
# Login as admin
Email: admin3@bedrock.test
Password: Admin123!

# Check for:
✓ Revenue cards (3 types)
✓ Therapist table populated
✓ All 4 charts render
✓ Client journey funnel
✓ Capacity metrics
✓ Quality metrics
```

---

## 📦 Component File Locations

```
/components/
  ├── TherapistHomeView.tsx    ← Therapist dashboard
  ├── AdminDashboardView.tsx   ← Admin dashboard
  ├── HomeView.tsx             ← Fallback/generic
  └── DashboardLayout.tsx      ← Router (decides which to show)
```

---

## 🐛 Common Issues & Solutions

### Issue: Dashboard not showing
**Solution**: Check userRole prop in DashboardLayout

### Issue: Mock data not loading
**Solution**: Check console for errors, ensure mock data functions

### Issue: Charts not rendering
**Solution**: Ensure recharts is imported, check ResponsiveContainer

### Issue: Wrong dashboard for role
**Solution**: Verify role string matches exactly ('therapist', 'admin', 'superadmin')

### Issue: Navigation not working
**Solution**: Ensure onNavigate prop is passed correctly

---

## 📚 Related Documentation

1. **THERAPIST_HOME_DASHBOARD.md** - Complete therapist dashboard docs
2. **ADMIN_DASHBOARD_COMPLETE.md** - Complete admin dashboard docs
3. **DASHBOARD_IMPLEMENTATION_SUMMARY.md** - Overall implementation guide
4. **QUICK_DASHBOARD_REFERENCE.md** - This file

---

## ✅ Verification Checklist

### Therapist Dashboard
- [ ] Quick stats show 4 cards
- [ ] Today's schedule lists sessions
- [ ] Weekly chart displays bars
- [ ] Upcoming sessions show avatars
- [ ] Revenue card shows gradient
- [ ] Navigation buttons work
- [ ] Risk alerts display if present
- [ ] Pending notes section visible

### Admin Dashboard
- [ ] Revenue cards show 3 metrics
- [ ] Forecast progress bar displays
- [ ] Therapist table has 4+ rows
- [ ] Weekly chart shows completed/missed
- [ ] Radar chart renders
- [ ] Client journey funnel visible
- [ ] Condition categories show percentages
- [ ] Capacity metrics display
- [ ] Quality metrics visible
- [ ] Bottom charts render

---

## 🎯 Success Criteria

**Therapist Dashboard**: Individual practice management
**Admin Dashboard**: Platform oversight and management

Both dashboards:
- ✅ Display correct metrics for role
- ✅ Use brand colors consistently
- ✅ Responsive on all devices
- ✅ Navigate to appropriate tabs
- ✅ Handle missing data gracefully
- ✅ Load quickly (<2s)
- ✅ No duplicate code

---

**Status**: Production Ready ✅
**Last Updated**: November 23, 2024
**Version**: 1.0.0
