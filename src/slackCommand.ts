import * as Koa from 'koa'
import * as Debug from 'debug'
import { fetchSlackUserProfile, UserProfile } from './slackUser'
import { parsePhoneNumber } from './phoneNumber'
import { setPhoneNumber } from './pagerduty/phoneNumberManagement'

const debug = Debug('app:command')

export async function handleSlackCommand (ctx: Koa.Context): Promise<void> {
  debug("request %o", ctx.request.body)
  const userInfo: UserProfile = await fetchSlackUserProfile(ctx.request.body.user_id)
  debug('User profile %o', userInfo)
  if (userInfo.phone) {
    const phoneNumber = parsePhoneNumber(userInfo.phone)
    debug('User phone %o', phoneNumber)
    const response = await setPhoneNumber(phoneNumber)
    debug('Pager duty response %o', response)
    ctx.code = 200
  } else {
    debug('error')
    throw new Error('Unknown phone number. Please fill phone number to your slack profile');
  }
  return
}
