import { useDebugStore } from '../../store/useDebugStore';

interface DebugPanelProps {
    showDebug: boolean;
    onClose: () => void;
    isHost: boolean;
    myRoomId: string;
    connectedStaff: number;
    peerStatus: string;
    tableStatesLength: number;
    playerStatesLength: number;
    tableStates: any;
    playerStates: any;
}

export function DebugPanel({ 
    showDebug, onClose, isHost, myRoomId, connectedStaff, peerStatus, 
    tableStatesLength, playerStatesLength, tableStates, playerStates 
}: DebugPanelProps) {
    const logs = useDebugStore(state => state.logs);

    if (!showDebug) return null;

    return (
        <div className="bg-[#111] border border-green-800 rounded-xl p-4 mb-5 shadow-inner font-mono text-[10px] sm:text-xs text-green-400 max-h-[300px] overflow-y-auto">
          <div className="flex justify-between items-center mb-2 border-b border-green-800/50 pb-2">
            <span className="font-bold text-green-300">--- Debug Logs ---</span>
            <button onClick={onClose} className="text-white bg-red-900/50 px-2 py-0.5 rounded hover:bg-red-800">Close</button>
          </div>
          <div><strong>Host Status:</strong> {isHost ? 'True' : 'False'}</div>
          <div><strong>My Peer ID:</strong> {myRoomId || 'None'}</div>
          <div><strong>Connected Peers:</strong> {connectedStaff}</div>
          <div><strong>Connection Status:</strong> {peerStatus}</div>
          <div className="mt-2 border-t border-green-800/50 pt-2">
            <strong>Table States Summary:</strong> {tableStatesLength} custom overrides.
            <pre className="mt-1 opacity-80">{JSON.stringify(tableStates, null, 2)}</pre>
          </div>
          <div className="mt-2 border-t border-green-800/50 pt-2">
            <strong>Player States Summary:</strong> {playerStatesLength} entries.
            <pre className="mt-1 opacity-80">{JSON.stringify(playerStates, null, 2)}</pre>
          </div>
          <div className="mt-2 border-t border-green-800/50 pt-2">
            <strong>Network Action Logs:</strong>
            <ul className="mt-1 list-none p-0">
              {logs.map((log, i) => (
                <li key={i} className="mb-0.5 opacity-80 border-b border-green-800/30 pb-0.5">
                  <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  {log.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
    );
}
