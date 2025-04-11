'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PackageSearch } from "@/components/package-search";
import { VersionSelector } from "@/components/version-selector";
import { VersionList } from "@/components/version-list";
import { GitHubReleases } from "@/components/github-releases";
import { Button } from '@/components/ui/button';
import { UpgradeCommands } from '@/components/upgrade-commands';
import { Settings } from '@/components/settings';

interface PackageInfo {
  versions: string[];
  error?: string;
  repository?: {
    url: string;
  };
  totalVersions?: number;
}

interface VersionChanges {
  current: string;
  target: string;
  changes: string[];
  error?: string;
}

// 将版本号转换为可比较的数组
const parseVersion = (version: string): number[] => {
  return version.split('.').map(Number);
};

// 比较两个版本号
const compareVersionNumbers = (a: string, b: string): number => {
  const aParts = parseVersion(a);
  const bParts = parseVersion(b);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart !== bPart) {
      return bPart - aPart; // 降序排序
    }
  }
  
  return 0;
};

export default function Home() {
  const [packageName, setPackageName] = useState('');
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [targetVersion, setTargetVersion] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [versionsPerPage] = useState(20);
  const [loadedVersionsCount, setLoadedVersionsCount] = useState(20);
  const [allVersions, setAllVersions] = useState<string[]>([]);

  const fetchPackageInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim()) return;

    setLoading(true);
    setCurrentVersion(null);
    setTargetVersion(null);
    setGithubUrl(null);
    setLoadedVersionsCount(20);
    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      const data = await response.json();
      
      if (data.error) {
        setPackageInfo({ versions: [], error: data.error });
      } else {
        const sortedVersions = Object.keys(data.versions).sort(compareVersionNumbers);
        setAllVersions(sortedVersions);
        const versions = sortedVersions.slice(0, versionsPerPage);
        
        // 提取 GitHub URL
        const repoUrl = data.repository?.url;
        if (repoUrl) {
          // 处理 git+https:// 或 git:// 前缀
          const githubUrl = repoUrl
            .replace(/^git\+https:\/\//, 'https://')
            .replace(/^git:\/\//, 'https://')
            .replace(/\.git$/, '');
          setGithubUrl(githubUrl);
        }

        setPackageInfo({ 
          versions,
          repository: data.repository,
          totalVersions: sortedVersions.length
        });
      }
    } catch (error) {
      setPackageInfo({ versions: [], error: 'Failed to fetch package information' });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVersions = () => {
    if (!packageInfo || !packageInfo.totalVersions) return;
    
    const newCount = loadedVersionsCount + versionsPerPage;
    setLoadedVersionsCount(newCount);
    
    const newVersions = allVersions.slice(0, newCount);
    
    setPackageInfo(prev => ({
      ...prev!,
      versions: newVersions
    }));
  };

  const handleVersionSelect = (version: string, type: 'current' | 'target') => {
    if (type === 'current') {
      setCurrentVersion(version);
    } else {
      setTargetVersion(version);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">NPM Package Version Checker</h1>
          <Settings />
        </div>
        
        <PackageSearch
          packageName={packageName}
          onPackageNameChange={setPackageName}
          onSearch={fetchPackageInfo}
          loading={loading}
        />

        {packageName && <UpgradeCommands packageName={packageName} />}

        {packageInfo && (
          <Card>
            <CardHeader>
              <CardTitle>
                {packageInfo.error ? 'Error' : `Versions of ${packageName}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {packageInfo.error ? (
                <div className="text-destructive">{packageInfo.error}</div>
              ) : (
                <div className="space-y-6">
                  <VersionSelector
                    currentVersion={currentVersion}
                    targetVersion={targetVersion}
                  />
                  
                  {currentVersion && targetVersion && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setShowComparison(true)}
                        className='w-full'
                      >
                        Compare Versions
                      </Button>
                    </div>
                  )}

                  {showComparison && currentVersion && targetVersion && githubUrl && (
                    <GitHubReleases
                      githubUrl={githubUrl}
                      currentVersion={currentVersion}
                      targetVersion={targetVersion}
                    />
                  )}
                  
                  <VersionList
                    versions={packageInfo.versions}
                    currentVersion={currentVersion}
                    targetVersion={targetVersion}
                    onVersionSelect={handleVersionSelect}
                  />

                  {packageInfo.totalVersions && loadedVersionsCount < packageInfo.totalVersions && (
                    <div className="flex justify-center">
                      <Button
                        onClick={loadMoreVersions}
                        variant="outline"
                      >
                        Load More Versions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
