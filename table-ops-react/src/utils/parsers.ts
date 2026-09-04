import type { TournamentData, Division, Table } from '../types';

export function parsePairingsData(html: string, currentTournament: TournamentData | null): { tournament: TournamentData, hasNewRound: boolean } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const h4Title = doc.querySelector('h4.mb-0') || doc.querySelector('h4');
    const title = h4Title ? h4Title.textContent?.trim() || '' : (currentTournament?.title || 'Tournament Pairings');

    const dateH5 = doc.querySelector('h5.my-0');
    const dateStr = dateH5 ? (dateH5.textContent?.split('\n')[0].trim() || '') : (currentTournament?.dateStr || '');

    const divisions: Record<string, Division> = {};
    let activeDivisionId = currentTournament?.activeDivisionId || '';
    let hasNewRound = false;

    const pillLinks = doc.querySelectorAll('ul.nav-pills li.nav-item a.nav-link');

    pillLinks.forEach(link => {
        const targetId = (link.getAttribute('href') || '').replace('#', '');
        const rawName = link.textContent?.trim() || '';

        let divName = rawName;
        let roundNum = 1;
        const match = rawName.match(/^(.*?)\s+in\s+Round\s+(\d+)/i);
        if (match) {
            divName = match[1].trim();
            roundNum = parseInt(match[2], 10);
        }

        const prevRound = currentTournament?.divisions?.[targetId]?.round;
        if (prevRound && prevRound !== roundNum) {
            hasNewRound = true;
        }

        const divPane = doc.getElementById(targetId) || doc.querySelector(targetId ? `#${targetId}` : '.tab-pane');
        const tableList: Table[] = [];

        if (divPane) {
            const activeRoundTab = divPane.querySelector('.current-tables.active, .current-tables.show') ||
                divPane.querySelector('.current-tables');

            if (activeRoundTab) {
                const matchRows = activeRoundTab.querySelectorAll('.row.match.no-gutter');
                matchRows.forEach((row, rIdx) => {
                    if (rIdx === 0) return; // skip header

                    const isComplete = row.classList.contains('complete');
                    const p1El = row.querySelector('.player1 .name');
                    const p2El = row.querySelector('.player2 .name');
                    const tNumEl = row.querySelector('.tablenumber');

                    const tNum = tNumEl ? parseInt(tNumEl.textContent?.trim() || '', 10) || rIdx : rIdx;
                    const p1 = p1El?.textContent?.trim() || "Player 1";
                    const p2 = p2El?.textContent?.trim() || "Player 2";

                    tableList.push({
                        num: tNum,
                        p1,
                        p2,
                        isOfficialDone: isComplete
                    });
                });
            }
        }

        divisions[targetId] = {
            name: divName,
            round: roundNum,
            rawLabel: rawName,
            tables: tableList
        };

        if (!activeDivisionId) {
            activeDivisionId = targetId;
        }
    });

    return {
        tournament: {
            url: currentTournament?.url || '',
            id: currentTournament?.id || '',
            title,
            dateStr,
            activeDivisionId,
            divisions
        },
        hasNewRound
    };
}

export function parseTomData(xmlString: string, currentTournament: TournamentData | null): { tournament: TournamentData, hasNewRound: boolean } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    let title = currentTournament?.title || '';
    let dateStr = currentTournament?.dateStr || '';

    const dataNode = doc.querySelector('data');
    if (dataNode) {
        const nameNode = dataNode.querySelector('name');
        if (nameNode) title = nameNode.textContent?.trim() || title;
        const dNode = dataNode.querySelector('startdate');
        if (dNode) dateStr = dNode.textContent?.trim() || dateStr;
    }

    let hasNewRound = false;
    const divisions: Record<string, Division> = { ...currentTournament?.divisions };
    let activeDivisionId = currentTournament?.activeDivisionId || '';

    const playerMap: Record<string, string> = {};
    const playerNodes = doc.querySelectorAll('players > player');
    Array.from(playerNodes).forEach(p => {
        const uid = p.getAttribute('userid');
        if (!uid) return;
        const fName = p.querySelector('firstname')?.textContent?.trim() || '';
        const lName = p.querySelector('lastname')?.textContent?.trim() || '';
        if (fName || lName) {
            playerMap[uid] = `${fName} ${lName}`.trim();
        }
    });

    const pods = doc.querySelectorAll('pod');
    
    Array.from(pods).forEach(pod => {
        const catStr = pod.getAttribute('category');
        if (!catStr) return;
        
        const roundsNode = pod.querySelector('rounds');
        if (!roundsNode) return;
        
        const catInt = parseInt(catStr, 10);
        let divName = "Division " + catInt;
        let divId = "div_" + catInt;
        if (catInt === 0) { divName = "Juniors"; divId = "juniors"; }
        else if (catInt === 1) { divName = "Seniors"; divId = "seniors"; }
        else if (catInt === 2) { divName = "Masters"; divId = "masters"; }

        const allRounds = roundsNode.querySelectorAll('round');
        if (allRounds.length === 0) return;
        
        let highestRoundNum = -1;
        let activeRoundNode: Element | null = null;
        Array.from(allRounds).forEach(r => {
            const rNum = parseInt(r.getAttribute('number') || "0", 10);
            if (rNum > highestRoundNum) {
                highestRoundNum = rNum;
                activeRoundNode = r;
            }
        });
        
        if (!activeRoundNode) return;

        const prevRound = currentTournament?.divisions?.[divId]?.round;
        if (prevRound && prevRound !== highestRoundNum) {
            hasNewRound = true;
        }

        const tableList: Table[] = [];
        const matches = (activeRoundNode as Element).querySelectorAll('match');
        
        Array.from(matches).forEach(m => {
            const tNumNode = m.querySelector('tablenumber');
            const outcome = m.getAttribute('outcome');
            
            if (!tNumNode) return;
            const tNum = parseInt(tNumNode.textContent?.trim() || '', 10);
            
            if (tNum === 0) return; // Skip byes
            
            const p1Id = m.querySelector('player1')?.getAttribute('userid') || '';
            const p2Id = m.querySelector('player2')?.getAttribute('userid') || '';

            const p1Name = playerMap[p1Id] || "Player 1";
            const p2Name = playerMap[p2Id] || "Player 2";

            const isOfficialDone = (outcome !== "0");

            tableList.push({
                num: tNum,
                p1: p1Name,
                p2: p2Name,
                isOfficialDone: isOfficialDone
            });
        });

        tableList.sort((a,b) => a.num - b.num);

        divisions[divId] = {
            name: divName,
            round: highestRoundNum,
            rawLabel: `${divName} in Round ${highestRoundNum}`,
            tables: tableList
        };

        if (!activeDivisionId) {
            activeDivisionId = divId;
        }
    });

    return {
        tournament: {
            url: currentTournament?.url || '',
            id: currentTournament?.id || '',
            title,
            dateStr,
            activeDivisionId,
            divisions
        },
        hasNewRound
    };
}
