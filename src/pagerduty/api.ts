import fetch, { Response } from 'node-fetch'
import { getEnvVariable } from '@brandembassy/be-javascript-utils';

const PAGERDUTY_API_TOKEN = getEnvVariable('PAGERDUTY_API_TOKEN')

export interface PagerDutyContactMethod {
  id ?: string
  type: string
  country_code: number
  address: string
  label: string
  summary ?: string
  self ?: string
  html_url ?: string | null
  blacklisted ?: false
}
interface PagerDutyUser {
  contact_methods: Array<PagerDutyContactMethod>
}

export const updatePagerDutyContact = async (userId: string, contactId: string, data: PagerDutyContactMethod): Promise<Response> => {
  const url = `https://api.pagerduty.com/users/${userId}/contact_methods/${contactId}`
  return fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      Authorization: `Token token=${PAGERDUTY_API_TOKEN}`,
    },
    body: JSON.stringify({
      contact_method: data
    })
  });
}

export const removePagerDutyContact = async (userId: string, contactId: string,): Promise<Response> => {
  const url = `https://api.pagerduty.com/users/${userId}/contact_methods/${contactId}`
  return fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      Authorization: `Token token=${PAGERDUTY_API_TOKEN}`,
    }
  });
}

export const createPagerDutyContact = async (userId: string, data: PagerDutyContactMethod): Promise<Response> => {
  const url = `https://api.pagerduty.com/users/${userId}/contact_methods/`
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      Authorization: `Token token=${PAGERDUTY_API_TOKEN}`,
    },
    body: JSON.stringify({
      contact_method: data
    })
  });
}

export const findPagerDutyContact = async (userId: string): Promise<PagerDutyUser> => {
  const url = `https://api.pagerduty.com/users/${userId}`
  const rawResponse = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.pagerduty+json;version=2',
      'Content-Type': 'application/json',
      Authorization: `Token token=${PAGERDUTY_API_TOKEN}`,
    }
  })
  const response = await rawResponse.json()
  return response.user
}
