/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactElement } from 'react';
import { FinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import {
  BaseIntegration,
  IntegrationType,
  OAuthIntegration,
} from '../../models';
import { IntegrationSubsetType } from '../../lib/integrations';

export interface SigninFormData {
  email: string;
  password?: string;
}

export type SigninSubmitData = {
  email: string;
  password?: string;
};

export interface LoggedInAccountData {
  avatar: {
    id: string | null;
    url: string | null;
  };
  primaryEmail: { email: string };
  passwordCreated: number;
  metricsEnabled: boolean;
  linkedAccounts: {
    providerId: number;
    authAt: number;
    enabled: boolean;
  };
}

export interface SigninOAuthIntegration {
  type: IntegrationType.OAuth;
  getServiceName: () => ReturnType<OAuthIntegration['getServiceName']>;
}

export interface SigninBaseIntegration extends IntegrationSubsetType {
  getServiceName: () => ReturnType<BaseIntegration['getServiceName']>;
}

export type SigninIntegration = SigninOAuthIntegration | SigninBaseIntegration;

export interface SigninProps {
  avatar?: {
    id: string | null;
    url: string | null;
  };
  bannerErrorMessage?: string | ReactElement;
  email?: string;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  isPasswordNeeded?: boolean;
  onSubmit: ({ email, password }: SigninSubmitData) => Promise<void>;
  thirdPartyAuthEnabled?: boolean;
}
