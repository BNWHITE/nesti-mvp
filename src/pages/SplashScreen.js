import { motion } from 'framer-motion';
import './SplashScreen.css';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 bg-gradient-to-br from-green-600 to-green-400 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl"
        >
          <span className="text-white text-4xl font-bold">N</span>
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-green-700 mb-4"
        >
          NESTI
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-green-600 text-lg mb-8"
        >
          Votre réseau familial chaleureux
        </motion.p>
      </motion.div>
    </div>
  );
}
