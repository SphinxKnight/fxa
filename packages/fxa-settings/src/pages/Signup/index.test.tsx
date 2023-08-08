/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../lib/metrics';
import { viewName } from '.';
import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';
import {
  Subject,
  createMockSignupOAuthIntegration,
  createMockSignupSyncDesktopIntegration,
} from './mocks';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('Signup page', () => {
  afterEach(cleanup);
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  // TODO: why is everything rendering twice for this test?
  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);
    // testAllL10n(screen, bundle);
    await screen.findByRole('heading', { name: 'Set your password' });
    screen.getByRole('link', { name: 'Change email' });
    screen.getByLabelText('Password');
    screen.getByLabelText('Repeat password');
    screen.getByLabelText('How old are you?');
    screen.getByRole('link', { name: /Why do we ask/ });
    screen.getByRole('button', { name: 'Create account' });
    const firefoxTermsLink: HTMLElement = screen.getByRole('link', {
      name: 'Terms of Service',
    });
    const firefoxPrivacyLink: HTMLElement = screen.getByRole('link', {
      name: 'Privacy Notice',
    });

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(firefoxTermsLink).toHaveAttribute('href', '/legal/terms');
    expect(firefoxPrivacyLink).toHaveAttribute('href', '/legal/privacy');
  });

  it('allows users to show and hide password input', async () => {
    renderWithLocalizationProvider(<Subject />);

    const newPasswordInput = await screen.findByLabelText('Password');

    expect(newPasswordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'password');
  });

  it('does not allow the user to change their email with oauth integration', async () => {
    renderWithLocalizationProvider(
      <Subject integration={createMockSignupOAuthIntegration()} />
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'Change email' })
      ).not.toBeInTheDocument();
    });
  });

  it('shows an info banner and Pocket-specific TOS when client is Pocket', async () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockSignupOAuthIntegration(MozServices.Pocket)}
      />
    );

    const infoBannerLink = await screen.findByRole('link', {
      name: /Find out here/,
    });
    expect(infoBannerLink).toBeInTheDocument();

    // info banner is dismissible
    // const infoBannerDismissButton = screen.getByRole('button', {
    //   name: 'Close',
    // });
    // fireEvent.click(infoBannerDismissButton);
    // expect(infoBannerLink).not.toBeInTheDocument();

    // Pocket links should always open in a new window (announced by screen readers)
    const pocketTermsLink = screen.getByRole('link', {
      name: 'Terms of Service Opens in new window',
    });
    const pocketPrivacyLink = screen.getByRole('link', {
      name: 'Privacy Notice Opens in new window',
    });

    expect(pocketTermsLink).toHaveAttribute(
      'href',
      'https://getpocket.com/tos/'
    );
    expect(pocketPrivacyLink).toHaveAttribute(
      'href',
      'https://getpocket.com/privacy/'
    );
  });

  it('shows options to choose what to sync when CWTS is enabled', async () => {
    renderWithLocalizationProvider(
      <Subject integration={createMockSignupSyncDesktopIntegration()} />
    );

    await screen.findByText('Choose what to sync');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(8);
  });

  it('renders and handles newsletters', async () => {
    renderWithLocalizationProvider(<Subject />);

    await screen.findByText('Get more from Mozilla:');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('emits a metrics event on render', () => {
    renderWithLocalizationProvider(<Subject />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('handles submission', () => {
    it('on success', () => {});
    it('on fail', () => {});
    renderWithLocalizationProvider(<Subject />);
  });
});
