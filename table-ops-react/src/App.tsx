import { useEffect, useState, useRef } from 'react';
import { useTableStore } from './store/useTableStore';
import { usePeerJS } from './hooks/usePeerJS';
import { parsePairingsData, parseTomData } from './utils/parsers';

// Layout
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { FilterBar } from './components/layout/FilterBar';
import { StatsPanel } from './components/layout/StatsPanel';
import { DebugPanel } from './components/layout/DebugPanel';

// Modals
import { PasteHtmlModal } from './components/modals/PasteHtmlModal';
import { JoinSessionModal } from './components/modals/JoinSessionModal';
import { QrCodeModal } from './components/modals/QrCodeModal';
import { DeckCheckModal } from './components/modals/DeckCheckModal';
import { TranslationModal } from './components/modals/TranslationModal';
import { TomOptionsModal } from './components/modals/TomOptionsModal';

// Tables
import { TableGrid } from './components/tables/TableGrid';

export default function App() {
  const { tournament, tableStates, playerStates, setTournament, clearSession } = useTableStore();
  const { isHost, myRoomId, peerStatus, connectedStaff, timeOffset, initP2P, broadcastAction } = usePeerJS();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteHtml, setPasteHtml] = useState('');
  
  const [showQrModal, setShowQrModal] = useState(false);
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinPin, setJoinPin] = useState('');

  const [dcModalOpen, setDcModalOpen] = useState(false);
  const [dcTableInfo, setDcTableInfo] = useState<{num: number, p1: string, p2: string} | null>(null);

  const [transModalOpen, setTransModalOpen] = useState(false);
  const [transTableInfo, setTransTableInfo] = useState<{num: number, key: string} | null>(null);

  const [showTomOptions, setShowTomOptions] = useState(false);
  const [tomIntervalMs, setTomIntervalMs] = useState(45000);
  const tomFileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const tomTimerRef = useRef<number | null>(null);

  const [showDebug, setShowDebug] = useState(false);
  const [hapticEnabled] = useState(false);
  
  const [toast, setToast] = useState<{message: string, id: number} | null>(null);

  useEffect(() => {
    const handleTranslation = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const data = customEvent.detail;
      const { myProfile } = useTableStore.getState();
      
      if (data.type === 'TRANSLATION_REQUEST') {
          // If judge hasn't selected languages, or they selected this language
          if (myProfile.languages.length === 0 || myProfile.languages.includes(data.language)) {
              setToast({ message: `Translation requested: Table ${data.tableNum} (${data.language})`, id: Date.now() });
              if (hapticEnabled && window.navigator && window.navigator.vibrate) {
                  try { window.navigator.vibrate([100, 50, 100]); } catch (err) { }
              }
              if (Notification.permission === 'granted') {
                  const notifOptions = {
                      body: `Table ${data.tableNum} needs a ${data.language} translator.`,
                      vibrate: [300, 100, 300, 100, 300] // Vibration pattern (3 pulses)
                  };
                  try {
                      new Notification(`Translation Needed: ${data.language}`, notifOptions);
                  } catch (e) {
                      navigator.serviceWorker.ready.then(registration => {
                          registration.showNotification(`Translation Needed: ${data.language}`, notifOptions);
                      });
                  }
              }
          }
      }
    };

    const handleTranslationAccept = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const { key } = customEvent.detail;
      const { myProfile, tableStates, updateTableState } = useTableStore.getState();
      
      // Update locally
      const currentState = tableStates[key];
      if (currentState) {
          updateTableState(key, { ...currentState, translationRequired: undefined });
      }

      broadcastAction({
        type: 'TRANSLATION_ACCEPTED',
        key,
        acceptor: myProfile.name || 'A judge'
      });
    };
    
    window.addEventListener('p2p_translation', handleTranslation);
    window.addEventListener('p2p_translation_accept', handleTranslationAccept);
    return () => {
      window.removeEventListener('p2p_translation', handleTranslation);
      window.removeEventListener('p2p_translation_accept', handleTranslationAccept);
    };
  }, [hapticEnabled, broadcastAction]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Stats calculation
  let totalCount = 0;
  let playingCount = 0;
  let judgeCount = 0;
  let emptyCount = 0;
  let ghostCount = 0;
  let completeCount = 0;
  let translationCount = 0;

  if (tournament && tournament.activeDivisionId && tournament.divisions[tournament.activeDivisionId]) {
    const activeDiv = tournament.divisions[tournament.activeDivisionId];
    totalCount = activeDiv.tables.length;
    activeDiv.tables.forEach(t => {
      const key = `${tournament.activeDivisionId}_R${activeDiv.round}_${t.num}`;
      const state = tableStates[key];
      const status = state?.status || (t.isOfficialDone ? 'complete' : 'playing');

      if (status === 'complete') completeCount++;
      else if (status === 'playing') playingCount++;
      else if (status === 'judge') judgeCount++;
      else if (status === 'empty') emptyCount++;
      else if (status === 'ghost') ghostCount++;
        
      if (state && state.translationRequired) translationCount++;
    });
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    if (room) {
        initP2P(room);
    } else {
        initP2P();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getShareUrl = () => {
    const base = window.location.href.split('?')[0];
    return `${base}?room=${myRoomId}`;
  };

  const handlePasteSubmit = () => {
    try {
      const result = parsePairingsData(pasteHtml, tournament);
      setTournament(result.tournament);
      setShowPasteModal(false);
      
      if (isHost) {
        broadcastAction({
          type: 'SYNC_BOARD',
          tournament: result.tournament,
          tableStates: useTableStore.getState().tableStates,
          playerStates: useTableStore.getState().playerStates,
          hostTime: Date.now()
        });
      }
    } catch (e) {
      alert('Error parsing HTML. Please ensure you copied the full source of the RK9 pairings page.');
    }
  };

  const forceTomSync = async (handle: FileSystemFileHandle) => {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      const result = parseTomData(text, useTableStore.getState().tournament);
      setTournament(result.tournament);

      if (isHost) {
        broadcastAction({
          type: 'SYNC_BOARD',
          tournament: result.tournament,
          tableStates: useTableStore.getState().tableStates,
          playerStates: useTableStore.getState().playerStates,
          hostTime: Date.now()
        });
      }
    } catch (e) {
      console.error("Background TOM sync error:", e);
    }
  };

  const startTomSync = async () => {
    try {
      if (!window.showOpenFilePicker) {
          alert("Your browser does not support the File System Access API. Please use Google Chrome or Microsoft Edge.");
          return;
      }
      const [fileHandle] = await window.showOpenFilePicker({
          types: [{
              description: 'TOM Data File',
              accept: { 'text/xml': ['.tdf'] }
          }],
          excludeAcceptAllOption: true,
          multiple: false
      });
      
      tomFileHandleRef.current = fileHandle;
      await forceTomSync(fileHandle);
      
      if (tomTimerRef.current) clearInterval(tomTimerRef.current);
      tomTimerRef.current = window.setInterval(() => forceTomSync(fileHandle), tomIntervalMs);
      
      alert(`TOM Auto-Sync activated! Polling every ${tomIntervalMs/1000} seconds.`);

    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error("Error reading TOM file:", e);
        alert("Error loading TOM file.");
      }
    }
  };

  useEffect(() => {
    if (tomFileHandleRef.current) {
        if (tomTimerRef.current) clearInterval(tomTimerRef.current);
        tomTimerRef.current = window.setInterval(() => {
            if (tomFileHandleRef.current) forceTomSync(tomFileHandleRef.current);
        }, tomIntervalMs);
    }
  }, [tomIntervalMs]);

  const handleJoinSubmit = () => {
    if (!joinPin.trim()) return;
    window.location.href = `?room=${joinPin.trim().toUpperCase()}`;
  };

  const getBookmarkletCode = () => {
    const targetUrl = window.location.href.split('#')[0];
    return `javascript:(function(){if(!window.location.href.includes('rk9.gg/pairings')){alert('Please run this on an RK9 pairings page.');return;}let t=document.querySelector('h4')?.textContent.trim()||'Tournament Pairings';let ds=document.querySelector('h5')?.textContent.split('\\n')[0].trim()||'';let divs={};document.querySelectorAll('ul.nav-pills li.nav-item a.nav-link').forEach(l=>{let tId=(l.getAttribute('href')||'').replace('#','');let rName=l.textContent.trim();let dName=rName;let rNum=1;let m=rName.match(/^(.*?)\\s+in\\s+Round\\s+(\\d+)/i);if(m){dName=m[1].trim();rNum=parseInt(m[2],10);}let dp=document.getElementById(tId);let tbls=[];if(dp){let ar=dp.querySelector('.current-tables.active, .current-tables.show')||dp.querySelector('.current-tables');if(ar){ar.querySelectorAll('.row.match.no-gutter').forEach((r,i)=>{if(i===0)return;let isC=r.classList.contains('complete');let p1E=r.querySelector('.player1 .name');let p2E=r.querySelector('.player2 .name');let tE=r.querySelector('.tablenumber');let p1=p1E?p1E.textContent.trim():"Player 1";let p2=p2E?p2E.textContent.trim():"Player 2";let num=tE?parseInt(tE.textContent.trim(),10)||i:i;tbls.push({num:num,p1:p1,p2:p2,isOfficialDone:isC});});}}divs[tId]={name:dName,round:rNum,rawLabel:rName,tables:tbls};});let p=encodeURIComponent(JSON.stringify({title:t,dateStr:ds,divisions:divs}));let w=window.open('${targetUrl}#data='+p,'TableOpsWindow');if(!w)alert('Popup blocked!');})();`;
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to completely delete all data, end the P2P session, and kick all staff? This cannot be undone.")) {
        if (tomTimerRef.current) clearInterval(tomTimerRef.current);
        clearSession();
        window.location.href = window.location.href.split('?')[0]; // Remove room from URL
    }
  };

  return (
    <div className="min-h-screen bg-[#111116] text-white p-5 md:p-10 pb-24 font-nunito flex flex-col">
      <div className="flex-1 w-full max-w-[1600px] mx-auto">
        <Header onShowQrModal={() => setShowQrModal(true)} />

        {!tournament?.title ? (
          <div className="bg-surf border border-bord rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px] shadow-xl">
            <h2 className="font-bebas text-4xl text-acc2 mb-4 tracking-wide text-center">No Tournament Data Loaded</h2>
            <p className="text-muted text-center max-w-lg mb-8 text-lg">Load your pairings data to start the session. You can copy the sync script below to your bookmarks bar and run it on the RK9 pairings page, or paste the raw HTML.</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl border border-purple-400 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:-translate-y-1"
                onClick={() => setShowPasteModal(true)}
              >
                📋 Paste RK9 HTML
              </button>
              <button 
                className="bg-surf3 hover:bg-bord-light text-white font-bold py-3 px-6 rounded-xl border border-bord-light transition-all shadow-md hover:-translate-y-1"
                onClick={() => {
                  navigator.clipboard.writeText(getBookmarkletCode());
                  alert("Sync Script copied to clipboard! Create a new bookmark in your browser, and paste the code into the URL field.");
                }}
              >
                📋 Copy Sync Script
              </button>
              <button 
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl border border-amber-500 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:-translate-y-1"
                onClick={startTomSync}
              >
                📁 TOM Sync (.tdf)
              </button>
              <button 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl border border-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-1"
                onClick={() => setShowJoinModal(true)}
              >
                🔑 Join as Judge
              </button>
            </div>
          </div>
        ) : (
          <>
            <Toolbar 
              onCopySyncScript={() => {
                  navigator.clipboard.writeText(getBookmarkletCode());
                  alert("Sync Script copied to clipboard! Create a new bookmark in your browser, and paste the code into the URL field.");
              }}
              onShowPasteModal={() => setShowPasteModal(true)}
              onTomSync={startTomSync}
              onShowTomOptions={() => setShowTomOptions(true)}
              onShowJoinModal={() => setShowJoinModal(true)}
              onToggleDebug={() => setShowDebug(d => !d)}
              onEndSession={handleEndSession}
            />

            <DebugPanel 
              showDebug={showDebug} 
              onClose={() => setShowDebug(false)} 
              isHost={isHost} 
              myRoomId={myRoomId} 
              connectedStaff={connectedStaff} 
              peerStatus={peerStatus} 
              tableStatesLength={Object.keys(tableStates).length} 
              playerStatesLength={Object.keys(playerStates).length}
              tableStates={tableStates}
              playerStates={playerStates}
            />

            <FilterBar 
              tournament={tournament}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onDivisionChange={dId => setTournament({ ...tournament, activeDivisionId: dId })}
            />

            <div className="mb-5">
              <StatsPanel 
                totalCount={totalCount}
                playingCount={playingCount}
                judgeCount={judgeCount}
                translationCount={translationCount}
                ghostCount={ghostCount}
                emptyCount={emptyCount}
                completeCount={completeCount}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            <TableGrid 
              activeFilter={activeFilter}
              searchQuery={searchQuery}
              broadcastAction={broadcastAction}
              timeOffset={timeOffset}
              onDeckCheck={(num, p1, p2) => {
                if (hapticEnabled && window.navigator && window.navigator.vibrate) {
                  try { window.navigator.vibrate(50); } catch (e) { }
                }
                setDcTableInfo({ num, p1, p2 });
                setDcModalOpen(true);
              }}
              onRequestTranslation={(num) => {
                const key = `${tournament?.activeDivisionId}_R${tournament?.divisions?.[tournament.activeDivisionId || '']?.round}_${num}`;
                setTransTableInfo({ num, key });
                setTransModalOpen(true);
              }}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <PasteHtmlModal 
        isOpen={showPasteModal} 
        onClose={() => setShowPasteModal(false)} 
        pasteHtml={pasteHtml} 
        setPasteHtml={setPasteHtml} 
        handlePasteSubmit={handlePasteSubmit} 
      />
      
      <QrCodeModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
        myRoomId={myRoomId} 
        getShareUrl={getShareUrl} 
      />
      
      <JoinSessionModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
        joinPin={joinPin} 
        setJoinPin={setJoinPin} 
        handleJoinSubmit={handleJoinSubmit} 
      />
      
      <DeckCheckModal 
        isOpen={dcModalOpen} 
        onClose={() => setDcModalOpen(false)} 
        tableInfo={dcTableInfo} 
        isHost={isHost} 
        broadcastAction={broadcastAction} 
      />
      
      <TranslationModal 
        isOpen={transModalOpen} 
        onClose={() => setTransModalOpen(false)} 
        tableInfo={transTableInfo} 
        broadcastAction={broadcastAction} 
        myRoomId={myRoomId} 
      />

      <TomOptionsModal
        isOpen={showTomOptions}
        onClose={() => setShowTomOptions(false)}
        intervalMs={tomIntervalMs}
        setIntervalMs={setTomIntervalMs}
      />

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg font-bold z-[1000] animate-bounce">
          {toast.message}
        </div>
      )}
    </div>
  );
}
