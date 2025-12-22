import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';

export default function DebugUser() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-800">
            🔍 Current User Debug Info
          </h1>

          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">
                User Information
              </h2>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="font-bold">Email:</span>{' '}
                  <span className="text-blue-600">{user?.email || 'Not logged in'}</span>
                </div>
                <div>
                  <span className="font-bold">Full Name:</span>{' '}
                  <span className="text-blue-600">{user?.full_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold">Role:</span>{' '}
                  <span className={`font-bold ${user?.role === 'admin' ? 'text-green-600' : 'text-orange-600'}`}>
                    {user?.role || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Is Admin:</span>{' '}
                  <span className={`font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                    {isAdmin ? 'YES ✅' : 'NO ❌'}
                  </span>
                </div>
                <div>
                  <span className="font-bold">User ID:</span>{' '}
                  <span className="text-blue-600">{user?.id || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Token Info */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">
                Token Information
              </h2>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="font-bold">Token Exists:</span>{' '}
                  <span className={localStorage.getItem('auth_token') ? 'text-green-600' : 'text-red-600'}>
                    {localStorage.getItem('auth_token') ? 'YES ✅' : 'NO ❌'}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Token (first 50 chars):</span>{' '}
                  <span className="text-blue-600 break-all">
                    {localStorage.getItem('auth_token')?.substring(0, 50) || 'N/A'}...
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Behavior */}
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                Expected Behavior
              </h2>
              <div className="space-y-3 text-sm">
                {isAdmin ? (
                  <>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <span>You are logged in as ADMIN</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <span>You should see "ADMIN" badge in navbar</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <span>You should see admin menu items: Dashboard, Users, Parking Lots, Slots, Bookings, Analytics</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <span>You can access /admin/dashboard, /admin/users, /admin/slots</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-600 font-bold">⚠️</span>
                      <span>You are logged in as REGULAR USER</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-600 font-bold">⚠️</span>
                      <span>You will NOT see admin features</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-600 font-bold">⚠️</span>
                      <span>You should see user menu items: Dashboard, Find Parking, My Bookings</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">❌</span>
                      <span>You CANNOT access admin pages</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Instructions */}
            {!isAdmin && (
              <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                <h2 className="text-xl font-semibold mb-4 text-yellow-800">
                  🔑 To Access Admin Panel
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="font-bold text-yellow-900">
                    You need to log in with admin credentials:
                  </div>
                  <div className="bg-white p-4 rounded border border-yellow-200 font-mono">
                    <div>Email: <span className="text-blue-600 font-bold">admin@parkeasy.com</span></div>
                    <div>Password: <span className="text-blue-600 font-bold">admin123</span></div>
                  </div>
                  <div className="space-y-1 text-yellow-900">
                    <div>1. Click "Sign Out" button in the navbar</div>
                    <div>2. Go to login page</div>
                    <div>3. Enter admin credentials above</div>
                    <div>4. You'll see admin panel with all features</div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Accounts */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">
                📋 Available Test Accounts
              </h2>
              <div className="space-y-4 text-sm">
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="font-bold text-green-800 mb-2">Admin Account:</div>
                  <div className="font-mono">
                    <div>Email: admin@parkeasy.com</div>
                    <div>Password: admin123</div>
                    <div className="text-green-600 font-bold mt-1">✅ Full admin access</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <div className="font-bold text-blue-800 mb-2">Test User 1:</div>
                  <div className="font-mono">
                    <div>Email: john@example.com</div>
                    <div>Password: password123</div>
                    <div className="text-blue-600 font-bold mt-1">👤 Regular user access</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <div className="font-bold text-blue-800 mb-2">Test User 2:</div>
                  <div className="font-mono">
                    <div>Email: jane@example.com</div>
                    <div>Password: password123</div>
                    <div className="text-blue-600 font-bold mt-1">👤 Regular user access</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full User Object */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">
                🔧 Full User Object (for debugging)
              </h2>
              <pre className="bg-slate-800 text-green-400 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}