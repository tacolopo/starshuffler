import * as Sentry from "@sentry/node";

export function setupMonitoring() {
    if (process.env.NODE_ENV === 'production') {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV,
            tracesSampleRate: 1.0,
        });
    }
}

export function captureError(error: Error, context?: Record<string, any>) {
    console.error(error);
    if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error, { extra: context });
    }
} 