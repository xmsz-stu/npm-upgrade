interface VersionSelectorProps {
  currentVersion: string | null;
  targetVersion: string | null;
}

export function VersionSelector({
  currentVersion,
  targetVersion,
}: VersionSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Current Version</h3>
        <div className="text-sm text-muted-foreground">
          {currentVersion || 'Not selected'}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Target Version</h3>
        <div className="text-sm text-muted-foreground">
          {targetVersion || 'Not selected'}
        </div>
      </div>
    </div>
  );
} 