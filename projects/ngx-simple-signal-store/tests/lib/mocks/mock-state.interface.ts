export interface MockState {
  numberValue: number;
  stingValue: string;
  booleanValue: boolean;
  arrayValue: { test: string }[];
  objectValue: {
    test: string;
    objectChild: {
      test: string;
    };
    arrayChild: { test: string }[];
  };
}
