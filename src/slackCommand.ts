import * as Koa from 'koa'
import * as Debug from 'debug'
import { fetchSlackUserProfile, UserProfile } from './slackUser'
import { parsePhoneNumber } from './phoneNumber'
import { setPhoneNumber, removeActivePhoneNumber, findActiveContact } from './pagerduty/phoneNumberManagement'

const debug = Debug('app:command')

const SLACK_COMMAND_CALL_ME = 'call me'
const SLACK_COMMAND_STOP_CALLING = 'I want to sleep'
const SLACK_COMMAND_WHO_IS_CONTACT_PERSON = 'who'

async function handleCallMe (ctx: Koa.Context) {
  const userInfo: UserProfile = await fetchSlackUserProfile(ctx.request.body.user_id)
  debug('User profile %o', userInfo)
  if (userInfo.phone) {
    const phoneNumber = parsePhoneNumber(userInfo.phone, userInfo.display_name)
    debug('User phone %o', phoneNumber)
    const response = await setPhoneNumber(phoneNumber)
    debug('Pager duty response %o', response)
    ctx.response.body = 'ok'
  } else {
    debug('error')
    throw new Error('Unknown phone number. Please fill phone number to your slack profile');
  }
  return
}

async function handleStopCalling (ctx: Koa.Context) {
  debug('Removing phone number from pager duty')
  await removeActivePhoneNumber()
  ctx.response.body = 'ok'
}

async function handleWhoIsContactPerson(ctx: Koa.Context) {
  const contact = await findActiveContact()
  ctx.response.body = contact
}

export async function handleSlackCommand (ctx: Koa.Context, next: Function): Promise<void> {
  debug("request %o", ctx.request.body)

  const command = ctx.request.body.text

  const handlers = {
    [SLACK_COMMAND_CALL_ME]: handleCallMe,
    [SLACK_COMMAND_STOP_CALLING]: handleStopCalling,
    [SLACK_COMMAND_WHO_IS_CONTACT_PERSON]: handleWhoIsContactPerson,
  }

  if (handlers[command]) {
    await handlers[command].call(this, ctx, next)
    ctx.code = 200
  } else {
    ctx.response.body = `Command ${command} is not supported. Try one of these "${Object.keys(handlers).join('" / "')}"`
  }
}
