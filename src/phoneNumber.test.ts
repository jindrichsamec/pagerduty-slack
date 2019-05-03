import { parsePhoneNumber } from "./phoneNumber";

describe("phoneNumber", () => {
  const dataProvider = [
    { input: "721987123", expected: [420, "721987123", ""] },
    { input: "00420721987123", expected: [420, "721987123", ""] },
    { input: "420721987123", expected: [420, "721987123", ""] },
    { input: "+420721987123", expected: [420, "721987123", ""] },
    { input: "+420 721987123", expected: [420, "721987123", ""] },
    { input: "420 721 987 123", expected: [420, "721987123", ""] },
    { input: "+420 721 98 71 23", expected: [420, "721987123", ""] }
  ];

  dataProvider.forEach(dataSet => {
    it(`returns valid phone number for ${dataSet.input}`, () => {
      expect(parsePhoneNumber(dataSet.input)).toEqual(dataSet.expected);
    });
  });
});
