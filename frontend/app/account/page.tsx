import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

export default function AccountPage() {
  return (
    <div className="pt-20 pb-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8">Account</h1>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">Email</label>
                  <p className="text-zinc-900">user@example.com</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">
                    Account Status
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">
                    Files Uploaded
                  </label>
                  <p className="text-2xl font-semibold text-zinc-900">0</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">
                    Lessons Generated
                  </label>
                  <p className="text-2xl font-semibold text-zinc-900">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">
                  Notification Preferences
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Delete Account
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Support</h2>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">
                  Contact Support
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">
                  View Documentation
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors">
                  Report a Bug
                </button>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
