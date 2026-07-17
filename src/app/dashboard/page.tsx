import Link from "next/link";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

export default function DashboardPage() {
  // Placeholder data — will be replaced with Convex queries
  const recentDocuments: {
    id: string;
    type: string;
    name: string;
    status: string;
    date: string;
  }[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-900">
          Your Dashboard
        </h1>
        <p className="text-stone-500 mt-1">
          Manage your legal documents and account
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Documents Created", value: "0", icon: "📄" },
          { label: "Documents Ready", value: "0", icon: "✅" },
          { label: "Available Templates", value: String(DOCUMENT_TEMPLATES.length), icon: "📋" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <div className="text-2xl font-bold text-stone-900">{stat.value}</div>
                <div className="text-sm text-stone-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Recent Documents</h2>
          <Link
            href="/dashboard/documents"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            View All →
          </Link>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-semibold text-stone-900 mb-2">No documents yet</h3>
            <p className="text-stone-500 text-sm mb-4">
              Create your first legal document in minutes
            </p>
            <Link href="/dashboard/documents" className="btn-primary text-sm !px-6 !py-2.5">
              Browse Templates
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900">{doc.name}</p>
                  <p className="text-sm text-stone-500">{doc.date}</p>
                </div>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
