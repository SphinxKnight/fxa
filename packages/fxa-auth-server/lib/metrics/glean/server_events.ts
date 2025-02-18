/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// AUTOGENERATED BY glean_parser v7.2.2.dev8+g91d4c811. DO NOT EDIT. DO NOT COMMIT.

// This requires `uuid` and `mozlog` libraries to be in the environment
// @types/uuid and mozlog types definitions are required in devDependencies
// for the latter see https://github.com/mozilla/fxa/blob/85bda71cda376c417b8c850ba82aa14252208c3c/types/mozlog/index.d.ts
import { v4 as uuidv4 } from 'uuid';
import mozlog, { Logger } from 'mozlog';

const GLEAN_EVENT_MOZLOG_TYPE = 'glean-server-event';
type LoggerOptions = { app: string; fmt?: 'heka' };

let _logger: Logger;

class AccountsEventsServerEvent {
  _applicationId: string;
  _appDisplayVersion: string;
  _channel: string;
  /**
   * Create AccountsEventsServerEvent instance.
   *
   * @param {string} applicationId - The application ID.
   * @param {string} appDisplayVersion - The application display version.
   * @param {string} channel - The channel.
   * @param {LoggerOptions} logger_options - The logger options.
   */
  constructor(
    applicationId: string,
    appDisplayVersion: string,
    channel: string,
    logger_options: LoggerOptions
  ) {
    this._applicationId = applicationId;
    this._appDisplayVersion = appDisplayVersion;
    this._channel = channel;

    if (!_logger) {
      // append '-glean' to `logger_options.app` to avoid collision with other loggers and double logging
      logger_options.app = logger_options.app + '-glean';
      // set the format to `heka` so messages are properly ingested and decoded
      logger_options.fmt = 'heka';
      // mozlog types declaration requires a typePrefix to be passed when creating a logger
      // we don't want a typePrefix, so we pass `undefined`
      _logger = mozlog(logger_options)(undefined);
    }
  }
  /**
   * Record and submit a server event object.
   * Event is logged using internal mozlog logger.
   *
   * @param {string} user_agent - The user agent.
   * @param {string} ip_address - The IP address. Will be used to decode Geo
   *                              information and scrubbed at ingestion.
   * @param {string} account_user_id_sha256 - A hex string of a sha256 hash of the account's uid.
   * @param {string} event_name - The name of the event.
   * @param {string} event_reason - additional context-dependent (on event.name) info, e.g. the cause of an error.
   * @param {string} relying_party_oauth_client_id - The client id of the relying party.
   * @param {string} relying_party_service - The service name of the relying party.
   * @param {string} session_device_type - one of 'mobile', 'tablet', or ''.
   * @param {string} session_entrypoint - entrypoint to the service.
   * @param {string} session_flow_id - an ID generated by FxA for its flow metrics.
   * @param {string} utm_campaign - A marketing campaign.  For example, if a user signs into FxA from selecting a Mozilla VPN plan on Mozilla VPN's product site, then value of this metric could be 'vpn-product-page'.  The value has a max length of 128 characters with the alphanumeric characters, _ (underscore), forward slash (/), . (period), % (percentage sign), and - (hyphen) in the allowed set of characters.  The special value of 'page+referral+-+not+part+of+a+campaign' is also allowed..
   * @param {string} utm_content - The content on which the user acted.  For example, if the user clicked on the "Get started here" link in "Looking for Firefox Sync? Get started here", then the value for this metric would be 'fx-sync-get-started'.  The value has a max length of 128 characters with the alphanumeric characters, _ (underscore), forward slash (/), . (period), % (percentage sign), and - (hyphen) in the allowed set of characters..
   * @param {string} utm_medium - The "medium" on which the user acted.  For example, if the user clicked on a link in an email, then the value of this metric would be 'email'.  The value has a max length of 128 characters with the alphanumeric characters, _ (underscore), forward slash (/), . (period), % (percentage sign), and - (hyphen) in the allowed set of characters..
   * @param {string} utm_source - The source from where the user started.  For example, if the user clicked on a link on the Firefox accounts web site, this value could be 'fx-website'.  The value has a max length of 128 characters with the alphanumeric characters, _ (underscore), forward slash (/), . (period), % (percentage sign), and - (hyphen) in the allowed set of characters..
   * @param {string} utm_term - This metric is similar to the `utm.source`; it is used in the Firefox browser.  For example, if the user started from about:welcome, then the value could be 'aboutwelcome-default-screen'.  The value has a max length of 128 characters with the alphanumeric characters, _ (underscore), forward slash (/), . (period), % (percentage sign), and - (hyphen) in the allowed set of characters..
   */
  record({
    user_agent,
    ip_address,
    account_user_id_sha256,
    event_name,
    event_reason,
    relying_party_oauth_client_id,
    relying_party_service,
    session_device_type,
    session_entrypoint,
    session_flow_id,
    utm_campaign,
    utm_content,
    utm_medium,
    utm_source,
    utm_term,
  }: {
    user_agent: string;
    ip_address: string;
    account_user_id_sha256: string;
    event_name: string;
    event_reason: string;
    relying_party_oauth_client_id: string;
    relying_party_service: string;
    session_device_type: string;
    session_entrypoint: string;
    session_flow_id: string;
    utm_campaign: string;
    utm_content: string;
    utm_medium: string;
    utm_source: string;
    utm_term: string;
  }) {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      metrics: {
        string: {
          'account.user_id_sha256': account_user_id_sha256,
          'event.name': event_name,
          'event.reason': event_reason,
          'relying_party.oauth_client_id': relying_party_oauth_client_id,
          'relying_party.service': relying_party_service,
          'session.device_type': session_device_type,
          'session.entrypoint': session_entrypoint,
          'session.flow_id': session_flow_id,
          'utm.campaign': utm_campaign,
          'utm.content': utm_content,
          'utm.medium': utm_medium,
          'utm.source': utm_source,
          'utm.term': utm_term,
        },
      },
      ping_info: {
        seq: 0, // this is required, however doesn't seem to be useful in server context
        start_time: timestamp,
        end_time: timestamp,
      },
      // `Unknown` fields below are required in the Glean schema, however they are not useful in server context
      client_info: {
        telemetry_sdk_build: 'glean_parser v7.2.2.dev8+g91d4c811',
        first_run_date: 'Unknown',
        os: 'Unknown',
        os_version: 'Unknown',
        architecture: 'Unknown',
        app_build: 'Unknown',
        app_display_version: this._appDisplayVersion,
        app_channel: this._channel,
      },
    };
    const eventPayloadSerialized = JSON.stringify(eventPayload);

    // This is the message structure that Decoder expects: https://github.com/mozilla/gcp-ingestion/pull/2400
    const ping = {
      document_namespace: this._applicationId,
      document_type: 'accounts-events',
      document_version: '1',
      document_id: uuidv4(),
      user_agent: user_agent,
      ip_address: ip_address,
      payload: eventPayloadSerialized,
    };

    // this is similar to how FxA currently logs with mozlog: https://github.com/mozilla/fxa/blob/4c5c702a7fcbf6f8c6b1f175e9172cdd21471eac/packages/fxa-auth-server/lib/log.js#L289
    _logger.info(GLEAN_EVENT_MOZLOG_TYPE, ping);
  }
}

export const createAccountsEventsEvent = function ({
  applicationId,
  appDisplayVersion,
  channel,
  logger_options,
}: {
  applicationId: string;
  appDisplayVersion: string;
  channel: string;
  logger_options: LoggerOptions;
}) {
  return new AccountsEventsServerEvent(
    applicationId,
    appDisplayVersion,
    channel,
    logger_options
  );
};
