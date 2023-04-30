#!/bin/sh

echo "\n\n\nRun migration:"
# yarn prisma migrate dev

echo "\n\n\nRun seed:"
# yarn prisma db seed

echo "\n\n\nStart node server:"
yarn start:prod
