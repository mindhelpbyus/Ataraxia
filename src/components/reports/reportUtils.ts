/** Shared helpers for the role report views — date ranges and INR formatting. */

export type ReportDateRange = '7days' | '30days' | '90days' | '1year';

export function rangeToDates(range: ReportDateRange): { from: Date; to: Date } {
    const to = new Date();
    const from = new Date();
    const days = range === '7days' ? 7 : range === '30days' ? 30 : range === '90days' ? 90 : 365;
    from.setDate(from.getDate() - days);
    return { from, to };
}

export function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/** Group ISO-dated items into day buckets across the range (for volume charts). */
export function bucketByDay<T>(
    items: T[],
    getDate: (item: T) => string,
    from: Date,
    to: Date,
    maxBuckets = 31
): { day: string; count: number }[] {
    const dayMs = 24 * 60 * 60 * 1000;
    const span = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / dayMs));
    const step = Math.max(1, Math.ceil(span / maxBuckets));
    const buckets: { start: Date; count: number }[] = [];
    for (let t = from.getTime(); t < to.getTime(); t += step * dayMs) {
        buckets.push({ start: new Date(t), count: 0 });
    }
    for (const item of items) {
        const t = new Date(getDate(item)).getTime();
        const idx = Math.floor((t - from.getTime()) / (step * dayMs));
        if (idx >= 0 && idx < buckets.length) buckets[idx].count++;
    }
    return buckets.map(b => ({
        day: b.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count: b.count
    }));
}
