import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VersionChanges {
  current: string;
  target: string;
  changes: string[];
  error?: string;
}

interface VersionComparisonProps {
  currentVersion: string | null;
  targetVersion: string | null;
  comparing: boolean;
  versionChanges: VersionChanges | null;
  onCompare: () => void;
}

export function VersionComparison({
  currentVersion,
  targetVersion,
  comparing,
  versionChanges,
  onCompare,
}: VersionComparisonProps) {
  return (
    <>
      {currentVersion && targetVersion && (
        <Button 
          onClick={onCompare} 
          disabled={comparing}
          className="w-full"
        >
          {comparing ? 'Comparing...' : 'Compare Versions'}
        </Button>
      )}

      {versionChanges && (
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <h3 className="font-medium">Changes from {versionChanges.current} to {versionChanges.target}:</h3>
              {versionChanges.error ? (
                <div className="text-destructive">{versionChanges.error}</div>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {versionChanges.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
} 