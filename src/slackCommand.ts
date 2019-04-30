import * as Koa from 'koa'
import * as Debug from 'debug'
import { fetchSlackUserProfile, UserProfile } from './slackUser'
import { parsePhoneNumber } from './phoneNumber'
import { setPhoneNumber, removeActivePhoneNumber } from './pagerduty/phoneNumberManagement'

const debug = Debug('app:command')

const SLACK_COMMAND_CALL_ME = 'on'
const SLACK_COMMAND_STOP_CALLING = 'off'

async function handleCallMe (ctx: Koa.Context) {
  debug('User phone %o', ctx.phoneNumber)
  const response = await setPhoneNumber(ctx.phoneNumber)
  debug('Pager duty response %o', response)
  ctx.response.body = {
    response_type: 'ephemeral',
    text: `Your phone number +${ctx.phoneNumber[0]} ${ctx.phoneNumber[1]} is set in pagerduty`,
    attachments: [
      {
        "type": "image",
        "title": {
          "type": "plain_text",
          "text": "Call me! Call me!",
          "emoji": true
        },
        "image_url": "https://media.giphy.com/media/Kyz9sLuhW4Y1d2QC6q/giphy.gif",
        "alt_text": "Call me! Call me!"
      }
    ]
  }
}

async function handleStopCalling (ctx: Koa.Context) {
  debug('Removing phone number from pager duty')
  await removeActivePhoneNumber(ctx.phoneNumber)
  ctx.response.body = {
    response_type: 'ephemeral',
    text: 'Bye bye!',
    attachments: [
      {
        "type": "image",
        "title": {
          "type": "plain_text",
          "text": "Call me! Call me!",
          "emoji": true
        },
        "image_url": "https://media.giphy.com/media/xTiTnDUCVoQN0VF2ik/giphy.gif",
        "alt_text": "Bye bye!"
      }
    ]
  }
}

export async function handleSlackCommand (ctx: Koa.Context, next: Function): Promise<void> {
  debug("request %o", ctx.request.body)
  const userInfo: UserProfile = await fetchSlackUserProfile(ctx.request.body.user_id)
  if (userInfo.phone) {
    try {
      ctx.phoneNumber = parsePhoneNumber(userInfo.phone, userInfo.display_name)
    } catch (err) {
      debug('Error %s %o', err.message, err)
    }
  }

  if (ctx.phoneNumber) {
    const command = ctx.request.body.text

    const handlers = {
      [SLACK_COMMAND_CALL_ME]: handleCallMe,
      [SLACK_COMMAND_STOP_CALLING]: handleStopCalling
    }

    if (handlers[command]) {
      await handlers[command].call(this, ctx, next)
      ctx.code = 200
    } else {
      ctx.response.body = `Command ${command} is not supported. Try one of these "${Object.keys(handlers).join('" / "')}"`
    }
  } else {
    ctx.response.body = {
      response_type: 'ephemeral',
      text: 'Fill your phone number into slack profile!',
      attachments: [
        {
          "type": "image",
          "title": {
            "type": "plain_text",
            "text": "Fill your phone number into slack profile!",
            "emoji": true
          },
          "image_url": "https://media.giphy.com/media/CSkarvZlyHzzi/giphy.gif",
          "alt_text": "Bye bye!"
        }
      ]
    }
  }
}
