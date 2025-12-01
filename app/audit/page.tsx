"use client";

import React, { useState } from 'react';

// ============ TYPES ============
interface AuditResult {
  url: string;
  status: number | null;
  responseTimeMs: number | null;
  title?: string;
  metaDescription?: string;
  h1Count?: number;
  totalImages?: number;
  imgWithoutAlt?: number;
  imageIssues?: Array<{ src: string; alt?: boolean; missingFormats?: boolean; oversized?: boolean }>;
  totalLinks?: number;
  brokenLinks?: Array<{ url: string; statusCode?: number; broken: boolean }>;
  externalLinks?: number;
  scriptsCount?: number;
  inlineStylesCount?: number;
  hasRobots?: boolean;
  hasSitemap?: boolean;
  ttfbMs?: number;
  fcpMs?: number;
  lcpMs?: number;
  hasViewport?: boolean;
  responsive?: boolean;
  isHttps?: boolean;
  hasHsts?: boolean;
  hasMixedContent?: boolean;
  redirects?: Array<{ type: string; message: string }>;
  score?: number;
  error?: string | null;
}

// ============ COMPONENTS ============

// Progress Ring / Radial Gauge
function ProgressRing({ score, radius = 45, strokeWidth = 4 }: { score: number; radius?: number; strokeWidth?: number }) {
  const normalRadius = radius - strokeWidth / 2;
  const circumference = normalRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981';    // green
    if (score >= 60) return '#f59e0b';    // amber
    if (score >= 40) return '#f97316';    // orange
    return '#ef4444';                      // red
  };

  return (
    <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={radius}
        cy={radius}
        r={normalRadius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={radius}
        cy={radius}
        r={normalRadius}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x={radius}
        y={radius}
        textAnchor="middle"
        dy=".3em"
        fill="#111827"
        fontSize="18"
        fontWeight="bold"
        style={{ transform: 'rotate(90deg)', transformOrigin: `${radius}px ${radius}px` }}
      >
        {score}
      </text>
    </svg>
  );
}

// Status Pill
function StatusPill({ label, value, type }: { label: string; value: string | number | boolean; type?: 'pass' | 'fail' | 'warning' | 'neutral' }) {
  const getStyles = () => {
    switch (type) {
      case 'pass':
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'fail':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'warning':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };
  const styles = getStyles();
  const displayValue = typeof value === 'boolean' ? (value ? '✓' : '✗') : value;

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '16px',
        backgroundColor: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        fontSize: '13px',
        fontWeight: '500',
        marginRight: '8px',
        marginBottom: '8px',
      }}
    >
      {label}: <strong>{displayValue}</strong>
    </div>
  );
}

// Issue Card
function IssueCard({ icon, title, severity, details }: { icon: string; title: string; severity: 'critical' | 'high' | 'medium' | 'low'; details: string[] }) {
  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return { bg: '#fecaca', border: '#fca5a5', text: '#991b1b' };
      case 'high':
        return { bg: '#fed7aa', border: '#fdba74', text: '#92400e' };
      case 'medium':
        return { bg: '#fde68a', border: '#fcd34d', text: '#78350f' };
      case 'low':
        return { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' };
    }
  };
  const colors = getSeverityColor();

  return (
    <div
      style={{
        borderLeft: `4px solid ${colors.border}`,
        backgroundColor: colors.bg,
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>{icon}</span>
        <strong style={{ color: colors.text, fontSize: '14px' }}>{title}</strong>
        <span style={{ marginLeft: 'auto', fontSize: '11px', backgroundColor: colors.border, color: colors.text, padding: '2px 8px', borderRadius: '4px' }}>
          {severity.toUpperCase()}
        </span>
      </div>
      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: colors.text, lineHeight: '1.5' }}>
        {details.map((detail, i) => (
          <li key={i}>{detail}</li>
        ))}
      </ul>
    </div>
  );
}

// Metric Card (code-like inspection)
function MetricCard({ title, value, unit, context }: { title: string; value: number | string; unit?: string; context?: string }) {
  return (
    <div
      style={{
        backgroundColor: '#1f2937',
        color: '#d1d5db',
        padding: '12px 16px',
        borderRadius: '6px',
        border: '1px solid #374151',
        fontFamily: 'monospace',
        fontSize: '13px',
        marginBottom: '8px',
      }}
    >
      <div style={{ color: '#9ca3af' }}>&gt; {title}</div>
      <div style={{ fontSize: '16px', color: '#10b981', marginTop: '4px' }}>
        <strong>{value}</strong> {unit && <span style={{ color: '#6b7280' }}>{unit}</span>}
      </div>
      {context && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{context}</div>}
    </div>
  );
}

// ============ MAIN PAGE ============
export default function AuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Unknown error');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            🔍Website Audit
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Analyze your website for performance, security, SEO, and accessibility issues.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={submit} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: '#000',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '🔄 Running…' : '▶ Audit Now'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #fca5a5',
              marginBottom: '24px',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {result.error ? (
              <div style={{ color: '#991b1b', padding: '16px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <strong>Audit Error:</strong> {result.error}
              </div>
            ) : (
              <>
                {/* Title + Overall Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                      {result.title || 'No title'}
                    </h2>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{result.url}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{result.metaDescription || 'No meta description'}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <ProgressRing score={result.score ?? 0} />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Overall Score</p>
                  </div>
                </div>

                {/* Status Pills Row */}
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Status Overview</h3>
                  <div>
                    <StatusPill label="HTTP Status" value={result.status || 'N/A'} type={result.status === 200 ? 'pass' : 'fail'} />
                    <StatusPill label="HTTPS" value={result.isHttps ?? false} type={result.isHttps ? 'pass' : 'fail'} />
                    <StatusPill label="HSTS" value={result.hasHsts ?? false} type={result.hasHsts ? 'pass' : 'warning'} />
                    <StatusPill label="Mobile Viewport" value={result.hasViewport ?? false} type={result.hasViewport ? 'pass' : 'fail'} />
                    <StatusPill label="Robots.txt" value={result.hasRobots ?? false} type={result.hasRobots ? 'pass' : 'neutral'} />
                    <StatusPill label="Sitemap" value={result.hasSitemap ?? false} type={result.hasSitemap ? 'pass' : 'neutral'} />
                    <StatusPill label="Mixed Content" value={result.hasMixedContent ? 'Found' : 'None'} type={result.hasMixedContent ? 'fail' : 'pass'} />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>⚡ Performance Metrics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <MetricCard title="TTFB (Time to First Byte)" value={result.ttfbMs ?? 0} unit="ms" />
                    <MetricCard title="FCP (First Contentful Paint)" value={result.fcpMs ?? 0} unit="ms" />
                    <MetricCard title="LCP (Largest Contentful Paint)" value={result.lcpMs ?? 0} unit="ms" />
                    <MetricCard title="Response Time" value={result.responseTimeMs ?? 0} unit="ms" />
                  </div>
                </div>

                {/* Issues Section */}
                {(
                  (result.brokenLinks && result.brokenLinks.length > 0) ||
                  (result.imgWithoutAlt ?? 0) > 0 ||
                  (result.imageIssues && result.imageIssues.length > 0) ||
                  result.hasMixedContent ||
                  (result.redirects && result.redirects.length > 0)
                ) && (
                  <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>⚠️ Issues Found</h3>

                    {/* Broken Links */}
                    {result.brokenLinks && result.brokenLinks.length > 0 && (
                      <IssueCard
                        icon="🔗"
                        title={`Broken Links (${result.brokenLinks.length})`}
                        severity="high"
                        details={result.brokenLinks.map((l) => `${l.url} ${l.statusCode ? `(${l.statusCode})` : ''}`)}
                      />
                    )}

                    {/* Missing Alt Text */}
                    {(result.imgWithoutAlt ?? 0) > 0 && (
                      <IssueCard
                        icon="🖼️"
                        title={`Missing Alt Text (${result.imgWithoutAlt})`}
                        severity="medium"
                        details={[`${result.imgWithoutAlt} images lack descriptive alt attributes for accessibility`]}
                      />
                    )}

                    {/* Image Optimization */}
                    {result.imageIssues && result.imageIssues.length > 0 && (
                      <IssueCard
                        icon="📦"
                        title={`Image Optimization Issues (${result.imageIssues.length})`}
                        severity="medium"
                        details={result.imageIssues.slice(0, 3).map((img) => {
                          const issues = [];
                          if (img.missingFormats) issues.push('missing WebP format');
                          if (img.oversized) issues.push('possibly oversized');
                          return `${img.src} ${issues.length > 0 ? `(${issues.join(', ')})` : ''}`;
                        })}
                      />
                    )}

                    {/* Mixed Content */}
                    {result.hasMixedContent && (
                      <IssueCard
                        icon="🔒"
                        title="Mixed Content Detected"
                        severity="high"
                        details={['Page uses both HTTPS and HTTP resources. This may trigger security warnings.']}
                      />
                    )}

                    {/* Redirects */}
                    {result.redirects && result.redirects.length > 0 && (
                      <IssueCard
                        icon="↔️"
                        title={`Redirect Issues (${result.redirects.length})`}
                        severity="medium"
                        details={result.redirects.map((r) => r.message)}
                      />
                    )}
                  </div>
                )}

                {/* Content & Structure Stats */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>📊 Content & Structure</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <MetricCard title="H1 Headings" value={result.h1Count ?? 0} context="should be 1 per page" />
                    <MetricCard title="Total Images" value={result.totalImages ?? 0} />
                    <MetricCard title="Total Links" value={result.totalLinks ?? 0} />
                    <MetricCard title="External Links" value={result.externalLinks ?? 0} />
                    <MetricCard title="Scripts" value={result.scriptsCount ?? 0} />
                    <MetricCard title="Inline Styles" value={result.inlineStylesCount ?? 0} context="use CSS files instead" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
