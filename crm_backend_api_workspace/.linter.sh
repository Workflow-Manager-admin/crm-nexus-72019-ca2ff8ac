#!/bin/bash
cd /home/kavia/workspace/code-generation/crm-nexus-72019-ca2ff8ac/crm_backend_api_workspace/crm_backend_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

