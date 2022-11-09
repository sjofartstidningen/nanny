# 🌆 Nanny

> An image processing service compatible with [humanmade/tachyon](https://github.com/humanmade/tachyon)

## Deployment

Deployments are, at this stage, supposed to run on a local machine, but in the future it might be possible to also run
it on CI.

### Deploy updates to the whole stack

This script should be run when changes that affect the whole stack have been made – e.g changes in `serverless.yml`:

```sh
STAGE=production yarn run deploy
```

### Deploy updates to function only

This script should be run when only source code has changed.

```sh
STAGE=production yarn run deploy:fn
```
