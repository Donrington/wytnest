'use client'

import { DashboardShell } from '@/components/dashboard/DashboardShell'

const CAMPAIGNS = [
  { name: 'Q2 Customer Outreach', status: 'Active', sent: 48, collected: 31, rate: '65%' },
  { name: 'Product Launch Feedback', status: 'Active', sent: 22, collected: 18, rate: '82%' },
  { name: 'Annual Review Drive', status: 'Paused', sent: 90, collected: 54, rate: '60%' },
  { name: 'Beta Tester Stories', status: 'Draft', sent: 0, collected: 0, rate: '—' },
]

export default function CampaignsPage() {
  return (
    <DashboardShell active="campaigns">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-carbon-900">Campaigns</h1>
        <p className="mt-1 text-carbon-500">Create collection requests and track responses.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-paper-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-paper-border text-left text-xs uppercase tracking-wide text-carbon-400">
              <th className="px-6 py-4 font-medium">Campaign</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Sent</th>
              <th className="px-6 py-4 font-medium">Collected</th>
              <th className="px-6 py-4 font-medium">Response rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-border">
            {CAMPAIGNS.map((c) => (
              <tr key={c.name} className="transition-colors hover:bg-carbon-50/50">
                <td className="px-6 py-4 font-medium text-carbon-900">{c.name}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    c.status === 'Active' ? 'bg-emerald-50 text-emerald-700'
                    : c.status === 'Paused' ? 'bg-gold-50 text-gold-800'
                    : 'bg-carbon-100 text-carbon-600'
                  }`}>{c.status}</span>
                </td>
                <td className="px-6 py-4 text-carbon-600">{c.sent}</td>
                <td className="px-6 py-4 text-carbon-600">{c.collected}</td>
                <td className="px-6 py-4 font-medium text-carbon-900">{c.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
