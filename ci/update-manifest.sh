#!/bin/bash
# This script is used by CI setup to update add-on name in manifest
# to explicitly state that produced artifact is a dev build.
set -e

# Name includes git revision to make QA and bug reporting easier for users :-)
REVISION=$(git show-ref --head HEAD | head -c 7)

# Browsers do not accept non-numeric values in version string
# so we calculate some sub-versions based on number of commits in master and  current branch
COMMITS_IN_MASTER=$(git rev-list --count master)
NEW_COMMITS_IN_CURRENT_BRANCH=$(git rev-list --count HEAD ^master)

# make it immutable
git checkout add-on/manifest.json

# update name
sed -i 's,__MSG_manifest_extensionName__,IPFS Companion (Dev Build @ '"$REVISION"'),' add-on/manifest.json
grep $REVISION add-on/manifest.json

# update version
sed -i "s|\"version\".*:.*\"\(.*\)\"|\"version\": \"\1.${COMMITS_IN_MASTER}.${NEW_COMMITS_IN_CURRENT_BRANCH}\"|" add-on/manifest.json
grep \"version\" add-on/manifest.json
