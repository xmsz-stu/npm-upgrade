import { Button } from "@/components/ui/button";

interface VersionListProps {
  versions: string[];
  currentVersion: string | null;
  targetVersion: string | null;
  onVersionSelect: (version: string, type: 'current' | 'target') => void;
}

export function VersionList({
  versions,
  currentVersion,
  targetVersion,
  onVersionSelect,
}: VersionListProps) {
  return (
    <ul className="space-y-2">
      {versions.map((version) => (
        <li
          key={version}
          className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg font-mono"
        >
          <span>{version}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVersionSelect(version, 'current')}
              className={currentVersion === version ? 'bg-primary text-primary-foreground' : ''}
            >
              Current
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVersionSelect(version, 'target')}
              className={targetVersion === version ? 'bg-primary text-primary-foreground' : ''}
            >
              Target
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
} 