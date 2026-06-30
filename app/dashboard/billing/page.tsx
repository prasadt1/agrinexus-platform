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

// Monthly price per plan tier (₹), matching the landing-page Stripe tiers.
const PLAN_PRICE: Record<string, number> = {
  starter: 999,
  growth: 2999,
  enterprise: 9999,
};

// The "enterprise" tier is presented as "Scale" everywhere customer-facing.
const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Scale",
};

function planLabel(plan: string): string {
  return PLAN_LABEL[plan] ?? plan.charAt(0).toUpperCase() + plan.slice(1);
}

function inr(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN").format(amount)}`;
}

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

  const activeLicenses = licenses.filter((l) => l.licenseStatus === "active");
  const mrr = activeLicenses.reduce((sum, l) => sum + (PLAN_PRICE[l.plan] ?? 0), 0);

  return (
    <div className="py-6 px-4 sm:py-10 sm:px-8">
      <PageHeader
        title="Billing"
        description="Your cohort licenses and renewal dates."
      />

      {!loading && licenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Active subscriptions</p>
            <p className="text-2xl font-semibold mt-1">{activeLicenses.length}</p>
          </Card>
          <Card>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Monthly recurring</p>
            <p className="text-2xl font-semibold mt-1">{inr(mrr)}</p>
          </Card>
          <Card>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Annualised</p>
            <p className="text-2xl font-semibold mt-1">{inr(mrr * 12)}</p>
          </Card>
        </div>
      )}

      <Card noPadding className="overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted">Loading licenses…</p>
        ) : licenses.length === 0 ? (
          <EmptyState
            title="No licenses yet"
            description="Activate a cohort and its license will appear here."
          />
        ) : (
          <table className="w-full">
            <thead style={{ background: "var(--color-page-bg)" }}>
              <tr>
                <th className="data-table-th">District</th>
                <th className="data-table-th">Plan</th>
                <th className="data-table-th">Cohort status</th>
                <th className="data-table-th text-right">Amount</th>
                <th className="data-table-th">Renews</th>
                <th className="data-table-th text-right">Billing</th>
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
                  <td className="data-table-td">{planLabel(l.plan)}</td>
                  <td className="data-table-td">
                    <Badge status={l.status as "active" | "draft"} />
                  </td>
                  <td className="data-table-td text-right text-sm">
                    {PLAN_PRICE[l.plan] ? `${inr(PLAN_PRICE[l.plan])} / mo` : "—"}
                  </td>
                  <td className="data-table-td text-sm">
                    {new Date(l.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="data-table-td text-right">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background:
                          l.licenseStatus === "active"
                            ? "var(--color-primary-tint)"
                            : "var(--color-page-bg)",
                        color:
                          l.licenseStatus === "active"
                            ? "var(--color-primary)"
                            : "var(--color-text-muted)",
                      }}
                    >
                      {l.licenseStatus === "active"
                        ? "Paid"
                        : l.licenseStatus.charAt(0).toUpperCase() + l.licenseStatus.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Each district cohort is licensed monthly through Stripe checkout. Figures shown here are
        sample data for the demo workspace.
      </p>
    </div>
  );
}
