import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as logger from 'koa-logger'
import * as bodyParser from 'koa-bodyparser'
import { handleSlackCommand } from './slackCommand'

const app = new Koa()
const router = new Router()

router.get('/', (ctx: Koa.Context) => {
  ctx.code = 200
  ctx.body = {
    'name': 'pagerduty-slack',
    'availableAPIs': {
      '/slack-command': 'Slack command handler',
    }
  }
})
router.post('/slack-command', handleSlackCommand);

app.use(logger())
app.use(bodyParser())
app.use(router.routes())

export default app
