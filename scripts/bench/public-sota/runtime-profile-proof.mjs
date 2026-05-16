function commandRuntimeProfiles(argv) {
  if (!Array.isArray(argv)) {
    return [];
  }
  const profiles = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--runtime-profile') {
      profiles.push(argv[index + 1]);
    } else if (typeof arg === 'string' && arg.startsWith('--runtime-profile=')) {
      profiles.push(arg.slice('--runtime-profile='.length));
    }
  }
  return profiles;
}

function manifestRuntimeProfilesAreReal(manifest) {
  const profiles = manifest.run?.runtimeProfiles;
  return Array.isArray(profiles) && profiles.length === 1 && profiles[0] === 'real';
}

function commandRuntimeProfilesAreReal(manifest) {
  const profiles = commandRuntimeProfiles(manifest.command?.argv);
  return profiles.length > 0 && profiles.every((profile) => profile === 'real');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertRealRuntime(result, manifest, subject = 'result') {
  const runtimeProfile = result.config?.runtimeProfile;
  assert(runtimeProfile === undefined || runtimeProfile === 'real', `${subject} runtime profile must be real when present`);
  assert(
    runtimeProfile === 'real' ||
      manifestRuntimeProfilesAreReal(manifest) ||
      commandRuntimeProfilesAreReal(manifest),
    `${subject} must use real runtime profile via raw config or run manifest`,
  );
}
