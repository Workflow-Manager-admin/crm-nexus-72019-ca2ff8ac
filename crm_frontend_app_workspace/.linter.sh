#!/bin/bash
cd /home/kavia/workspace/code-generation/crm-nexus-72019-ca2ff8ac/crm_frontend_app_workspace/crm_frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

