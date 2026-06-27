"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, PageHeader, Badge, EmptyState } from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";

type LicenseRow = {
  cohortId: string;
  district: string;
  status: string;
  plan: string;
  licenseStatus: string;
  periodEnd: string;
  isDemo: boolean;
};

export default function BillingPage() {
  const { authHeaders } = useAuth();
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBilling = useCallback(async () => {
    try {
      const res = await fetch("/api/billing", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLicenses(data.licenses || []);
      }
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  return (
    <div className="py-10 px-8">
      <PageHeader
        title="Billing"
        description="Cohort licenses and subscription state (Stripe + demo)"
      />

      <Card noPadding className="overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted">Loading licenses…</p>
        ) : licenses.length === 0 ? (
          <EmptyState
            title="No licenses yet"
            description="Activate a cohort to create a license record in DynamoDB."
          />
        ) : (
          <table className="w-full">
            <thead style={{ background: "var(--color-page-bg)" }}>
              <tr>
                <th className="data-table-th">District</th>
                <th className="data-table-th">Plan</th>
                <th className="data-table-th">Cohort status</th>
                <th className="data-table-th">Period end</th>
                <th className="data-table-th text-right">Type</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((l) => (
                <tr key={l.cohortId} className="data-table-row">
                  <td className="data-table-td">
                    <Link
                      href={`/dashboard/cohorts/${l.cohortId}`}
                      className="font-medium hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {l.district}
                    </Link>
                  </td>
                  <td className="data-table-td capitalize">{l.plan}</td>
                  <td className="data-table-td">
                    <Badge status={l.status as "active" | "draft"} />
                  </td>
                  <td className="data-table-td text-sm">
                    {new Date(l.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="data-table-td text-right">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: l.isDemo ? "var(--color-page-bg)" : "var(--color-primary-tint)",
                        color: l.isDemo ? "var(--color-text-muted)" : "var(--color-primary)",
                      }}
                    >
                      {l.isDemo ? "Demo" : "Stripe"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Each district cohort is licensed monthly. Rows marked <span className="chip">Demo</span> were
        activated without payment for evaluation; production cohorts are billed via Stripe.
      </p>
    </div>
  );
}
