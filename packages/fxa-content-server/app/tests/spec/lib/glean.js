/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import { testResetGlean } from '@mozilla/glean/testing';
import GleanMetrics from '../../../scripts/lib/glean';
import * as event from '../../../scripts/lib/glean/event';
import * as pings from '../../../scripts/lib/glean/pings';
import { userIdSha256 } from '../../../scripts/lib/glean/account';
import {
  oauthClientId,
  service,
} from '../../../scripts/lib/glean/relyingParty';
import {
  deviceType,
  entrypoint,
  flowId,
} from '../../../scripts/lib/glean/session';
import * as utm from '../../../scripts/lib/glean/utm';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();
const mockConfig = {
  enabled: false,
  applicationId: 'testo',
  uploadEnabled: false,
  appDisplayVersion: '9001',
  channel: 'test',
  serverEndpoint: 'https://metrics.example.io/',
  logPings: false,
  debugViewTag: '',
};

describe('lib/glean', () => {
  let mockFlowEventMetadata = {};
  let mockClientId, mockService;
  let mockDeviceType;
  const metrics = {
    getFlowEventMetadata: sandbox.stub().callsFake(() => mockFlowEventMetadata),
  };
  const relier = {
    get: sandbox.stub().callsFake(
      (x) =>
        ({
          clientId: mockClientId,
          service: mockService,
        }[x])
    ),
  };
  const user = {
    getSignedInAccount: () => ({
      get: () => {},
    }),
  };
  const userAgent = {
    genericDeviceType: sandbox.stub().callsFake(() => mockDeviceType),
  };

  let setDeviceTypeStub,
    setEntrypointStub,
    setEventNameStub,
    setEventReasonStub,
    setFlowIdStub,
    setOauthClientIdStub,
    setServiceStub,
    setuserIdSha256Stub,
    setUtmCampaignStub,
    setUtmContentStub,
    setUtmMediumStub,
    setUtmSourceStub,
    setUtmTermStub,
    submitPingStub;

  beforeEach(async () => {
    setDeviceTypeStub = sandbox.stub(deviceType, 'set');
    setEntrypointStub = sandbox.stub(entrypoint, 'set');
    setEventNameStub = sandbox.stub(event.name, 'set');
    setEventReasonStub = sandbox.stub(event.reason, 'set');
    setFlowIdStub = sandbox.stub(flowId, 'set');
    setOauthClientIdStub = sandbox.stub(oauthClientId, 'set');
    setServiceStub = sandbox.stub(service, 'set');
    setuserIdSha256Stub = sandbox.stub(userIdSha256, 'set');
    setUtmCampaignStub = sandbox.stub(utm.campaign, 'set');
    setUtmContentStub = sandbox.stub(utm.content, 'set');
    setUtmMediumStub = sandbox.stub(utm.medium, 'set');
    setUtmSourceStub = sandbox.stub(utm.source, 'set');
    setUtmTermStub = sandbox.stub(utm.term, 'set');
    submitPingStub = sandbox.stub(pings.accountsEvents, 'submit');
    await testResetGlean('glean-test');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('disabled', () => {
    it('does not call Glean.initialize', () => {
      const initStub = sandbox.stub(Glean, 'initialize');
      sandbox.stub(Glean, 'setUploadEnabled');
      const setEnabledSpy = sandbox.spy(GleanMetrics, 'setEnabled');
      GleanMetrics.initialize(mockConfig);
      sinon.assert.notCalled(initStub);
      sinon.assert.calledOnce(setEnabledSpy);
      sinon.assert.calledWith(setEnabledSpy, false);
    });

    it('does not submit a ping on an event', async () => {
      await GleanMetrics.registration.view();
      sinon.assert.notCalled(submitPingStub);
    });

    it('does not set the metrics values', async () => {
      await GleanMetrics.registration.view();

      sinon.assert.notCalled(setOauthClientIdStub);
      sinon.assert.notCalled(setServiceStub);

      sinon.assert.notCalled(setDeviceTypeStub);
      sinon.assert.notCalled(setEntrypointStub);
      sinon.assert.notCalled(setFlowIdStub);

      sinon.assert.notCalled(setUtmCampaignStub);
      sinon.assert.notCalled(setUtmContentStub);
      sinon.assert.notCalled(setUtmMediumStub);
      sinon.assert.notCalled(setUtmSourceStub);
      sinon.assert.notCalled(setUtmTermStub);
    });
  });

  describe('enabled', () => {
    it('calls Glean.initialize when enabled', () => {
      const initStub = sandbox.stub(Glean, 'initialize');
      const setEnabledSpy = sandbox.spy(GleanMetrics, 'setEnabled');
      const logPingsStub = sandbox.stub(Glean, 'setLogPings');
      const debugViewTagStub = sandbox.stub(Glean, 'setDebugViewTag');
      GleanMetrics.initialize(
        { ...mockConfig, enabled: true },
        { metrics, relier, user, userAgent }
      );
      sinon.assert.calledOnce(initStub);
      sinon.assert.calledWith(
        initStub,
        mockConfig.applicationId,
        mockConfig.uploadEnabled,
        {
          appDisplayVersion: mockConfig.appDisplayVersion,
          channel: mockConfig.channel,
          serverEndpoint: mockConfig.serverEndpoint,
          maxEvents: 1,
        }
      );
      sinon.assert.calledWith(logPingsStub, mockConfig.logPings);
      sinon.assert.notCalled(debugViewTagStub);
      sinon.assert.calledOnce(setEnabledSpy);
      sinon.assert.calledWith(setEnabledSpy, true);
    });

    it('submits a ping on an event', async () => {
      await GleanMetrics.registration.view();
      sinon.assert.calledOnce(submitPingStub);
    });

    it('sets empty strings as defaults', async () => {
      await GleanMetrics.registration.view();

      sinon.assert.calledWith(setuserIdSha256Stub, '');

      sinon.assert.calledWith(setOauthClientIdStub, '');
      sinon.assert.calledWith(setServiceStub, '');

      sinon.assert.calledWith(setDeviceTypeStub, '');
      sinon.assert.calledWith(setEntrypointStub, '');
      sinon.assert.calledWith(setFlowIdStub, '');

      sinon.assert.calledWith(setUtmCampaignStub, '');
      sinon.assert.calledWith(setUtmContentStub, '');
      sinon.assert.calledWith(setUtmMediumStub, '');
      sinon.assert.calledWith(setUtmSourceStub, '');
      sinon.assert.calledWith(setUtmTermStub, '');
    });

    it('sets the metrics values', async () => {
      mockFlowEventMetadata = {
        entrypoint: 'firefox_fortress',
        flowId: '0f0f',
        utmCampaign: 'quux',
        utmContent: 'fizz',
        utmMedium: 'buzz',
        utmSource: 'newtab',
        utmTerm: 'wibble',
      };
      mockClientId = '133t';
      mockService = 'fortress';
      mockDeviceType = 'banana_phone';

      await GleanMetrics.registration.view();

      sinon.assert.calledWith(setOauthClientIdStub, mockClientId);
      sinon.assert.calledWith(setServiceStub, mockService);

      sinon.assert.calledWith(setDeviceTypeStub, mockDeviceType);
      sinon.assert.calledWith(
        setEntrypointStub,
        mockFlowEventMetadata.entrypoint
      );
      sinon.assert.calledWith(setFlowIdStub, mockFlowEventMetadata.flowId);

      sinon.assert.calledWith(
        setUtmCampaignStub,
        mockFlowEventMetadata.utmCampaign
      );
      sinon.assert.calledWith(
        setUtmContentStub,
        mockFlowEventMetadata.utmContent
      );
      sinon.assert.calledWith(
        setUtmMediumStub,
        mockFlowEventMetadata.utmMedium
      );
      sinon.assert.calledWith(
        setUtmSourceStub,
        mockFlowEventMetadata.utmSource
      );
      sinon.assert.calledWith(setUtmTermStub, mockFlowEventMetadata.utmTerm);
    });

    describe('hashed uid', async () => {
      let accountGetterStub;
      beforeEach(() => {
        accountGetterStub = sinon
          .stub()
          .callsFake((x) => ({ sessionToken: 'wibble', uid: 'testo' }[x]));
        sinon
          .stub(user, 'getSignedInAccount')
          .returns({ get: accountGetterStub });
      });

      afterEach(() => {
        user.getSignedInAccount.restore();
      });

      it('logs hashed uid when session token exists', async () => {
        await GleanMetrics.login.success();
        sinon.assert.calledTwice(accountGetterStub);
        sinon.assert.calledWith(accountGetterStub, 'sessionToken');
        sinon.assert.calledWith(accountGetterStub, 'uid');
        sinon.assert.calledOnce(setuserIdSha256Stub);
        sinon.assert.calledWith(
          setuserIdSha256Stub,
          '7ca0172850c53065046beeac3cdec3fe921532dbfebdf7efeb5c33d019cd7798'
        );
      });
    });

    describe('email first', () => {
      it('submits a ping with the email_first_view event name', async () => {
        await GleanMetrics.emailFirst.view();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'email_first_view');
      });
    });

    describe('registration', () => {
      it('submits a ping with the reg_view event name', async () => {
        await GleanMetrics.registration.view();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_view');
      });

      it('submits a ping with the reg_submit event name', async () => {
        await GleanMetrics.registration.submit();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_submit');
      });

      it('submits a ping with the reg_submit_success event name', async () => {
        await GleanMetrics.registration.success();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_submit_success');
      });
    });

    describe('signup confirmation code', () => {
      it('submits a ping with the reg_signup_code_view event name', async () => {
        await GleanMetrics.signupConfirmation.view();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_signup_code_view');
      });

      it('submits a ping with the reg_signup_code_submit event name', async () => {
        await GleanMetrics.signupConfirmation.submit();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'reg_signup_code_submit');
      });
    });

    describe('loginConfirmation', () => {
      it('submits a ping with the login_email_confirmation_view event name', async () => {
        await GleanMetrics.loginConfirmation.view();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_email_confirmation_view'
        );
      });

      it('submits a ping with the reg_submit event name', async () => {
        await GleanMetrics.loginConfirmation.submit();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_email_confirmation_submit'
        );
      });
    });

    describe('totpForm', () => {
      it('submits a ping with the login_totp_form_view event name', async () => {
        await GleanMetrics.totpForm.view();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_totp_form_view');
      });

      it('submits a ping with the login_totp_code_submit event name', async () => {
        await GleanMetrics.totpForm.submit();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_totp_code_submit');
      });

      it('submits a ping with the login_totp_code_success_view event name', async () => {
        await GleanMetrics.totpForm.success();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_totp_code_success_view'
        );
      });
    });

    describe('login', () => {
      it('submits a ping with the login_view event name', () => {
        GleanMetrics.login.view();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_view');
      });

      it('submits a ping with the login_submit event name', () => {
        GleanMetrics.login.submit();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_submit');
      });

      it('submits a ping with the login_submit_success event name', () => {
        GleanMetrics.login.success();
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(setEventNameStub, 'login_submit_success');
      });

      it('submits a ping with the login_submit_frontend_error event name and a reason', () => {
        GleanMetrics.login.error({ reason: 'quux' });
        sinon.assert.calledOnce(setEventNameStub);
        sinon.assert.calledWith(
          setEventNameStub,
          'login_submit_frontend_error'
        );
        sinon.assert.calledOnce(setEventReasonStub);
        sinon.assert.calledWith(setEventReasonStub, 'quux');
      });
    });
  });

  describe('toggle enabled state', () => {
    let setEnabledStub;

    beforeEach(() => {
      setEnabledStub = sandbox.stub(Glean, 'setUploadEnabled');
    });

    it('set enabled to true', async () => {
      await GleanMetrics.setEnabled(true);
      sinon.assert.calledOnce(setEnabledStub);
      sinon.assert.calledWith(setEnabledStub, true);
    });

    it('set enabled to false', async () => {
      await GleanMetrics.setEnabled(false);
      sinon.assert.calledOnce(setEnabledStub);
      sinon.assert.calledWith(setEnabledStub, false);
    });
  });
});
