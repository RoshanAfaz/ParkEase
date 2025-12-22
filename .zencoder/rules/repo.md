# Repository Overview

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS, custom components (e.g., `Button`, `Card`, `Navbar`)
- **State Management**: React hooks and custom contexts (`AuthContext`)
- **Data Layer**: Supabase client located in `src/lib/supabase.ts`
- **Routing**: React Router (see `src/App.tsx` for route definitions)
- **Key Pages**:
  1. `src/pages/Landing.tsx`
  2. `src/pages/FindParking.tsx`
  3. `src/pages/Booking.tsx`
  4. `src/pages/Dashboard.tsx`
  5. `src/pages/MyBookings.tsx`
  6. `src/pages/Login.tsx`
  7. `src/pages/Register.tsx`
  8. Admin pages in `src/pages/admin`
- **Build Commands**:
  1. `npm install`
  2. `npm run dev`
  3. `npm run build`
  4. `npm run preview`
  5. `npm run lint`
  6. `npm run typecheck`
- **Database Migrations**: `supabase/migrations`

Refer to these sections for common entry points when debugging issues, running builds, or diagnosing Supabase-related problems.