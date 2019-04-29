import Debug from 'debug'
import { getEnvVariable } from '@brandembassy/be-javascript-utils'
import { findPagerDutyContact, updatePagerDutyContact, createPagerDutyContact, removePagerDutyContact, PagerDutyContactMethod } from './api'
import { PhoneNumber } from '../phoneNumber'

const debug = Debug('app:pagerduty')

const PAGERDUTY_USER_ID = getEnvVariable('PAGERDUTY_USER_ID')
const PAGERDUTY_SLACK_CONTACT_TYPE = getEnvVariable('PAGERDUTY_SLACK_CONTACT_TYPE', 'slack')

const buildPagerDutyContact = (phoneNumber: PhoneNumber): PagerDutyContactMethod => {
  return {
    country_code: phoneNumber[0],
    address: phoneNumber[1],
    type: 'phone_contact_method',
    label: `${PAGERDUTY_SLACK_CONTACT_TYPE}-${phoneNumber[2]}`,
  }
}

export const removeActivePhoneNumber = async (): Promise<void> => {
  const contact = await findActiveContact()
  if (contact) {
    await removePagerDutyContact(PAGERDUTY_USER_ID, contact.id)
  }
}

export const setPhoneNumber = async (phoneNumber: PhoneNumber): Promise<void> => {
  const contact = await findActiveContact()
  debug('active contact %o', contact)
  if (contact) {
    debug('updating existing ', contact.id)
    await updatePagerDutyContact(PAGERDUTY_USER_ID, contact.id, buildPagerDutyContact(phoneNumber))
  } else {
    const newContact = buildPagerDutyContact(phoneNumber)
    debug('creating new contact %o', newContact)
    await createPagerDutyContact(PAGERDUTY_USER_ID, newContact)
  }
}

export const findActiveContact = async (): Promise<PagerDutyContactMethod | null> => {
  const user = await findPagerDutyContact(PAGERDUTY_USER_ID)
  debug('pagerduty user %o', user)
  return user.contact_methods.find(
    (contact: PagerDutyContactMethod) => contact.summary.startsWith(PAGERDUTY_SLACK_CONTACT_TYPE)
  )
}
