import * as Koa from 'koa'
import * as Debug from 'debug'

const debug = Debug('app:command')

export async function handleSlackCommand (ctx: Koa.Context): Promise<void> {
  debug(ctx.request.body)
  ctx.code = 200
  ctx.response.body = 'ok'
  return
}
