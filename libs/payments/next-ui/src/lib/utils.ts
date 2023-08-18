/* eslint-disable-next-line */
export type GenericTermsListItem = {
  key: string;
  href: string;
  text: string;
  localizationId: string;
};

export type GenericTermItem = {
  key: string;
  title: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
};

export const PaymentProviders = {
  stripe: 'stripe',
  paypal: 'paypal',
  none: 'not_chosen',
} as const;

export type PaymentProvidersType = typeof PaymentProviders;
export type PaymentProvider = PaymentProvidersType[keyof PaymentProvidersType];

export function buildPaymentTerms(
  provider?: PaymentProvider
): GenericTermItem[] {
  let providerString = '';
  const items: GenericTermsListItem[] = [];

  if (
    provider === PaymentProviders.stripe ||
    provider === PaymentProviders.none
  ) {
    providerString = 'Stripe';
    items.push({
      key: 'payment-provider-terms-1',
      href: 'https://stripe.com/privacy',
      text: 'Stripe privacy policy',
      localizationId: 'stripe-item-1',
    });
  }

  if (
    provider === PaymentProviders.paypal ||
    provider === PaymentProviders.none
  ) {
    providerString = !providerString
      ? 'PayPal'
      : `${providerString} and PayPal`;
    items.push({
      key: 'payment-provider-terms-2',
      href: 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
      text: 'PayPal privacy policy',
      localizationId: 'paypal-item-1',
    });
  }

  if (!items.length) {
    return [];
  }

  return [
    {
      key: 'payment-provider-terms',
      title: `Mozilla uses ${providerString} for secure payment processing.`,
      titleLocalizationId: 'title-1',
      items,
    },
  ];
}

export function buildFirefoxAccountsTerms(
  showFxaLinks: boolean,
  contentServerURL?: string
): GenericTermItem[] {
  if (!showFxaLinks) {
    return [];
  }

  return [
    {
      key: 'fxa-terms',
      title: 'Firefox Accounts',
      titleLocalizationId: 'title-1',
      items: [
        {
          key: 'fxa-terms-1',
          href: `${contentServerURL}/legal/terms`,
          text: 'Terms of Service',
          localizationId: 'terms-item-1',
        },
        {
          key: 'fxa-terms-2',
          href: `${contentServerURL}/legal/privacy`,
          text: 'Privacy Notice',
          localizationId: 'privacy-item-1',
        },
      ],
    },
  ];
}

export function buildProductTerms(
  productName: string,
  termsOfService?: string,
  privacyNotice?: string,
  termsOfServiceDownload?: string
): GenericTermItem[] {
  const items: GenericTermsListItem[] = [];

  if (termsOfService) {
    items.push({
      key: 'product-terms-1',
      href: termsOfService,
      text: 'Terms of Service',
      localizationId: 'terms-item-1',
    });
  }

  if (privacyNotice) {
    items.push({
      key: 'product-terms-2',
      href: privacyNotice,
      text: 'Privacy Notice',
      localizationId: 'privacy-item-1',
    });
  }

  if (termsOfServiceDownload) {
    items.push({
      key: 'product-terms-3',
      href: termsOfServiceDownload,
      text: 'Download Terms',
      localizationId: 'download-item-1',
    });
  }

  if (!items.length) {
    return [];
  }

  return [
    {
      key: 'product-terms',
      title: productName,
      titleLocalizationId: 'title-1',
      items,
    },
  ];
}

export async function getTermsCMS(offering: string) {}
