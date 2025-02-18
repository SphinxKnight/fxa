/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Storage from './storage';

const ORIGINAL_TAB_KEY = 'originalTab';

function sessionStorage() {
  return Storage.factory('sessionStorage');
}

export function isOriginalTab() {
  const storage = sessionStorage();
  let value = storage.get(ORIGINAL_TAB_KEY);

  // Fallback for content server's applied state.
  if (value === undefined) {
    value = window.sessionStorage.getItem(ORIGINAL_TAB_KEY);
  }

  return value;
}

export function clearOriginalTab() {
  const storage = sessionStorage();
  return storage.remove(ORIGINAL_TAB_KEY);
}

export function setOriginalTabMarker() {
  const storage = sessionStorage();
  storage.set(ORIGINAL_TAB_KEY, '1');
}

const OAUTH_KEY = 'oauth';
export function clearOAuthData() {
  const storage = sessionStorage();
  storage.remove(OAUTH_KEY);
}
