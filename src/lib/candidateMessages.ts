export interface CandidateMessage {
  id: string;
  candidateEmail: string;
  candidateName: string;
  candidatePersonalNumber?: string;
  direction: 'inbound' | 'outbound';
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'provprotokoll_candidate_messages';

// Standardexempel så användaren omedelbart ser hur ett besvarat mejl ser ut på Rasmus profil
const DEFAULT_MESSAGES: CandidateMessage[] = [
  {
    id: 'msg-seed-1',
    candidateEmail: 'Rasmus.03@hotmail.se',
    candidateName: 'Rasmus Lundin',
    candidatePersonalNumber: '20030514-4937',
    direction: 'outbound',
    sender: 'Provresultat <info@rasmusl.se>',
    subject: 'Provresultat – Resultat från ditt körprov (Behörighet B)',
    body: 'Hej Rasmus! Här kommer ditt provresultat!\n\nKörprovet är GODKÄNT för behörighet B.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-2',
    candidateEmail: 'Rasmus.03@hotmail.se',
    candidateName: 'Rasmus Lundin',
    candidatePersonalNumber: '20030514-4937',
    direction: 'inbound',
    sender: 'Rasmus Lundin <Rasmus.03@hotmail.se>',
    subject: 'Sv: Provresultat – Resultat från ditt körprov (Behörighet B)',
    body: 'Hej! Tack så jättemycket för ett trevligt prov och ett snabbt besked! Kan jag köra med mitt digitala protokoll redan idag innan plastkortet kommit i brevlådan?\n\nMvh Rasmus',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false, // Omarkerad som oläst så att indikatorn lyser direkt!
  },
];

export function getStoredMessages(): CandidateMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MESSAGES));
      return DEFAULT_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export function saveMessages(messages: CandidateMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('candidate_messages_updated', { detail: messages }));
  } catch (_) {}
}

export function getMessagesForCandidate(identifier: { email?: string; personalNumber?: string; name?: string }): CandidateMessage[] {
  const all = getStoredMessages();
  const emailNorm = identifier.email?.trim().toLowerCase();
  const pnrNorm = identifier.personalNumber?.replace(/\D/g, '');
  const nameNorm = identifier.name?.trim().toLowerCase();

  return all.filter((m) => {
    if (emailNorm && m.candidateEmail.trim().toLowerCase() === emailNorm) return true;
    if (pnrNorm && m.candidatePersonalNumber && m.candidatePersonalNumber.replace(/\D/g, '') === pnrNorm) return true;
    if (nameNorm && m.candidateName.trim().toLowerCase() === nameNorm) return true;
    return false;
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getUnreadReplyCountForCandidate(identifier: { email?: string; personalNumber?: string; name?: string }): number {
  const msgs = getMessagesForCandidate(identifier);
  return msgs.filter((m) => m.direction === 'inbound' && !m.read).length;
}

export function getTotalUnreadRepliesCount(): number {
  const all = getStoredMessages();
  return all.filter((m) => m.direction === 'inbound' && !m.read).length;
}

export function markMessagesAsReadForCandidate(identifier: { email?: string; personalNumber?: string; name?: string }): void {
  const all = getStoredMessages();
  const emailNorm = identifier.email?.trim().toLowerCase();
  const pnrNorm = identifier.personalNumber?.replace(/\D/g, '');
  const nameNorm = identifier.name?.trim().toLowerCase();

  let modified = false;
  const updated = all.map((m) => {
    const isTarget =
      (emailNorm && m.candidateEmail.trim().toLowerCase() === emailNorm) ||
      (pnrNorm && m.candidatePersonalNumber && m.candidatePersonalNumber.replace(/\D/g, '') === pnrNorm) ||
      (nameNorm && m.candidateName.trim().toLowerCase() === nameNorm);

    if (isTarget && m.direction === 'inbound' && !m.read) {
      modified = true;
      return { ...m, read: true };
    }
    return m;
  });

  if (modified) {
    saveMessages(updated);
  }
}

export function recordOutboundMessage(params: {
  candidateEmail: string;
  candidateName: string;
  candidatePersonalNumber?: string;
  subject: string;
  body: string;
}): CandidateMessage {
  const all = getStoredMessages();
  const newMsg: CandidateMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    candidateEmail: params.candidateEmail,
    candidateName: params.candidateName,
    candidatePersonalNumber: params.candidatePersonalNumber,
    direction: 'outbound',
    sender: 'Provresultat <info@rasmusl.se>',
    subject: params.subject,
    body: params.body,
    timestamp: new Date().toISOString(),
    read: true,
  };

  saveMessages([...all, newMsg]);
  return newMsg;
}

export function recordInboundMessage(params: {
  candidateEmail: string;
  candidateName?: string;
  candidatePersonalNumber?: string;
  subject: string;
  body: string;
}): CandidateMessage {
  const all = getStoredMessages();
  const newMsg: CandidateMessage = {
    id: `msg-in-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    candidateEmail: params.candidateEmail,
    candidateName: params.candidateName || params.candidateEmail.split('@')[0],
    candidatePersonalNumber: params.candidatePersonalNumber,
    direction: 'inbound',
    sender: `${params.candidateName || params.candidateEmail} <${params.candidateEmail}>`,
    subject: params.subject.startsWith('Sv:') ? params.subject : `Sv: ${params.subject}`,
    body: params.body,
    timestamp: new Date().toISOString(),
    read: false,
  };

  saveMessages([...all, newMsg]);
  return newMsg;
}
