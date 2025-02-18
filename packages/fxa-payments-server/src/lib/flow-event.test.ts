import { Severity } from '@sentry/browser';
import FlowEvent from './flow-event';

import sentryMetrics from './sentry';

const eventGroup = 'testo';
const eventType = 'quuz';

const mockNow = 1002003004005;

beforeEach(() => {
  // `sendBeacon` is undefined in this context
  window.navigator.sendBeacon = jest.fn();
  global.console.error = jest.fn();
});

it('does not send metrics when uninitialized', () => {
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {});
  expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
});

it('remains uninitialized when any flow param is empty', () => {
  FlowEvent.init({});
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {});

  FlowEvent.init({ device_id: 'moz9000', flow_begin_time: 9001 });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {});

  FlowEvent.init({ device_id: 'moz9000', flow_id: 'ipsoandfacto' });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {});

  FlowEvent.init({ flow_begin_time: 9001, flow_id: 'ipsoandfacto' });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {});

  expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
});

it('captures a warning to sentry if flow metrics fails to initialize', () => {
  const mockCapture = jest
    .spyOn(sentryMetrics, 'captureMessage')
    .mockImplementation();
  FlowEvent.init({
    device_id: 'testDevice',
    flow_id: 'flowId',
  });

  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {});
  expect(mockCapture).toBeCalledWith(
    'Flow events not initialized - Metrics not captured for checkout flow',
    'flowEvents.initializationError',
    { referrer: '', url: 'http://localhost/' },
    Severity.Warning
  );
});

it('logs and captures an exception from postMetrics', () => {
  const mockCapture = jest
    .spyOn(sentryMetrics, 'captureException')
    .mockImplementation();
  const error = 'oops';
  (window.navigator.sendBeacon as jest.Mock).mockImplementation(() => {
    throw error;
  });
  FlowEvent.init({
    device_id: 'moz9000',
    flow_begin_time: 9001,
    flow_id: 'ipsoandfacto',
  });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {});
  expect(mockCapture).toBeCalledWith(error);
  expect(global.console.error).toBeCalledWith('AppError', error);
});

it('initializes when given all flow params', () => {
  FlowEvent.init({
    device_id: 'moz9000',
    flow_begin_time: 9001,
    flow_id: 'ipsoandfacto',
  });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {
    flowBeginTime: mockNow - 9001,
  });

  expect(window.navigator.sendBeacon).toHaveBeenCalled();
});

it('sends the correct Amplitude metric payload', () => {
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, {
    quuz: 'quux',
  });
  const [metricsPath, payload] = (window.navigator.sendBeacon as jest.Mock).mock
    .calls[0];
  expect(metricsPath).toEqual(`/metrics`);
  expect(JSON.parse(payload)).toMatchObject({
    events: [
      {
        offset: expect.any(Number),
        type: `amplitude.${eventGroup}.${eventType}`,
      },
    ],
    data: {
      flowId: 'ipsoandfacto',
      flowBeginTime: expect.any(Number),
      deviceId: 'moz9000',
    },
  });
});
