import * as Koa from 'koa'
import * as Debug from 'debug'
import { fetchSlackUserProfile, UserProfile } from './slackUser'
import { parsePhoneNumber } from './phoneNumber'
import { setPhoneNumber, removeActivePhoneNumber, findActiveContact } from './pagerduty/phoneNumberManagement'
import { PagerDutyContactMethod } from './pagerduty/api';

const debug = Debug('app:command')

const SLACK_COMMAND_CALL_ME = 'call me'
const SLACK_COMMAND_STOP_CALLING = 'I want to sleep'
const SLACK_COMMAND_WHO_IS_CONTACT_PERSON = 'who'

async function handleCallMe (ctx: Koa.Context) {
  debug('User phone %o', ctx.phoneNumber)
  const response = await setPhoneNumber(ctx.phoneNumber)
  debug('Pager duty response %o', response)
  ctx.response.body = {
    response_type: 'ephemeral',
    text: `Your phone number +${ctx.phoneNumber[0]} ${ctx.phoneNumber[1]} is set in pagerduty`,
    attachments: [
      {url: 'https://media.giphy.com/media/Kyz9sLuhW4Y1d2QC6q/giphy.gif'}
    ]
  }
}

async function handleStopCalling (ctx: Koa.Context) {
  debug('Removing phone number from pager duty')
  await removeActivePhoneNumber(ctx.phoneNumber)
  ctx.response.body = { response_type: 'ephemeral' }
}

async function handleWhoIsContactPerson(ctx: Koa.Context) {
  const contact: PagerDutyContactMethod = await findActiveContact(ctx.phoneNumber)
  ctx.response.body = {
    response_type: 'ephemeral',
    text: contact.label
  }
  ctx.response.body = contact
}

export async function handleSlackCommand (ctx: Koa.Context, next: Function): Promise<void> {
  debug("request %o", ctx.request.body)
  const userInfo: UserProfile = await fetchSlackUserProfile(ctx.request.body.user_id)
  if (userInfo.phone) {
    ctx.phoneNumber = parsePhoneNumber(userInfo.phone, userInfo.display_name)
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
}
