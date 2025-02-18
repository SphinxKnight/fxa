/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../../../config';
import { createAccountsEventsEvent } from './server_events';
import { version } from '../../../package.json';
import { createHash } from 'crypto';
import { AuthRequest } from '../../types';

// According to @types/hapi, request.auth.credentials.user is of type
// UserCredentials, which is just {}. That's not actually the case and it
// mismatches the real type, which is string.  I extended AuthRequest below but
// the type, MetricsRquest is for this file only.
interface MetricsRequest extends Omit<AuthRequest, 'auth'> {
  payload: Record<string, any>;
  auth: { credentials: Record<string, string> };
}

type MetricsData = {
  uid?: string;
};

let appConfig: ConfigType;
let gleanEventLogger: ReturnType<typeof createAccountsEventsEvent>;

const isEnabled = async (request: MetricsRequest) =>
  appConfig.gleanMetrics.enabled && (await request.app.isMetricsEnabled);

const findUid = (request: MetricsRequest, metricsData?: MetricsData): string =>
  metricsData?.uid ||
  request.auth?.credentials?.uid ||
  request.auth?.credentials?.user ||
  '';

const sha256HashUid = (uid: string) =>
  createHash('sha256').update(uid).digest('hex');

const findOauthClientId = (request: MetricsRequest): string =>
  request.auth.credentials?.client_id || request.payload.client_id || '';

const findServiceName = async (request: MetricsRequest) => {
  const metricsContext = await request.app.metricsContext;

  if (metricsContext.service) {
    return metricsContext.service;
  }

  const clientId = findOauthClientId(request);

  // use the client id to service name mapping from the app config
  if (clientId && appConfig.oauth.clientIds[clientId]) {
    return appConfig.oauth.clientIds[clientId];
  }

  return '';
};

const createEventFn =
  // On MetricsData: for an event like successful login, the uid isn't known at
  // the time of request since the request itself isn't authenticated.  We'll
  // accept data from the event logging call for metrics that are known/easily
  // accessible in the calling scope but difficult/not possible to get from any
  // context attached to the request.


    (eventName: string) =>
    async (req: AuthRequest, metricsData?: MetricsData) => {
      // where the function is called the request object is likely to be declared
      // to be AuthRequest, so we do a cast here.
      const request = req as unknown as MetricsRequest;
      const enabled = await isEnabled(request);
      if (!enabled) {
        return;
      }

      const metricsContext = await request.app.metricsContext;

      const metrics = {
        user_agent: request.headers['user-agent'],
        ip_address: request.app.clientAddress,
        account_user_id_sha256: '',
        event_name: eventName,
        event_reason: '',
        relying_party_oauth_client_id: findOauthClientId(request),
        relying_party_service: await findServiceName(request),
        session_device_type: request.app.ua.deviceType || '',
        session_entrypoint: metricsContext.entrypoint || '',
        session_flow_id: metricsContext.flowId || '',
        utm_campaign: metricsContext.utmCampaign || '',
        utm_content: metricsContext.utmContent || '',
        utm_medium: metricsContext.utmMedium || '',
        utm_source: metricsContext.utmSource || '',
        utm_term: metricsContext.utmTerm || '',
      };

      // uid needs extra handling because we need to hash the value
      const uid = findUid(request, metricsData);
      if (uid !== '') {
        metrics.account_user_id_sha256 = sha256HashUid(uid);
      }

      await gleanEventLogger.record(metrics);
    };

export const gleanMetrics = (config: ConfigType) => {
  appConfig = config;
  gleanEventLogger = createAccountsEventsEvent({
    applicationId: config.gleanMetrics.applicationId,
    appDisplayVersion: version,
    channel: config.gleanMetrics.channel,
    logger_options: { app: config.gleanMetrics.loggerAppName },
  });

  return {
    login: {
      success: createEventFn('login_success'),
    },
  };
};
