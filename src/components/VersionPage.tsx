import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Film, Clock, GitBranch, Calendar, Code } from 'lucide-react';

const VersionPage: React.FC = () => {
  // Get the current timestamp when the page loads
  const currentTime = new Date();
  const lastModified = new Date(document.lastModified);
  
  // Format dates nicely
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

  // Mock commit data - in a real app this would come from your build process
  const commitInfo = {
    hash: 'a7f3d2e',
    message: 'Enhanced search with wildcard patterns and mobile player fixes',
    author: 'LunaStream Dev',
    date: lastModified,
    branch: 'main'
  };

  const versionInfo = {
    version: '2.1.0',
    buildDate: lastModified,
    environment: 'production'
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
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
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
            Current build and deployment information for LunaStream
          </p>
        </div>

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

        {/* Git Commit Info */}
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
                  <h3 className="font-semibold text-gray-900">#{commitInfo.hash}</h3>
                  <p className="text-sm text-gray-500">{commitInfo.branch} branch</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(commitInfo.date)}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-gray-800 font-medium">{commitInfo.message}</p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Author: <strong>{commitInfo.author}</strong></span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                Latest
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
            <p className="text-lg opacity-90">
              This page shows the current deployment status and version information for LunaStream.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionPage;