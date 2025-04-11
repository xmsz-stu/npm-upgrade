'use client';

import { useState } from 'react';

interface UpgradeCommandsProps {
  packageName: string;
}

export function UpgradeCommands({ packageName }: UpgradeCommandsProps) {
  const [activeTab, setActiveTab] = useState('pnpm');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'pnpm', label: 'pnpm', command: `pnpm update ${packageName}@latest` },
    { id: 'npm', label: 'npm', command: `npm install ${packageName}@latest` },
    { id: 'yarn', label: 'yarn', command: `yarn upgrade ${packageName}@latest` },
    { id: 'bun', label: 'bun', command: `bun update ${packageName}@latest` },
  ];

  const handleCopy = async (command: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(command);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = command;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Upgrade Commands</h2>
      <div className="relative mt-6 max-h-[650px] overflow-x-auto rounded-xl bg-zinc-950 dark:bg-zinc-900">
        <div dir="ltr" data-orientation="horizontal">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 pt-2.5">
            <div role="tablist" aria-orientation="horizontal" className="inline-flex items-center justify-center rounded-lg text-muted-foreground h-7 translate-y-[2px] gap-3 bg-transparent p-0 pl-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow rounded-none border-b border-transparent bg-transparent p-0 pb-1.5 font-mono text-zinc-400 data-[state=active]:border-b-zinc-50 data-[state=active]:bg-transparent data-[state=active]:text-zinc-50 ${
                    activeTab === tab.id ? 'border-b-zinc-50 text-zinc-50' : ''
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto text-white">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                data-state={activeTab === tab.id ? 'active' : 'inactive'}
                role="tabpanel"
                className={`ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-0 ${
                  activeTab !== tab.id ? 'hidden' : ''
                }`}
              >
                <div className="relative">
                  <pre className="px-4 py-5">
                    <code className="relative font-mono text-sm leading-none" data-language="bash">
                      {tab.command}
                    </code>
                  </pre>
                  <button
                    onClick={() => handleCopy(tab.command)}
                    className="absolute right-4 top-4 rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 transition-colors"
                    title="Copy command"
                  >
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 