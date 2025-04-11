import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PackageSearchProps {
  packageName: string;
  onPackageNameChange: (name: string) => void;
  onSearch: (e: React.FormEvent) => void;
  loading: boolean;
}

export function PackageSearch({
  packageName,
  onPackageNameChange,
  onSearch,
  loading,
}: PackageSearchProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSearch} className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="text"
              value={packageName}
              onChange={(e) => onPackageNameChange(e.target.value)}
              placeholder="Enter npm package name"
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Check Versions'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 