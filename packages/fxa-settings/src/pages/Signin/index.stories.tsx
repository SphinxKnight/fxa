/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin from '.';
import { Meta } from '@storybook/react';
import { Subject } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Account } from '../../models';
import {
  MOCK_ACCOUNT,
  createAppContext,
  mockAppContext,
  produceComponent,
} from '../../models/mocks';
import { SigninProps } from './interfaces';
import { MozServices } from '../../lib/types';

export default {
  title: 'Pages/Signin',
  component: Signin,
  decorators: [withLocalization],
} as Meta;

type RenderStoryOptions = {
  account?: Account;
};

function renderStory(
  { account }: RenderStoryOptions,
  {
    bannerErrorMessage,
    isPasswordNeeded,
    thirdPartyAuthEnabled,
  }: Partial<SigninProps> = {},
  // serviceName can be provided for mock integration
  serviceName?: MozServices,
  storyName?: string
) {
  const story = () =>
    produceComponent(
      <Subject
        {...{
          bannerErrorMessage,
          isPasswordNeeded,
          serviceName,
          thirdPartyAuthEnabled,
        }}
      />,
      {},
      {
        ...mockAppContext({
          ...createAppContext(),
          account,
        }),
      }
    );
  story.storyName = storyName;
  return story();
}

const loggedInAccount = MOCK_ACCOUNT as unknown as Account;

const noAccountLoggedIn = {
  avatar: { id: null, url: null },
} as unknown as Account;

export const Default = () => {
  return renderStory({ account: loggedInAccount });
};

export const NotLoggedIn = () => {
  return renderStory({ account: noAccountLoggedIn });
};

export const WithThirdPartyAuth = () => {
  return renderStory(
    { account: noAccountLoggedIn },
    { isPasswordNeeded: false, thirdPartyAuthEnabled: true }
  );
};

export const WithThirdPartyAuthAndPassword = () => {
  return renderStory(
    { account: noAccountLoggedIn },
    { isPasswordNeeded: true, thirdPartyAuthEnabled: true }
  );
};

export const WithErrorBanner = () => {
  return renderStory(
    { account: noAccountLoggedIn },
    { bannerErrorMessage: 'Uh oh there was an error' }
  );
};

// TODO fix logo in header (does not work)
export const ServiceIsPocket = () => {
  return renderStory(
    { account: loggedInAccount },
    { isPasswordNeeded: false },
    MozServices.Pocket
  );
};
