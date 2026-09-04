import { useState } from 'react';
import { useTableStore } from '../../store/useTableStore';

interface JoinSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    joinPin: string;
    setJoinPin: (pin: string) => void;
    handleJoinSubmit: () => void;
}

export function JoinSessionModal({ isOpen, onClose, joinPin, setJoinPin, handleJoinSubmit }: JoinSessionModalProps) {
    const { myProfile, setMyProfile } = useTableStore();
    const [selectedLangs, setSelectedLangs] = useState<string[]>(myProfile.languages.length > 0 ? myProfile.languages : ['EN']);
    const [name, setName] = useState(myProfile.name);

    const availableLangs = ['IT', 'ES', 'FR', 'DE', 'PT', 'JP', 'KO', 'ZH', 'EN'];

    if (!isOpen) return null;

    const toggleLang = (lang: string) => {
        if (selectedLangs.includes(lang)) {
            setSelectedLangs(selectedLangs.filter(l => l !== lang));
        } else {
            setSelectedLangs([...selectedLangs, lang]);
        }
    };

    const onSubmit = () => {
        setMyProfile({ name, languages: selectedLangs });
        
        // Request Notification permission
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        handleJoinSubmit();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-5 overflow-y-auto" onClick={onClose}>
          <div className="bg-surf border border-bord-light rounded-2xl p-7 w-full max-w-[420px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] my-8" onClick={e => e.stopPropagation()}>
            <h2 className="font-bebas text-3xl text-acc2 mb-2">Join Session</h2>
            <p className="text-muted text-sm mb-6">Enter the 5-character session PIN to connect as a judge.</p>
            
            <div className="mb-4">
              <label className="block text-xs text-muted font-bold uppercase mb-2">Session PIN</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 bg-surf2 border border-bord rounded-lg text-white font-mono text-xl mb-4 outline-none uppercase focus:border-acc2 text-center tracking-widest"
                value={joinPin}
                onChange={e => setJoinPin(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-muted font-bold uppercase mb-2">Judge Name</label>
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-surf2 border border-bord rounded-lg text-white font-nunito outline-none focus:border-indigo-400"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs text-muted font-bold uppercase mb-2">Translation Languages</label>
              <div className="flex flex-wrap gap-2">
                {availableLangs.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleLang(lang)}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold border transition-colors ${selectedLangs.includes(lang) ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'bg-surf3 border-bord text-muted hover:border-muted'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-emerald-600 border border-emerald-500 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors" onClick={onSubmit}>Connect</button>
              <button className="flex-1 bg-surf3 border border-bord-light text-white py-3 rounded-lg font-bold text-sm hover:bg-bord-light transition-colors" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
    );
}
