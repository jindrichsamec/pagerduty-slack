import * as Koa from 'koa'
import * as Debug from 'debug'
import { fetchSlackUserProfile, UserProfile } from './slackUser';
import { updatePagerDutyContact } from './pagerduty';

const debug = Debug('app:command')

export async function handleSlackCommand (ctx: Koa.Context): Promise<void> {
  debug("request %o", ctx.request.body)
  const userInfo: UserProfile = await fetchSlackUserProfile(ctx.request.body.user_id)
  debug('User profile %o', userInfo)
  if (userInfo.phone) {
    debug('User phone %o', userInfo.phone)
    const response = await updatePagerDutyContact(userInfo.phone)
    debug('Pager duty response %o', response)
    ctx.code = 200
  } else {
    debug('error')
    throw new Error('Unknown phone number. Please fill phone number to your slack profile');
  }
  return
}
