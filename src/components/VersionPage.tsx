import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Film, Clock, GitBranch, Calendar, Code, RefreshCw, ExternalLink, User, AlertCircle, Info } from 'lucide-react';
import { github, GitHubCommit, GitHubRepo } from '../services/github';

const VersionPage: React.FC = () => {
  const [commitInfo, setCommitInfo] = useState<GitHubCommit | null>(null);
  const [repoInfo, setRepoInfo] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Configure your GitHub repository here
  const GITHUB_OWNER = 'Waitlists'; // Replace with your GitHub username
  const GITHUB_REPO = 'lunastream'; // Replace with your repository name
  const GITHUB_BRANCH = 'main'; // Replace with your default branch if different

  // Check if GitHub integration is properly configured
  const isGitHubConfigured = GITHUB_OWNER !== 'your-username' && GITHUB_OWNER.trim() !== '';

  const currentTime = new Date();
  const lastModified = new Date(document.lastModified);
  
  const versionInfo = {
    version: '2.1.0',
    buildDate: lastModified,
    environment: 'production'
  };

  const fetchGitHubData = async () => {
    if (!isGitHubConfigured) {
      setError('GitHub integration not configured. Please update GITHUB_OWNER in the code.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [commit, repo] = await Promise.all([
        github.getLatestCommit(GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH),
        github.getRepoInfo(GITHUB_OWNER, GITHUB_REPO)
      ]);
      
      setCommitInfo(commit);
      setRepoInfo(repo);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch GitHub data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGitHubConfigured) {
      fetchGitHubData();
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LunaStream
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {isGitHubConfigured && (
                <button
                  onClick={fetchGitHubData}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Version Information
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real-time build and deployment information for LunaStream
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last refreshed: {formatDate(lastRefresh)}
          </p>
        </div>

        {/* GitHub Configuration Notice */}
        {!isGitHubConfigured && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-800 font-semibold">GitHub Integration Available</h3>
                <p className="text-blue-600 text-sm mt-1">
                  To enable real-time repository and commit information, update the <code className="bg-blue-100 px-1 rounded">GITHUB_OWNER</code> constant 
                  in the VersionPage component with your actual GitHub username.
                </p>
                <p className="text-blue-500 text-xs mt-2">
                  Current configuration: <code className="bg-blue-100 px-1 rounded">{GITHUB_OWNER}/{GITHUB_REPO}</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && isGitHubConfigured && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-semibold">Failed to fetch GitHub data</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-red-500 text-xs mt-2">
                  Make sure the repository exists and is publicly accessible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Version Info Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="w-7 h-7 mr-3 text-pink-500" />
            Build Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-gray-700"><strong>Version:</strong> {versionInfo.version}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-gray-700"><strong>Environment:</strong> {versionInfo.environment}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-gray-700"><strong>Last Updated:</strong></p>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(lastModified)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-gray-700"><strong>Current Time:</strong></p>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(currentTime)}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-gray-700"><strong>Build Date:</strong></p>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(versionInfo.buildDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repository Info */}
        {repoInfo && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <GitBranch className="w-7 h-7 mr-3 text-indigo-500" />
              Repository Information
            </h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{repoInfo.full_name}</h3>
                  <p className="text-gray-600 mt-1">{repoInfo.description || 'No description available'}</p>
                </div>
                <a
                  href={`https://github.com/${repoInfo.full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View on GitHub</span>
                </a>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Default Branch:</strong> {repoInfo.default_branch}
                </div>
                <div>
                  <strong>Last Push:</strong> {github.getRelativeTime(repoInfo.pushed_at)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Latest Commit Info */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-spin flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600">Fetching latest commit from GitHub...</p>
            </div>
          </div>
        ) : commitInfo ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <GitBranch className="w-7 h-7 mr-3 text-purple-500" />
              Latest Commit
            </h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">#{github.formatCommitHash(commitInfo.sha)}</h3>
                    <p className="text-sm text-gray-500">{GITHUB_BRANCH} branch</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {github.formatCommitDate(commitInfo.commit.author.date)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {github.getRelativeTime(commitInfo.commit.author.date)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-gray-800 font-medium">{commitInfo.commit.message}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>
                    <strong>{commitInfo.commit.author.name}</strong>
                    {commitInfo.author && (
                      <span className="text-gray-500"> (@{commitInfo.author.login})</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    Latest
                  </span>
                  <a
                    href={commitInfo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="text-xs">View</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : isGitHubConfigured ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <GitBranch className="w-7 h-7 mr-3 text-purple-500" />
              Latest Commit
            </h2>
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No commit information available</p>
              <p className="text-sm text-gray-500 mt-2">Check your repository configuration and try refreshing</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <GitBranch className="w-7 h-7 mr-3 text-purple-500" />
              Repository Integration
            </h2>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-gray-600 mb-2">Connect to GitHub for live repository data</p>
              <p className="text-sm text-gray-500">
                Update the GitHub configuration to see commit history, repository stats, and more
              </p>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
            <p className="text-lg opacity-90 mb-2">
              This page shows real-time deployment status and version information for LunaStream.
            </p>
            <p className="text-sm opacity-75">
              {isGitHubConfigured 
                ? "Data is fetched directly from GitHub API and updates automatically."
                : "Configure GitHub integration to see live repository data."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionPage;