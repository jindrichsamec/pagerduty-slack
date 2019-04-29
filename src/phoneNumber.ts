import { getEnvVariable } from '@brandembassy/be-javascript-utils';

export type PhoneNumber = [number, string, string]

const DEFAULT_COUNTRY_CODE = getEnvVariable('DEFAULT_COUNTRY_CODE', '420');

export const parsePhoneNumber = (phoneNumber: string, description ?: string): PhoneNumber => {
  const rawNumber = phoneNumber.split(' ').join('').replace('+', '00').replace('00', '')
  let countryCode = Number(DEFAULT_COUNTRY_CODE)
  let number
  if (rawNumber.length > 9) {
    number = rawNumber.substr(-9)
    countryCode = Number(rawNumber.substr(-rawNumber.length, 3))
  } else if (rawNumber.length === 9) {
    number = rawNumber
  } else {
    throw new Error(`Given number ${phoneNumber} is not valid phone number`)
  }
  return [ Number(countryCode), String(number), description || '']
}
