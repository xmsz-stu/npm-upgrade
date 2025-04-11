'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import 'github-markdown-css/github-markdown.css';
import OpenAI from 'openai';
import { useTranslation } from "@/context/translation-context";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_ARK_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  dangerouslyAllowBrowser: true
});

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  translatedBody?: string;
  isTranslating?: boolean;
  showTranslation?: boolean;
}

interface AnalysisResult {
  summary: string;
  recommendation: string;
  developerNotes: string;
  translatedSummary?: string;
  translatedRecommendation?: string;
  translatedDeveloperNotes?: string;
  isTranslating?: boolean;
  showTranslation?: boolean;
}

interface GitHubReleasesProps {
  githubUrl: string;
  currentVersion: string;
  targetVersion: string;
}

export function GitHubReleases({ githubUrl, currentVersion, targetVersion }: GitHubReleasesProps) {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { autoTranslate } = useTranslation();

  const translateContent = async (content: string): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional translator. Translate the following release notes from English to Chinese, excluding any sections that start with "## Packages". Keep the markdown formatting intact.' 
          },
          { role: 'user', content },
        ],
        model: process.env.NEXT_PUBLIC_ARK_MODEL_ID || '',
      });
      return completion.choices[0]?.message?.content || content;
    } catch (error) {
      console.error('Translation error:', error);
      return content;
    }
  };

  const handleTranslate = async (release: GitHubRelease) => {
    if (release.translatedBody || release.isTranslating) return;

    const updatedReleases = releases.map(r => 
      r.tag_name === release.tag_name ? { ...r, isTranslating: true } : r
    );
    setReleases(updatedReleases);

    try {
      const translatedBody = await translateContent(release.body);
      const finalReleases = releases.map(r =>
        r.tag_name === release.tag_name 
          ? { ...r, translatedBody, isTranslating: false, showTranslation: true }
          : r
      );
      setReleases(finalReleases);
    } catch (error) {
      console.error('Translation error:', error);
      const errorReleases = releases.map(r =>
        r.tag_name === release.tag_name 
          ? { ...r, isTranslating: false }
          : r
      );
      setReleases(errorReleases);
    }
  };

  const toggleTranslation = (release: GitHubRelease) => {
    const updatedReleases = releases.map(r =>
      r.tag_name === release.tag_name
        ? { ...r, showTranslation: !r.showTranslation }
        : r
    );
    setReleases(updatedReleases);
  };

  const analyzeReleases = async (releases: GitHubRelease[]) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `You are a professional software engineer and technical writer. Analyze the following release notes and provide:
            1. A concise summary of major changes between versions
            2. A recommendation on whether to upgrade (considering breaking changes, security updates, and feature improvements)
            3. Important notes for developers (breaking changes, deprecations, or other technical considerations)
            
            Format your response as a JSON object with these keys: summary, recommendation, developerNotes. 
            Each value should be a string, not an object or array.
            Do not include any markdown formatting or code block markers.` 
          },
          { role: 'user', content: releases.map(r => r.body).join('\n\n') },
        ],
        model: process.env.NEXT_PUBLIC_ARK_MODEL_ID || '',
      });

      const response = completion.choices[0]?.message?.content || '{}';
      // 移除可能的 markdown 代码块标记
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanResponse);
      
      // 确保所有值都是字符串
      return {
        summary: String(analysis.summary || ''),
        recommendation: String(analysis.recommendation || ''),
        developerNotes: String(analysis.developerNotes || '')
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        summary: 'Analysis failed, please try again later',
        recommendation: 'Unable to provide upgrade recommendation',
        developerNotes: 'Unable to get developer notes'
      };
    }
  };

  const translateAnalysis = async (content: string): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional translator. Translate the following text from English to Chinese, keeping the technical terms intact.' 
          },
          { role: 'user', content },
        ],
        model: process.env.NEXT_PUBLIC_ARK_MODEL_ID || '',
      });
      return completion.choices[0]?.message?.content || content;
    } catch (error) {
      console.error('Translation error:', error);
      return content;
    }
  };

  const handleTranslateAnalysis = async () => {
    if (!analysis || analysis.isTranslating) return;

    setAnalysis({ ...analysis, isTranslating: true });

    try {
      const [translatedSummary, translatedRecommendation, translatedDeveloperNotes] = await Promise.all([
        translateAnalysis(analysis.summary),
        translateAnalysis(analysis.recommendation),
        translateAnalysis(analysis.developerNotes)
      ]);

      setAnalysis({
        ...analysis,
        translatedSummary,
        translatedRecommendation,
        translatedDeveloperNotes,
        isTranslating: false,
        showTranslation: true
      });
    } catch (error) {
      console.error('Translation error:', error);
      setAnalysis({ ...analysis, isTranslating: false });
    }
  };

  const toggleAnalysisTranslation = () => {
    if (!analysis) return;
    setAnalysis({ ...analysis, showTranslation: !analysis.showTranslation });
  };

  const handleAnalyze = async () => {
    if (relevantReleases.length === 0) return;

    setIsAnalyzing(true);

    try {
      const result = await analyzeReleases(relevantReleases);
      if (result) {
        setAnalysis({
          ...result,
          isTranslating: false,
          showTranslation: false
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const fetchReleases = async () => {
      if (!githubUrl) {
        setError('No GitHub repository found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [owner, repo] = githubUrl.split('/').slice(-2);
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`);
 
        if (!response.ok) {
          throw new Error('Failed to fetch releases');
        }

        const data = await response.json();
        setReleases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch releases');
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [githubUrl]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const relevantReleases = releases.filter(release => {
    const version = release.tag_name.replace('v', '');
    return compareVersions(version, currentVersion) > 0 && 
           compareVersions(version, targetVersion) <= 0;
  });

  if (relevantReleases.length === 0) {
    return (
      <Alert>
        <AlertDescription>No release notes found for the selected versions.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Updates'}
        </Button>
      </div>

      {analysis && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Version Update Analysis</h2>
            <div className="flex gap-2">
              {!analysis.translatedSummary && !analysis.isTranslating && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTranslateAnalysis}
                >
                  Translate
                </Button>
              )}
              {analysis.translatedSummary && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleAnalysisTranslation}
                >
                  {analysis.showTranslation ? 'Show Original' : 'Show Translation'}
                </Button>
              )}
              {analysis.isTranslating && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                >
                  Translating...
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Update Summary</h3>
              <p className="text-sm">
                {analysis.showTranslation ? analysis.translatedSummary : analysis.summary}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Upgrade Recommendation</h3>
              <p className="text-sm">
                {analysis.showTranslation ? analysis.translatedRecommendation : analysis.recommendation}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Developer Notes</h3>
              <p className="text-sm">
                {analysis.showTranslation ? analysis.translatedDeveloperNotes : analysis.developerNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {relevantReleases.map((release, index) => (
        <div key={release.tag_name} className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {release.name || release.tag_name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Released on {new Date(release.published_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!release.translatedBody && !release.isTranslating && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTranslate(release)}
                  >
                    Translate
                  </Button>
                )}
                {release.translatedBody && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleTranslation(release)}
                  >
                    {release.showTranslation ? 'Show Original' : 'Show Translation'}
                  </Button>
                )}
                {release.isTranslating && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                  >
                    Translating...
                  </Button>
                )}
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs ">
              {release.showTranslation ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="markdown-body">
                    <h3 className="text-xs font-medium mb-2">原文</h3>
                    {release.body.split('\n').map((line, i) => (
                      <p key={i} className="whitespace-pre-wrap">{line}</p>
                    ))}
                  </div>
                  <div className="markdown-body">
                    <h3 className="text-xs font-medium mb-2">翻译</h3>
                    {release.translatedBody?.split('\n').map((line, i) => (
                      <p key={i} className="whitespace-pre-wrap">{line}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="markdown-body">
                  {release.body.split('\n').map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap">{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 比较版本号的辅助函数
function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }
  
  return 0;
}

function TranslatedText({ text, translate }: { text: string; translate: (text: string) => Promise<string> }) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doTranslation = async () => {
      const result = await translate(text);
      setTranslated(result);
      setLoading(false);
    };
    doTranslation();
  }, [text, translate]);

  if (loading) {
    return <div>Translating...</div>;
  }

  return <div>{translated}</div>;
} 