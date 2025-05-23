run = ["npm", "run", "dev"]
language = "nodejs"
onBoot = ["echo", "Setting up Bakery Bliss..."]
hidden = ["node_modules", ".config"]

[packager]
language = "nodejs"
  [packager.features]
  packageSearch = true
  guessImports = true
  enabledForHosting = false

[env]
XDG_CONFIG_HOME = "/home/runner/.config"
PATH = "/home/runner/$REPL_SLUG/.config/npm/node_global/bin:/home/runner/$REPL_SLUG/node_modules/.bin:/home/runner/.config/npm/node_global/bin"

[nix]
channel = "stable-22_11"

[deployment]
run = ["npm", "start"]
deploymentTarget = "cloudrun"