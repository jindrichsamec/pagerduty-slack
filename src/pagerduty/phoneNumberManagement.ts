import { getEnvVariable } from '@brandembassy/be-javascript-utils'
import { findPagerDutyContact, updatePagerDutyContact, createPagerDutyContact, removePagerDutyContact, PagerDutyContactMethod } from './api'
import { PhoneNumber } from '../phoneNumber'

const PAGERDUTY_USER_ID = getEnvVariable('PAGERDUTY_USER_ID')
const PAGERDUTY_SLACK_CONTACT_TYPE = getEnvVariable('PAGERDUTY_SLACK_CONTACT_TYPE', 'slack')

const buildPagerDutyContact = (phoneNumber: PhoneNumber): PagerDutyContactMethod => {
  return {
    country_code: phoneNumber[0],
    address: phoneNumber[1],
    type: 'phone',
    summary: PAGERDUTY_SLACK_CONTACT_TYPE,
    html_url: '',
    label: 'Slack',
    self: '',
    blacklisted: true,
    id: '',
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
  if (contact) {
    await updatePagerDutyContact(PAGERDUTY_USER_ID, contact.id, {
      ...contact,
      country_code: phoneNumber[0],
      address: phoneNumber[1]
    })
  } else {
    await createPagerDutyContact(PAGERDUTY_USER_ID, buildPagerDutyContact(phoneNumber))
  }
}

export const findActiveContact = async (): Promise<PagerDutyContactMethod | null> => {
  const user = await findPagerDutyContact(PAGERDUTY_USER_ID)
  return user.contact_methods.find(
    (contact: PagerDutyContactMethod) => contact.summary === PAGERDUTY_SLACK_CONTACT_TYPE
  )
}
