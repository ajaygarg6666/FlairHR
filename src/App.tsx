import Sidebar from './components/sidebar/Sidebar';
import Canvas from './components/canvas/Canvas';
import NodeFormManager from './components/forms/NodeFormManager';
import SandboxPanel from './components/sandbox/SandboxPanel';
import { ReactFlowProvider } from 'reactflow';
import { motion } from 'framer-motion';

function App() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-screen overflow-hidden bg-[#f8f9ff] font-inter antialiased text-slate-900"
    >
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
          <NodeFormManager />
        </div>
        <SandboxPanel />
      </div>
    </motion.div>
  );
}

export default App;
