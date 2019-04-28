import fetch, { Response } from 'node-fetch'
import { getEnvVariable } from '@brandembassy/be-javascript-utils';

const PAGERDUTY_CONTACT_ID = getEnvVariable('PAGERDUTY_CONTACT_ID')
const PAGERDUTY_USER_ID = getEnvVariable('PAGERDUTY_USER_ID')
const PAGERDUTY_API_TOKEN = getEnvVariable('PAGERDUTY_API_TOKEN')
const PAGER_DUTY_SLACK_CONTACT = getEnvVariable('PAGER_DUTY_SLACK_CONTACT', 'slack')

export interface PagerDutyContactMethod {
  id: string
  type: string
  summary: string
  self: string
  html_url: string | null
  label: string
  address: string
  blacklisted: boolean
  country_code: number
}
interface PagerDutyUser {
  contact_methods: Array<PagerDutyContactMethod>
}

export const updatePagerDutyContact = async (phoneNumber: string): Promise<Response> => {
  const url = `https://api.pagerduty.com/users/${PAGERDUTY_USER_ID}/contact_methods/${PAGERDUTY_CONTACT_ID}`;
  return fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      Authorization: `Token token=${PAGERDUTY_API_TOKEN}`,
    },
    body: JSON.stringify({
      contact_method: {
        address: phoneNumber
      }
    })
  });
}
