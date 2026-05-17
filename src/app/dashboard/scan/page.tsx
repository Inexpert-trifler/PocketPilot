"use client";

import { motion } from "framer-motion";
import { Camera, X, Zap, Maximize, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ScanReceiptPage() {
  const [scanning, setScanning] = useState(false);
  
  useEffect(() => {
    // Fake scanning animation sequence
    const timer = setTimeout(() => setScanning(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 w-full p-6 pt-safe flex justify-between items-center z-20">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform">
            <X className="w-6 h-6" />
          </button>
        </Link>
        <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white/80 text-sm font-medium border border-white/10 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" /> AI Auto-Detect
        </div>
      </div>

      {/* Viewfinder UI */}
      <div className="relative w-full max-w-sm aspect-[3/4] rounded-[3rem] border-2 border-white/20 overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col items-center justify-center">
        {/* Fake Camera Feed Background */}
        <div className="absolute inset-0 bg-[#121217] flex items-center justify-center opacity-80">
          <FileText className="w-24 h-24 text-white/10" />
        </div>
        
        {/* Viewfinder Corners */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-purple-500 rounded-tl-2xl" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-purple-500 rounded-tr-2xl" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-purple-500 rounded-bl-2xl" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-purple-500 rounded-br-2xl" />

        {/* Scanning Animation line */}
        <motion.div 
          animate={{ y: ["-150%", "150%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_#8b5cf6]"
        />

        {scanning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 bg-emerald-500/90 text-white px-4 py-2 rounded-full font-medium flex items-center shadow-lg"
          >
            Receipt Detected!
          </motion.div>
        )}
      </div>

      <p className="text-white/50 text-center mt-8 font-medium">Position receipt inside the frame</p>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 w-full p-8 pb-safe flex justify-around items-center bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
        <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
          <Upload className="w-5 h-5" />
        </button>
        
        <button className="w-20 h-20 rounded-full border-[6px] border-purple-500/30 flex items-center justify-center active:scale-95 transition-transform">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-black" />
          </div>
        </button>

        <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
