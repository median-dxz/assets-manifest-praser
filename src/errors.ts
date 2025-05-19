export class ManifestFilePraseError extends Error {
  constructor(step: string) {
    super(`Failed to parse package manifest at step: ${step}`);
    this.name = "PraseError";
  }
}

export class ManifestFileVersionError extends Error {
  constructor(version: string, targetVersion: string) {
    super(
      `Unsupported package manifest version: ${version}. Expected version: ${targetVersion}`,
    );
    this.name = "VersionError";
  }
}
