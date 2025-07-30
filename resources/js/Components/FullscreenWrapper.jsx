"use client"

import { useState } from "react"
import { Users, Clock, ArrowRight, Shield, Zap, CheckCircle } from "lucide-react"

export default function FullscreenWrapper({ children }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const requestFullscreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
    setIsFullscreen(true)
  }

  if (!isFullscreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\`60\` height=\`60\` viewBox=\`0 0 60 60\` xmlns=\`http://www.w3.org/2000/svg\`%3E%3Cg fill=\`none\` fillRule=\`evenodd\`%3E%3Cg fill=\`%239C92AC\` fillOpacity=\`0.05\`%3E%3Ccircle cx=\`30\` cy=\`30\` r=\`2\`/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
                
                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12 max-w-4xl mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl mb-8 shadow-2xl hidden">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-6 leading-tight">
                            <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2">Queue Management</span>
                        </h1>
                        
                        <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                            Experience the future of queue management with our intelligent system. 
                            Reduce wait times, improve customer satisfaction, and streamline operations.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-4">
                                <Clock className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
                            <p className="text-slate-300 text-sm">Live queue status and estimated wait times</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-4">
                                <Shield className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
                            <p className="text-slate-300 text-sm">Enterprise-grade security uptime</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-4">
                                <Zap className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                            <p className="text-slate-300 text-sm">Instant queue updates and seamless experience</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <button
                            onClick={requestFullscreen}
                            className="group relative inline-flex items-center justify-center px-12 py-4 text-xl font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-600 rounded-2xl shadow-2xl hover:shadow-gray-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <span className="mr-3">Start Queuing System</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                            
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
                        </button>
                        
                        <p className="text-slate-400 text-sm mt-4 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            No installation required • Works on all devices
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto hidden">
                        <div>
                            <div className="text-3xl font-bold text-gray-400 mb-1">99.9%</div>
                            <div className="text-slate-400 text-sm">Uptime</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-400 mb-1">50%</div>
                            <div className="text-slate-400 text-sm">Faster Processing</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-400 mb-1">24/7</div>
                            <div className="text-slate-400 text-sm">Support</div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-2 h-2 bg-gray-400 rounded-full animate-pulse opacity-60"></div>
                <div className="absolute top-40 right-20 w-3 h-3 bg-gray-400 rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
                <div className="absolute bottom-32 left-20 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-50 animation-delay-2000"></div>
                <div className="absolute bottom-20 right-10 w-4 h-4 bg-gray-300 rounded-full animate-pulse opacity-30 animation-delay-3000"></div>
            </div>
    )
  }

  return children
}
