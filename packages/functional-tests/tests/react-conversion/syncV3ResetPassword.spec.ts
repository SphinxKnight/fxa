/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, newPagesForSync } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

test.describe.configure({ mode: 'parallel' });
let syncBrowserPages;

test.describe('Firefox Desktop Sync v3 reset password react', () => {
  test.beforeEach(async ({ target, pages: { login } }) => {
    test.slow();
    // Ensure that the feature flag is enabled
    const config = await login.getConfig();
    test.skip(config.showReactApp.resetPasswordRoutes !== true);

    syncBrowserPages = await newPagesForSync(target);
  });

  test('reset pw for sync user', async ({ credentials, target }) => {
    const { page, resetPasswordReact } = syncBrowserPages;
    await page.goto(
      getReactFeatureFlagUrl(
        target,
        '/reset_password',
        'context=fx_desktop_v3&service=sync'
      )
    );

    // Verify react page has been loaded
    await page.waitForSelector('#root');

    // Check that the sync relier is in the heading
    await page
      .getByRole('heading', {
        name: /Firefox Sync/,
      })
      .waitFor();

    await resetPasswordReact.fillEmailToResetPwd(credentials.email);

    // We need to append `&showReactApp=true` to reset link in order to enroll in reset password experiment
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&showReactApp=true`;

    await page.goto(link);

    await resetPasswordReact.submitNewPassword('Newpassword@');
    await page.waitForURL(/reset_password_verified/);

    await resetPasswordReact.resetPwdConfirmedHeadingVisible();

    // Update credentials file so that account can be deleted as part of test cleanup
    credentials.password = 'Newpassword@';
  });
});
