/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin from '.';
import { IntegrationType } from '../../models';
import {
  SigninBaseIntegration,
  SigninIntegration,
  SigninOAuthIntegration,
  SigninProps,
} from './interfaces';
import { MOCK_EMAIL, MOCK_SERVICE } from '../mocks';
import { MozServices } from '../../lib/types';

export const Subject = ({
  integrationType = IntegrationType.Web,
  bannerErrorMessage = '',
  isPasswordNeeded = true,
  serviceName = MozServices.Default,
  thirdPartyAuthEnabled = false,
}: {
  integrationType?: IntegrationType;
  serviceName?: MozServices;
} & Partial<SigninProps>) => {
  let signinIntegration: SigninIntegration;
  switch (integrationType) {
    case IntegrationType.OAuth:
      signinIntegration = createMockSigninOAuthIntegration();
      break;
    case IntegrationType.Web:
    default:
      signinIntegration = createMockSigninWebIntegration(serviceName);
  }

  return (
    <Signin
      {...{
        bannerErrorMessage,
        isPasswordNeeded,
        thirdPartyAuthEnabled,
      }}
      email={MOCK_EMAIL}
      integration={signinIntegration}
      onSubmit={() => Promise.resolve()}
      finishOAuthFlowHandler={() => Promise.resolve({ redirect: 'someUri' })}
    />
  );
};

export function createMockSigninWebIntegration(
  serviceName?: MozServices
): SigninBaseIntegration {
  return {
    type: IntegrationType.Web,
    getServiceName: () =>
      Promise.resolve(serviceName ? serviceName : MozServices.Default),
  };
}

export function createMockSigninOAuthIntegration(
  serviceName = MOCK_SERVICE
): SigninOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    getServiceName: () => Promise.resolve(serviceName),
  };
}
