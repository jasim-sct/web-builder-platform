#!/usr/bin/env bash
# Start Android emulator for Organization Alert native app.
# Usage:
#   ./scripts/emulator-runner.sh              # start emulator and wait for boot
#   ./scripts/emulator-runner.sh --install    # boot, then install debug APK
#   ./scripts/emulator-runner.sh --launch     # boot, install, launch MainActivity
#   ./scripts/emulator-runner.sh --stop       # kill running emulator processes
#   ./scripts/emulator-runner.sh --reset      # stop + reset adb + cold boot (fixes "device offline")
#   ./scripts/emulator-runner.sh --wipe-data  # cold boot with wiped AVD data

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
AVD_NAME="${AVD_NAME:-Pixel_API_34}"
SYSTEM_IMAGE="${SYSTEM_IMAGE:-system-images;android-34;google_apis;x86_64}"
DEVICE_PROFILE="${DEVICE_PROFILE:-pixel_6}"
PACKAGE_NAME="com.example.organizationalert"
MAIN_ACTIVITY="${PACKAGE_NAME}/.MainActivity"
EMULATOR_SERIAL="${EMULATOR_SERIAL:-emulator-5554}"

INSTALL=false
LAUNCH=false
STOP=false
RESET=false
WIPE_DATA=false
HEADLESS=false

usage() {
  sed -n '2,11p' "$0"
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --install) INSTALL=true ;;
    --launch) INSTALL=true; LAUNCH=true ;;
    --stop) STOP=true ;;
    --reset) RESET=true ;;
    --wipe-data) WIPE_DATA=true ;;
    --headless) HEADLESS=true ;;
    --avd) AVD_NAME="$2"; shift ;;
    -h|--help) usage 0 ;;
    *) echo "Unknown option: $1" >&2; usage 1 ;;
  esac
  shift
done

export ANDROID_HOME
export PATH="${ANDROID_HOME}/emulator:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/cmdline-tools/latest/bin:${PATH}"

adb_cmd() {
  adb ${ADB_SERIAL_ARGS[@]+"${ADB_SERIAL_ARGS[@]}"} "$@"
}

reset_adb() {
  echo "Resetting ADB server..."
  adb kill-server 2>/dev/null || true
  sleep 1
  adb start-server
  sleep 1
}

stop_emulator() {
  echo "Stopping emulator processes for AVD '${AVD_NAME}'..."
  adb -s "${EMULATOR_SERIAL}" emu kill 2>/dev/null || true
  pkill -f "qemu-system-.*${AVD_NAME}" 2>/dev/null || true
  pkill -f "emulator.*-avd ${AVD_NAME}" 2>/dev/null || true
  sleep 2
  reset_adb
}

if [[ "$STOP" == true ]]; then
  stop_emulator
  echo "Done."
  exit 0
fi

if [[ "$RESET" == true ]]; then
  stop_emulator
fi

if [[ ! -d "${ANDROID_HOME}" ]]; then
  echo "ERROR: Android SDK not found at ${ANDROID_HOME}" >&2
  echo "Set ANDROID_HOME or install SDK to ~/Android/Sdk" >&2
  exit 1
fi

if ! command -v emulator >/dev/null 2>&1; then
  echo "ERROR: emulator not in PATH. Install Android Emulator via sdkmanager." >&2
  exit 1
fi

avd_config_path() {
  echo "${HOME}/.android/avd/${AVD_NAME}.avd/config.ini"
}

configure_avd_cold_boot() {
  local cfg
  cfg="$(avd_config_path)"
  [[ -f "$cfg" ]] || return 0

  echo "Configuring AVD for reliable cold boot (no broken quickboot snapshot)..."
  sed -i \
    -e 's/^fastboot\.forceFastBoot = .*/fastboot.forceFastBoot = no/' \
    -e 's/^fastboot\.forceColdBoot = .*/fastboot.forceColdBoot = yes/' \
    -e 's/^firstboot\.bootFromLocalSnapshot = .*/firstboot.bootFromLocalSnapshot = no/' \
    -e 's/^firstboot\.saveToLocalSnapshot = .*/firstboot.saveToLocalSnapshot = no/' \
    "$cfg"

  local snap_dir="${HOME}/.android/avd/${AVD_NAME}.avd/snapshots"
  if [[ -d "$snap_dir" ]]; then
    rm -rf "${snap_dir:?}/"*
    echo "Cleared stale quickboot snapshots in ${snap_dir}"
  fi
}

configure_avd_performance() {
  local cfg
  cfg="$(avd_config_path)"
  [[ -f "$cfg" ]] || return 0

  echo "Tuning AVD for performance (GPU + RAM)..."
  sed -i \
    -e 's/^hw\.gpu\.enabled = .*/hw.gpu.enabled = yes/' \
    -e 's/^hw\.gpu\.mode = .*/hw.gpu.mode = host/' \
    -e 's/^hw\.ramSize = .*/hw.ramSize = 4096M/' \
    -e 's/^hw\.camera\.back = .*/hw.camera.back = none/' \
    -e 's/^hw\.camera\.front = .*/hw.camera.front = none/' \
    -e 's/^hw\.sensors\.proximity = .*/hw.sensors.proximity = no/' \
    -e 's/^hw\.sensors\.magnetic_field = .*/hw.sensors.magnetic_field = no/' \
    -e 's/^hw\.sensors\.orientation = .*/hw.sensors.orientation = no/' \
    -e 's/^hw\.sensors\.temperature = .*/hw.sensors.temperature = no/' \
    -e 's/^hw\.sensors\.humidity = .*/hw.sensors.humidity = no/' \
    -e 's/^hw\.sensors\.pressure = .*/hw.sensors.pressure = no/' \
    -e 's/^hw\.sensors\.light = .*/hw.sensors.light = no/' \
    -e 's/^hw\.sensors\.heart_rate = .*/hw.sensors.heart_rate = no/' \
    -e 's/^hw\.sdCard = .*/hw.sdCard = no/' \
    "$cfg"
}

ensure_avd() {
  if avdmanager list avd 2>/dev/null | grep -q "Name: ${AVD_NAME}"; then
    echo "AVD '${AVD_NAME}' already exists."
    configure_avd_cold_boot
    configure_avd_performance
    return 0
  fi

  echo "Creating AVD '${AVD_NAME}'..."
  if ! sdkmanager --list 2>/dev/null | grep -q "${SYSTEM_IMAGE}"; then
    echo "Installing system image ${SYSTEM_IMAGE}..."
    yes | sdkmanager "${SYSTEM_IMAGE}" >/dev/null
  fi
  echo no | avdmanager create avd -n "${AVD_NAME}" -k "${SYSTEM_IMAGE}" -d "${DEVICE_PROFILE}" >/dev/null
  configure_avd_cold_boot
  configure_avd_performance
  echo "AVD created."
}

accel_args() {
  if [[ -r /dev/kvm ]] && [[ -w /dev/kvm ]]; then
    echo "Hardware acceleration: KVM available"
    EMULATOR_ACCEL_ARGS=()
    EMULATOR_MEMORY_ARGS=(-memory 4096)
  else
    echo "WARNING: /dev/kvm not available — starting with -no-accel (slow, 5–15 min boot)."
    echo "         Enable virtualization in BIOS or use a physical device for faster testing."
    EMULATOR_ACCEL_ARGS=(-no-accel)
    EMULATOR_MEMORY_ARGS=(-memory 2048)
  fi
}

gpu_args() {
  if [[ -r /dev/kvm ]] && [[ -w /dev/kvm ]] && [[ -e /dev/dri/renderD128 || -e /dev/dri/card0 ]]; then
    echo "Graphics: host GPU acceleration (-gpu host)"
    GPU_ARGS=(-gpu host)
  else
    echo "Graphics: software renderer (-gpu swiftshader_indirect) — may cause System UI ANRs"
    GPU_ARGS=(-gpu swiftshader_indirect)
  fi
}

tune_emulator_ui() {
  echo "Reducing emulator animation load..."
  adb_cmd shell settings put global window_animation_scale 0 2>/dev/null || true
  adb_cmd shell settings put global transition_animation_scale 0 2>/dev/null || true
  adb_cmd shell settings put global animator_duration_scale 0 2>/dev/null || true
}

device_state() {
  adb devices 2>/dev/null | awk -v serial="${EMULATOR_SERIAL}" '$1==serial {print $2; exit}'
}

boot_wait_iterations() {
  if [[ -r /dev/kvm ]] && [[ -w /dev/kvm ]]; then
    echo 180
  else
    echo 600
  fi
}

wait_for_online_device() {
  local max_iter
  max_iter="$(boot_wait_iterations)"
  local max_min=$(( max_iter * 3 / 60 ))
  echo "Waiting for emulator to reach 'device' state (up to ~${max_min} min without KVM)..."
  reset_adb

  local state=""
  local i
  for i in $(seq 1 "$max_iter"); do
    state="$(device_state)"
    if [[ "$state" == "device" ]]; then
      local boot=""
      boot="$(adb_cmd shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
      if [[ "$boot" == "1" ]]; then
        adb devices -l
        tune_emulator_ui
        echo "Emulator ready (boot_completed=1)."
        return 0
      fi
      echo "  [${i}] online, waiting for boot_completed..."
    elif [[ "$state" == "offline" ]]; then
      if (( i % 20 == 0 )); then
        echo "  [${i}] still offline (normal on -no-accel; qemu may be at high CPU)..."
      fi
      if (( i % 60 == 0 )); then
        reset_adb
      fi
    elif [[ -z "$state" ]]; then
      echo "  [${i}] waiting for emulator to appear..."
    else
      echo "  [${i}] state=${state}"
    fi
    sleep 3
  done

  echo "ERROR: Emulator did not come online within ~${max_min} minutes." >&2
  echo "Try: ./scripts/emulator-runner.sh --reset --wipe-data --launch" >&2
  echo "Or use a physical device: adb devices" >&2
  echo "Last 30 lines of emulator log:" >&2
  tail -30 "${PROJECT_DIR}/.emulator.log" 2>/dev/null || true
  adb devices -l
  exit 1
}

start_emulator() {
  ADB_SERIAL_ARGS=(-s "${EMULATOR_SERIAL}")

  local existing_state
  existing_state="$(device_state)"
  if [[ "$existing_state" == "device" ]]; then
    local boot
    boot="$(adb_cmd shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
    if [[ "$boot" == "1" ]]; then
      echo "Emulator already online: ${EMULATOR_SERIAL}"
      adb devices -l
      tune_emulator_ui
      return 0
    fi
  fi

  if [[ "$existing_state" == "offline" ]] || [[ "$RESET" == true ]]; then
    stop_emulator
  fi

  ensure_avd
  accel_args
  gpu_args

  local headless_args=()
  local wipe_args=()
  if [[ "$HEADLESS" == true ]]; then
    headless_args=(-no-window)
  fi
  if [[ "$WIPE_DATA" == true ]]; then
    wipe_args=(-wipe-data)
    echo "Cold boot with -wipe-data"
  fi

  local snapshot_args=(-no-snapshot-save -no-snapshot-load)
  if [[ "$RESET" == true ]] || [[ "$WIPE_DATA" == true ]]; then
    configure_avd_cold_boot
  fi

  echo "Starting emulator '${AVD_NAME}' (serial ${EMULATOR_SERIAL})..."
  : >"${PROJECT_DIR}/.emulator.log"
  nohup emulator -avd "${AVD_NAME}" \
    -port 5554 \
    "${snapshot_args[@]}" \
    -no-audio \
    -no-boot-anim \
    -cores 2 \
    "${EMULATOR_ACCEL_ARGS[@]}" \
    "${EMULATOR_MEMORY_ARGS[@]}" \
    "${GPU_ARGS[@]}" \
    "${headless_args[@]}" \
    "${wipe_args[@]}" \
    >>"${PROJECT_DIR}/.emulator.log" 2>&1 &

  wait_for_online_device
}

install_apk() {
  echo "Building and installing debug APK..."
  (cd "${PROJECT_DIR}" && ./gradlew installDebug)
}

launch_app() {
  echo "Launching ${MAIN_ACTIVITY}..."
  adb_cmd shell am start -n "${MAIN_ACTIVITY}"
}

start_emulator

if [[ "$INSTALL" == true ]]; then
  install_apk
fi

if [[ "$LAUNCH" == true ]]; then
  launch_app
fi

echo ""
echo "Backend URL for emulator: http://10.0.2.2:5000"
echo "Emulator log: ${PROJECT_DIR}/.emulator.log"
echo "Watch boot: tail -f ${PROJECT_DIR}/.emulator.log"
