#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

output="$PWD/build/unsigned"
mkdir -p "$output"
shopt -s nullglob
workspaces=(ios/*.xcworkspace)
projects=(ios/*.xcodeproj)
if [[ ${#workspaces[@]} != 1 || ${#projects[@]} != 1 ]]; then
  echo 'Expected one generated app workspace and project. Run Expo prebuild and pod install first.' >&2
  exit 1
fi
# Expo generates the shared app scheme with the project name.
scheme="$(basename "${projects[0]}" .xcodeproj)"
xcodebuild -workspace "${workspaces[0]}" -scheme "$scheme" \
  -configuration Release -sdk iphoneos -destination 'generic/platform=iOS' \
  -derivedDataPath "$output/DerivedData" \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY= \
  ONLY_ACTIVE_ARCH=NO ARCHS=arm64 build 2>&1 | tee "$output/xcodebuild.log"

apps=("$output/DerivedData/Build/Products/Release-iphoneos/"*.app)
if [[ ${#apps[@]} != 1 ]]; then
  echo 'Expected exactly one built iPhone app.' >&2
  exit 1
fi
app="${apps[0]}"
python3 - "$app" <<'PY'
import pathlib, plistlib, subprocess, sys
app = pathlib.Path(sys.argv[1])
with (app / 'Info.plist').open('rb') as f:
    info = plistlib.load(f)
minimum = tuple(map(int, info['MinimumOSVersion'].split('.')))
if minimum > (16, 7):
    raise SystemExit(f"App requires iOS {info['MinimumOSVersion']}; too new for the target phone")
if info.get('CFBundleSupportedPlatforms') != ['iPhoneOS']:
    raise SystemExit('Build is not for a physical iPhone')
bundle = app / 'main.jsbundle'
if not bundle.is_file() or not bundle.stat().st_size:
    raise SystemExit('Release JavaScript bundle is missing; app would not work independently')
subprocess.run(['lipo', '-verify_arch', 'arm64', str(app / info['CFBundleExecutable'])], check=True)
print(f"Verified device app, bundled JavaScript, minimum iOS {info['MinimumOSVersion']}")
PY

# A fresh staging directory prevents old apps leaking into subsequent packages.
stage="$(mktemp -d "$output/package.XXXXXX")"
trap 'rm -rf "$stage"' EXIT
mkdir "$stage/Payload"
ditto "$app" "$stage/Payload/$(basename "$app")"
rm -f "$output/Nanki-unsigned.ipa"
(cd "$stage" && /usr/bin/zip -qry "$output/Nanki-unsigned.ipa" Payload)
unzip -tq "$output/Nanki-unsigned.ipa"
echo "Unsigned IPA: $output/Nanki-unsigned.ipa — sign locally before installing."
