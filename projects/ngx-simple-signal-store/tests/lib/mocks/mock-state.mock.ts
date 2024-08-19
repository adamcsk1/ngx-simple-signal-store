import { MockState } from './mock-state.interface';

export const mockInitialData: MockState = {
  numberValue: 42,
  stingValue: 'forty-two',
  booleanValue: true,
  arrayValue: [{ test: 'forty-two' }],
  objectValue: {
    test: 'forty-two',
    objectChild: {
      test: 'forty-two',
    },
    arrayChild: [{ test: 'forty-two' }],
  },
};
