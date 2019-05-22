#!/usr/bin/env bash

set -o nounset
set -o errexit
trap 'echo "Aborting due to errexit on line $LINENO. Exit code: $?" >&2' ERR
set -o errtrace
set -o pipefail

IFS=$'\n\t'
_ME=$(basename "${0}")

_print_help() {
  cat <<HEREDOC
Deploy this service to lambda.

Usage:
  ${_ME}
  ${_ME} -h | --help

Options:
  -h --help  Show this screen.
HEREDOC
}

_program() {
  if [ -z ${NODE_ENV+x} ]; then
    local stage="development"
  else
    local stage=$NODE_ENV
  fi

  rm -rf node_modules
  docker build -t nanny-deploy .
  docker run --env-file .env --env STAGE=${stage} nanny-deploy

  yarn install --force
}

_main() {
  # Avoid complex option parsing when only one program option is expected.
  if [[ "${1:-}" =~ ^-h|--help$  ]]
  then
    _print_help
  else
    _program "$@"
  fi
}

# Call `_main` after everything has been defined.
_main "$@"
