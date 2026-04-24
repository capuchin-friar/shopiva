import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://feafe2dc4d677a1a372ef5b7764e3b67@o4510108659941376.ingest.us.sentry.io/4510108661186560',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
});