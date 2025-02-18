/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { assert } from 'chai';

const recordStub = sinon.stub();
const { gleanMetrics } = proxyquire.load('../../../lib/metrics/glean', {
  './server_events': {
    createAccountsEventsEvent: () => ({ record: recordStub }),
  },
});

const config = {
  gleanMetrics: {
    enabled: true,
    applicationId: 'accounts_backend_test',
    channel: 'test',
    loggerAppName: 'auth-server-tests',
  },
  oauth: {
    clientIds: {},
  },
};

const request = {
  app: {
    isMetricsEnabled: true,
    metricsContext: {},
    ua: {},
    clientAddress: '10.10.10.10',
  },
  auth: { credentials: {} },
  headers: {
    'user-agent': 'ELinks/0.9.3 (textmode; SunOS)',
  },
  payload: {},
};

describe('Glean server side events', () => {
  afterEach(() => {
    recordStub.reset();
  });

  describe('enabled state', () => {
    it('can be disabled via config', async () => {
      const gleanConfig = {
        ...config,
        gleanMetrics: { ...config.gleanMetrics, enabled: false },
      };
      const glean = gleanMetrics(gleanConfig);
      await glean.login.success(request);

      sinon.assert.notCalled(recordStub);
    });

    it('can be disabled by the account', async () => {
      const glean = gleanMetrics(config);
      await glean.login.success({
        ...request,
        app: { ...request.app, isMetricsEnabled: false },
      });

      sinon.assert.notCalled(recordStub);
    });

    it('logs when enabled', async () => {
      const glean = gleanMetrics(config);
      await glean.login.success(request);
      sinon.assert.calledOnce(recordStub);
    });
  });

  describe('metrics', () => {
    let glean;

    beforeEach(() => {
      glean = gleanMetrics(config);
    });

    it('defaults', async () => {
      await glean.login.success(request);
      const metrics = recordStub.args[0][0];
      assert.equal(metrics.user_agent, request.headers['user-agent']);
      assert.equal(metrics.ip_address, request.app.clientAddress);

      delete metrics.event_name; // there's always a name of course
      delete metrics.user_agent;
      delete metrics.ip_address;

      // the rest should default to an empty string
      assert.isTrue(Object.values(metrics).every((x) => x === ''));
    });

    describe('user id', () => {
      it('uses the id from the passed in data', async () => {
        await glean.login.success(request, { uid: 'rome_georgia' });
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['account_user_id_sha256'],
          '7c05994f542f257aac8ee13eebc711f07e480b06de5498c7e63f9b3e615ac8af'
        );
      });

      it('uses the id from the session token', async () => {
        const sessionAuthedReq = {
          ...request,
          auth: {
            ...request.auth,
            credentials: { ...request.auth.credentials, uid: 'athens_texas' },
          },
        };
        await glean.login.success(sessionAuthedReq);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['account_user_id_sha256'],
          '0c1d07d948132bcec965796e16a0bef4bd8aca2bc920c26f3a6d4f46e8971fcd'
        );
      });

      it('uses the id from oauth token', async () => {
        const oauthReq = {
          ...request,
          auth: {
            ...request.auth,
            credentials: {
              ...request.auth.credentials,
              user: 'paris_tennessee',
            },
          },
        };
        await glean.login.success(oauthReq);
        const metrics = recordStub.args[0][0];
        assert.equal(
          metrics['account_user_id_sha256'],
          'b2710dc44cb98ec552e189e48b43e460366f1ae40f922bf325e2635b098962e7'
        );
      });
    });

    describe('oauth', () => {
      it('uses the client id from the oauth token', async () => {
        const req = {
          ...request,
          auth: {
            ...request.auth,
            credentials: {
              ...request.auth.credentials,
              client_id: 'runny_eggs',
            },
          },
        };
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_oauth_client_id'], 'runny_eggs');
      });

      it('uses the client id from the payload', async () => {
        const req = {
          ...request,
          payload: { ...request.payload, client_id: 'corny_jokes' },
        };
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_oauth_client_id'], 'corny_jokes');
      });

      it('uses the service name from the metrics context', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              service: 'brass_monkey',
            },
          },
        };
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_service'], 'brass_monkey');
      });

      it('uses the service name from the config', async () => {
        const mappingsConfig = {
          ...config,
          oauth: { clientIds: { quux: 'sly_fox' } },
        };
        const req = {
          ...request,
          auth: {
            ...request.auth,
            credentials: {
              ...request.auth.credentials,
              client_id: 'quux',
              service: 'wibble',
            },
          },
        };
        glean = gleanMetrics(mappingsConfig);
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['relying_party_service'], 'sly_fox');
      });
    });

    describe('user session', () => {
      it('sets the device type', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            ua: {
              ...request.app.ua,
              deviceType: 'phablet',
            },
          },
        };
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['session_device_type'], 'phablet');
      });

      it('sets the entrypoint', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              entrypoint: 'homepage',
            },
          },
        };
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['session_entrypoint'], 'homepage');
      });

      it('sets the flow id', async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              flowId: '101',
            },
          },
        };
        await glean.login.success(req);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['session_flow_id'], '101');
      });
    });

    describe('utm', () => {
      let metrics;

      beforeEach(async () => {
        const req = {
          ...request,
          app: {
            ...request.app,
            metricsContext: {
              ...request.app.metricsContext,
              utmCampaign: 'camp',
              utmContent: 'con',
              utmMedium: 'mid',
              utmSource: 'sour',
              utmTerm: 'erm',
            },
          },
        };
        await glean.login.success(req);
        metrics = recordStub.args[0][0];
      });

      it('sets the campaign', async () => {
        assert.equal(metrics['utm_campaign'], 'camp');
      });

      it('sets the content', async () => {
        assert.equal(metrics['utm_content'], 'con');
      });

      it('sets the medium', async () => {
        assert.equal(metrics['utm_medium'], 'mid');
      });

      it('sets the source', async () => {
        assert.equal(metrics['utm_source'], 'sour');
      });

      it('sets the term', async () => {
        assert.equal(metrics['utm_term'], 'erm');
      });
    });
  });

  describe('login', () => {
    describe('success', () => {
      it('logs a "login_success" event', async () => {
        const glean = gleanMetrics(config);
        await glean.login.success(request);
        sinon.assert.calledOnce(recordStub);
        const metrics = recordStub.args[0][0];
        assert.equal(metrics['event_name'], 'login_success');
      });
    });
  });
});
