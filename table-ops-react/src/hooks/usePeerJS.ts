import { useRef, useState } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import { useTableStore } from '../store/useTableStore';
import { useDebugStore } from '../store/useDebugStore';
import type { PeerAction } from '../types';

export function usePeerJS() {
    const { 
        setTournament, setTableStates, setPlayerStates, 
        updateTableState, updatePlayerState 
    } = useTableStore();
    const addLog = useDebugStore(state => state.addLog);
    
    const [isHost, setIsHost] = useState(true);
    const [myRoomId, setMyRoomId] = useState('');
    const [peerStatus, setPeerStatus] = useState<'initializing' | 'connecting' | 'online' | 'error'>('initializing');
    const [connectedStaff, setConnectedStaff] = useState(0);
    const [timeOffset, setTimeOffset] = useState(0);

    const peerRef = useRef<Peer | null>(null);
    const connectionsRef = useRef<DataConnection[]>([]);
    const hostConnRef = useRef<DataConnection | null>(null);

    const initP2P = (targetRoom?: string, customPin?: string) => {
        if (peerRef.current) {
            peerRef.current.destroy();
        }

        if (targetRoom) {
            // Client Mode
            setIsHost(false);
            const id = 'PKM-JUDGE-' + Math.random().toString(36).substring(2, 7);
            setMyRoomId(id);
            setPeerStatus('connecting');

            const peer = new Peer(id, {
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
                        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
                    ]
                }
            });

            peer.on('open', () => {
                const cleanTarget = normalizeRoomId(targetRoom);
                const conn = peer.connect(cleanTarget);
                setupClientConnection(conn);
            });

            peer.on('error', () => {
                setPeerStatus('error');
            });

            peerRef.current = peer;
        } else {
            // Host Mode
            setIsHost(true);
            let pin = customPin || localStorage.getItem('pkm_table_ops_pin');
            if (!pin) {
                pin = 'PKM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
                localStorage.setItem('pkm_table_ops_pin', pin);
            }
            
            const id = normalizeRoomId(pin);
            setMyRoomId(id);

            const peer = new Peer(id, {
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
                        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
                    ]
                }
            });

            peer.on('open', () => {
                setPeerStatus('online');
                addLog(`[HOST] Room open: ${id}`);
            });

            peer.on('connection', (conn) => {
                connectionsRef.current.push(conn);
                setConnectedStaff(connectionsRef.current.length);
                addLog(`[HOST] New connection from ${conn.peer}`);

                const sendSync = () => {
                    const currentState = useTableStore.getState();
                    if (currentState.tournament) {
                        conn.send({
                            type: 'SYNC_BOARD',
                            tournament: currentState.tournament,
                            tableStates: currentState.tableStates,
                            playerStates: currentState.playerStates,
                            hostTime: Date.now()
                        } as PeerAction);
                    }
                };

                if (conn.open) {
                    sendSync();
                } else {
                    conn.on('open', sendSync);
                }

                conn.on('close', () => {
                    connectionsRef.current = connectionsRef.current.filter(p => p !== conn);
                    setConnectedStaff(connectionsRef.current.length);
                    addLog(`[HOST] Connection closed: ${conn.peer}`);
                });

                conn.on('error', (err) => {
                    connectionsRef.current = connectionsRef.current.filter(p => p !== conn);
                    setConnectedStaff(connectionsRef.current.length);
                    addLog(`[HOST] Connection error: ${err.message}`);
                });

                conn.on('data', (data: unknown) => {
                    const action = data as PeerAction;
                    addLog(`[HOST] Received from client: ${action.type}`);
                    handleIncomingAction(action, conn);
                });
            });

            peer.on('error', (err) => {
                if (err.type === 'unavailable-id') {
                    const altPin = pin + '-' + Math.floor(Math.random() * 90 + 10);
                    initP2P(undefined, altPin);
                } else {
                    addLog(`[HOST] Peer error: ${err.message}`);
                    setPeerStatus('error');
                }
            });

            peerRef.current = peer;
        }
    };

    const setupClientConnection = (conn: DataConnection) => {
        conn.on('open', () => {
            setPeerStatus('online');
            addLog(`[CLIENT] Connected to Host`);
        });
        
        conn.on('data', (data: unknown) => {
            const action = data as PeerAction;
            addLog(`[CLIENT] Received from host: ${action.type}`);
            handleIncomingAction(action);
        });

        conn.on('close', () => {
            setPeerStatus('error');
            addLog(`[CLIENT] Connection closed`);
        });
        
        conn.on('error', (err) => {
            setPeerStatus('error');
            addLog(`[CLIENT] Connection error: ${err.message}`);
        });
        
        hostConnRef.current = conn;
    };

    const handleIncomingAction = (data: PeerAction, sourceConn?: DataConnection) => {
        if (data.type === 'SYNC_BOARD') {
            setTournament(data.tournament);
            setTableStates(data.tableStates);
            setPlayerStates(data.playerStates);
            if (data.hostTime && !isHost) {
                setTimeOffset(Date.now() - data.hostTime);
            }
        } else if (data.type === 'UPDATE_TABLE_STATE') {
            updateTableState(data.key, data.state);
            if (isHost && sourceConn) {
                // Relay
                connectionsRef.current.forEach(p => {
                    if (p !== sourceConn && p.open) p.send(data);
                });
            }
        } else if (data.type === 'UPDATE_PLAYER_STATE') {
            updatePlayerState(data.key, data.state);
            if (isHost && sourceConn) {
                // Relay
                connectionsRef.current.forEach(p => {
                    if (p !== sourceConn && p.open) p.send(data);
                });
            }
        } else if (data.type === 'TRANSLATION_REQUEST') {
            const currentState = useTableStore.getState().tableStates[data.key] || { status: 'default', timestamp: Date.now() };
            updateTableState(data.key, { ...currentState, translationRequired: data.language });
            
            // Dispatch custom event for UI to pick up
            window.dispatchEvent(new CustomEvent('p2p_translation', { detail: data }));
            if (isHost && sourceConn) {
                // Relay
                connectionsRef.current.forEach(p => {
                    if (p !== sourceConn && p.open) p.send(data);
                });
            }
        } else if (data.type === 'TRANSLATION_ACCEPTED') {
            const currentState = useTableStore.getState().tableStates[data.key];
            if (currentState) {
                updateTableState(data.key, { ...currentState, translationRequired: undefined });
            }

            // Dispatch custom event for UI to pick up
            window.dispatchEvent(new CustomEvent('p2p_translation', { detail: data }));
            if (isHost && sourceConn) {
                // Relay
                connectionsRef.current.forEach(p => {
                    if (p !== sourceConn && p.open) p.send(data);
                });
            }
        }
    };

    const broadcastAction = (action: PeerAction) => {
        if (isHost) {
            connectionsRef.current.forEach(conn => {
                if (conn.open) conn.send(action);
            });
        } else if (hostConnRef.current && hostConnRef.current.open) {
            hostConnRef.current.send(action);
        }
    };

    const normalizeRoomId = (pin: string) => {
        const cleaned = (pin || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
        return cleaned.startsWith('PKM-') ? cleaned : `PKM-${cleaned}`;
    };

    const destroyPeer = () => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
    };

    return {
        isHost,
        myRoomId,
        peerStatus,
        connectedStaff,
        timeOffset,
        initP2P,
        broadcastAction,
        destroyPeer
    };
}
