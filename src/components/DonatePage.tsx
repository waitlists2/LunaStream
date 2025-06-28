import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Film, Heart, Copy, Check, Bitcoin, Coins, DollarSign, Shield } from 'lucide-react';

const DonatePage: React.FC = () => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const cryptoAddresses = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      address: 'bc1qu6mr60wy4ldq9ym2zcmc57jaa5zudkgev7h5d3',
      icon: Bitcoin,
      color: 'from-orange-400 to-orange-600'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0xB06d3d3D778cBb57d208890ca8deBE985FD738B1',
      icon: Coins,
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Litecoin',
      symbol: 'LTC',
      address: 'LSQ4Q2wAcpCXYppaDXEU4inavTi5zZdnyS',
      icon: Coins,
      color: 'from-gray-400 to-gray-600'
    },
    {
      name: 'Monero',
      symbol: 'XMR',
      address: '44V5nhNyiywe31r87WBZLP7AiKmW63tf5EwYFpqQ7BRuhts1tMzA8gvFeFEsL3pjGQ9ipnd43YUBQYWPaS7uBihKEr1kCdB',
      icon: Shield,
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      address: '2v3vFWGmR6nvLjzYZz5LGjQr73US1S3obeKkZavJjU2j',
      icon: Coins,
      color: 'from-purple-400 to-purple-600'
    },
    {
      name: 'Polygon',
      symbol: 'MATIC',
      address: '0xB06d3d3D778cBb57d208890ca8deBE985FD738B1',
      icon: Coins,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const copyToClipboard = async (address: string, symbol: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(symbol);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
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
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Support LunaStream
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Help us keep LunaStream free and accessible for everyone. Your donations directly support our mission to provide the best streaming experience.
          </p>
        </div>

        {/* What Donations Do */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <DollarSign className="w-7 h-7 mr-3 text-green-500" />
            How Your Donations Help
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700"><strong>Server Costs:</strong> Maintaining fast, reliable servers for seamless streaming</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700"><strong>Content Updates:</strong> Keeping our movie and TV show database current and comprehensive</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700"><strong>Development:</strong> Adding new features and improving user experience</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700"><strong>Security:</strong> Implementing advanced security measures and privacy protection</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700"><strong>Accessibility:</strong> Ensuring LunaStream remains free for users worldwide</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700"><strong>Innovation:</strong> Researching and implementing cutting-edge streaming technologies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptocurrency Addresses */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200/50 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Bitcoin className="w-7 h-7 mr-3 text-orange-500" />
            Cryptocurrency Donations
          </h2>
          <p className="text-gray-600 mb-8">
            We accept donations in various cryptocurrencies. Click on any address to copy it to your clipboard.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cryptoAddresses.map((crypto) => {
              const IconComponent = crypto.icon;
              return (
                <div
                  key={crypto.symbol}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${crypto.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{crypto.name}</h3>
                        <p className="text-sm text-gray-500">{crypto.symbol}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                      {crypto.address}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(crypto.address, crypto.symbol)}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      copiedAddress === crypto.symbol
                        ? 'bg-green-500 text-white'
                        : `bg-gradient-to-r ${crypto.color} text-white hover:shadow-md`
                    }`}
                  >
                    {copiedAddress === crypto.symbol ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Thank You for Your Support! 💜</h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Every donation, no matter the size, makes a real difference in keeping LunaStream running and improving. 
              We're grateful for your contribution to our community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;