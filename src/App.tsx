/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePWA } from './usePWA.ts';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  currency: string;
  balance: number;
  isBanned: boolean;
  isAdmin?: boolean;
  createdAt: string;
}

interface Match {
  id: string;
  league: string;
  teams: string;
  score: string;
  time: string;
  odd1: number;
  oddX: number;
  odd2: number;
  videoUrl?: string;
  live: boolean;
}

interface ActivityLog {
  id: string;
  text: string;
  time: string;
  type: 'bet' | 'deposit' | 'withdraw' | 'user' | 'match';
}

const INITIAL_MATCHES: Match[] = [
  {
    id: 'm-1',
    league: 'Uganda Premier League',
    teams: 'Vipers SC vs KCCA FC',
    score: '2 - 1',
    time: "64'",
    odd1: 1.85,
    oddX: 3.4,
    odd2: 4.2,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    live: true,
  },
  {
    id: 'm-2',
    league: 'English Premier League',
    teams: 'Arsenal vs Chelsea',
    score: '1 - 0',
    time: "52'",
    odd1: 1.62,
    oddX: 3.8,
    odd2: 5.5,
    live: true,
  },
  {
    id: 'm-3',
    league: 'UEFA Champions League',
    teams: 'Real Madrid vs Bayern Munich',
    score: '2 - 2',
    time: "81'",
    odd1: 2.15,
    oddX: 2.95,
    odd2: 3.25,
    live: true,
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Topi Star',
    email: 'topistar076@gmail.com',
    phone: '+256 772 890123',
    currency: 'UGX',
    balance: 85000,
    isBanned: false,
    isAdmin: true,
    createdAt: '2026-11-10 14:22',
  },
  {
    id: 'u-2',
    name: 'Kasumba David',
    email: 'kasumba.d@gmail.com',
    phone: '+256 701 445210',
    currency: 'UGX',
    balance: 24500,
    isBanned: false,
    createdAt: '2026-11-11 09:15',
  },
  {
    id: 'u-3',
    name: 'Alex Okello',
    email: 'alex.okello@yahoo.com',
    phone: '+256 754 112908',
    currency: 'UGX',
    balance: 0,
    isBanned: true,
    createdAt: '2026-11-08 19:40',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'l-1',
    text: 'User topistar076 deposited 10,000 USh via MTN MoMo',
    time: '2 mins ago',
    type: 'deposit',
  },
  {
    id: 'l-2',
    text: 'Bet placed on Vipers SC @ 1.85 (Amount: 5,000 USh)',
    time: '6 mins ago',
    type: 'bet',
  },
  {
    id: 'l-3',
    text: 'New registration from Kampala, Uganda (+256 701 445210)',
    time: '18 mins ago',
    type: 'user',
  },
  {
    id: 'l-4',
    text: 'Odds updated for Arsenal vs Chelsea (1.62 / 3.80 / 5.50)',
    time: '34 mins ago',
    type: 'match',
  },
];

export default function App() {
  // PWA Download & Update hook
  const { isInstallable, isInstalled, install, updateAvailable, isCheckingUpdate, forceUpdateApp } = usePWA();

  // Navigation & View state
  const [mainView, setMainView] = useState<'sports' | 'casino'>('sports');
  const [adminActive, setAdminActive] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'usersTab' | 'editMatchesTab' | 'videoMatchTab' | 'trafficTab'>('usersTab');

  // Modals and Drawer state
  const [activeModal, setActiveModal] = useState<
    'signup' | 'login' | 'forgot' | 'withdraw' | 'deposit' | 'settings' | 'support' | 'betSlip' | 'video' | 'casinoGame' | null
  >(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // App Data state (with backward compatibility migration from viking_* to aplex_*)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('aplex_users') || localStorage.getItem('viking_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aplex_current_user') || localStorage.getItem('viking_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('aplex_matches') || localStorage.getItem('viking_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [trafficLogs, setTrafficLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('aplex_logs') || localStorage.getItem('viking_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to local storage under APLEX and legacy keys
  useEffect(() => {
    localStorage.setItem('aplex_users', JSON.stringify(users));
    localStorage.setItem('viking_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aplex_current_user', JSON.stringify(currentUser));
      localStorage.setItem('viking_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('aplex_current_user');
      localStorage.removeItem('viking_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aplex_matches', JSON.stringify(matches));
    localStorage.setItem('viking_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('aplex_logs', JSON.stringify(trafficLogs));
    localStorage.setItem('viking_logs', JSON.stringify(trafficLogs));
  }, [trafficLogs]);

  // Auth Forms state
  const [regMode, setRegMode] = useState<'default' | 'quick'>('default');
  const [signupName, setSignupName] = useState('');
  const [signupCountry, setSignupCountry] = useState('+256');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCurrency, setSignupCurrency] = useState('UGX');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');

  // Deposit Form state
  const [depositMethod, setDepositMethod] = useState<'mtn' | 'airtel'>('mtn');
  const [depositPhone, setDepositPhone] = useState('770 123-456');
  const [depositAmount, setDepositAmount] = useState<number>(10000);

  // Withdraw Form state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [withdrawSystem, setWithdrawSystem] = useState<'mtn' | 'airtel'>('mtn');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  // Add Match state
  const [newMatchLeague, setNewMatchLeague] = useState('');
  const [newMatchTeams, setNewMatchTeams] = useState('');
  const [newMatchVideoUrl, setNewMatchVideoUrl] = useState('');
  const [newOdd1, setNewOdd1] = useState(1.85);
  const [newOddX, setNewOddX] = useState(3.4);
  const [newOdd2, setNewOdd2] = useState(4.2);

  // Bet Slip state
  const [betSlip, setBetSlip] = useState<{
    match: Match;
    selection: '1' | 'X' | '2';
    odds: number;
    amount: number;
  } | null>(null);

  // Video viewer modal state
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // Casino filters and search
  const [casinoSearch, setCasinoSearch] = useState('');
  const [activeProvider, setActiveProvider] = useState('Pragmatic Play');
  const [activeCategory, setActiveCategory] = useState('All Games');
  const [selectedGameTitle, setSelectedGameTitle] = useState<string | null>(null);

  // Support chat messages
  const [supportMessages, setSupportMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Hello! Welcome to APLEX 24/7 Support. How can we help you today with deposits, withdrawals, or sports bets?',
      time: 'Just now',
    },
  ]);
  const [newSupportMsg, setNewSupportMsg] = useState('');

  // Brand Logo Multi-Click shortcut to Admin (3 clicks)
  const [logoClicks, setLogoClicks] = useState(0);
  const handleLogoClick = () => {
    setMainView('sports');
    setLogoClicks((prev) => {
      if (prev + 1 >= 3) {
        setAdminActive(true);
        showToast('Admin Control Panel Opened');
        return 0;
      }
      return prev + 1;
    });
  };

  // Switch Main View
  const switchMainView = (view: 'sports' | 'casino') => {
    setMainView(view);
  };

  // Modals helpers
  const closeAllModals = () => {
    setActiveModal(null);
    setBetSlip(null);
    setSelectedGameTitle(null);
    setCurrentVideoUrl(null);
  };

  const openLoginModal = () => {
    closeAllModals();
    setDrawerOpen(false);
    setActiveModal('login');
  };

  const openSignupModal = () => {
    closeAllModals();
    setDrawerOpen(false);
    setActiveModal('signup');
  };

  const openDepositModal = () => {
    closeAllModals();
    setDrawerOpen(false);
    setActiveModal('deposit');
  };

  const openWithdrawModal = () => {
    closeAllModals();
    setDrawerOpen(false);
    setActiveModal('withdraw');
  };

  const openForgotPassModal = () => {
    closeAllModals();
    setForgotStep(1);
    setActiveModal('forgot');
  };

  const openSettingsModal = () => {
    closeAllModals();
    setDrawerOpen(false);
    setActiveModal('settings');
  };

  const openProfileDrawer = () => {
    setDrawerOpen(true);
  };

  const closeProfileDrawer = () => {
    setDrawerOpen(false);
  };

  // Auth Handlers
  const handleSignUpSubmit = () => {
    const trimmedEmail = signupEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      showToast('Please enter a valid email address');
      return;
    }

    // Strict duplicate email check
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      showToast('Email address already registered. Please log in.');
      return;
    }

    const newUser: User = {
      id: 'u-' + Date.now(),
      name: signupName.trim() || (regMode === 'quick' ? 'APLEX Player' : 'New User'),
      email: trimmedEmail,
      phone: `${signupCountry} ${signupPhone.trim()}`,
      currency: signupCurrency,
      balance: 15000, // Welcome bonus of 15,000 USh
      isBanned: false,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    // Add activity log
    const logItem: ActivityLog = {
      id: 'log-' + Date.now(),
      text: `New user registration: ${trimmedEmail} (${newUser.currency})`,
      time: 'Just now',
      type: 'user',
    };
    setTrafficLogs((prev) => [logItem, ...prev]);

    closeAllModals();
    showToast(`Welcome ${newUser.name}! 15,000 USh bonus credited.`);
  };

  const handleLoginSubmit = () => {
    const trimmedEmail = loginEmail.trim().toLowerCase();

    // Check if logging in as Admin
    if (
      trimmedEmail === 'admin@aplex.com' ||
      trimmedEmail === 'admin@vikingbet.com' ||
      trimmedEmail === 'admin@gmail.com' ||
      trimmedEmail === 'admin' ||
      loginPassword === 'admin123'
    ) {
      const adminUser: User = {
        id: 'admin-super',
        name: 'Super Admin',
        email: trimmedEmail || 'admin@aplex.com',
        phone: '+256 700 000000',
        currency: 'UGX',
        balance: 1000000,
        isBanned: false,
        isAdmin: true,
        createdAt: '2026-01-01',
      };
      setCurrentUser(adminUser);
      setAdminActive(true);
      closeAllModals();
      showToast('Logged in as Super Admin! Dashboard activated.');
      return;
    }

    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      showToast('No user found with this email. Please sign up.');
      return;
    }

    if (found.isBanned) {
      showToast('This account has been suspended by administration.');
      return;
    }

    setCurrentUser(found);
    closeAllModals();
    showToast(`Welcome back, ${found.name}!`);
  };

  const logout = () => {
    setCurrentUser(null);
    setDrawerOpen(false);
    showToast('You have logged out successfully.');
  };

  // Forgot password handlers
  const sendGmailVerificationCode = () => {
    if (!forgotEmail.trim()) {
      showToast('Please enter your email');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setForgotStep(2);
    showToast(`Demo Verification Code: ${code} (Sent to Gmail)`);
  };

  const verifyCodeAndResetPassword = () => {
    if (enteredCode !== generatedCode) {
      showToast('Invalid verification code. Please check and try again.');
      return;
    }
    if (!newResetPassword || newResetPassword.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }

    // Update user if registered
    const trimmed = forgotEmail.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === trimmed);
    if (user) {
      setCurrentUser(user);
    } else {
      // Auto-create or log in
      const created: User = {
        id: 'u-' + Date.now(),
        name: 'APLEX Player',
        email: trimmed,
        phone: '+256 700 000000',
        currency: 'UGX',
        balance: 10000,
        isBanned: false,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setUsers((prev) => [created, ...prev]);
      setCurrentUser(created);
    }

    closeAllModals();
    showToast('Password reset successful! You are now logged in.');
  };

  // Deposit handler
  const processDeposit = () => {
    const amt = Number(depositAmount);
    if (!amt || amt < 500) {
      showToast('Minimum deposit is 500 USh');
      return;
    }

    const providerName = depositMethod === 'mtn' ? 'MTN MoMo' : 'Airtel Money';

    if (currentUser) {
      const updatedUser = { ...currentUser, balance: currentUser.balance + amt };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    } else {
      // Guest deposit creates a temporary active session
      const guestUser: User = {
        id: 'u-' + Date.now(),
        name: 'Player',
        email: `player_${depositPhone.replace(/\D/g, '')}@aplex.ug`,
        phone: `+256 ${depositPhone}`,
        currency: 'UGX',
        balance: amt,
        isBanned: false,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setUsers((prev) => [guestUser, ...prev]);
      setCurrentUser(guestUser);
    }

    // Add activity log
    const logItem: ActivityLog = {
      id: 'log-' + Date.now(),
      text: `Deposit of ${amt.toLocaleString()} USh received via ${providerName} (${depositPhone})`,
      time: 'Just now',
      type: 'deposit',
    };
    setTrafficLogs((prev) => [logItem, ...prev]);

    closeAllModals();
    showToast(`Payment Approved! Added ${amt.toLocaleString()} USh via ${providerName}`);
  };

  // Withdrawal handler
  const processWithdrawal = () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt < 1000) {
      showToast('Minimum withdrawal is 1,000 USh');
      return;
    }

    if (!currentUser || currentUser.balance < amt) {
      showToast('Insufficient balance for this withdrawal.');
      return;
    }

    if (!withdrawAccount.trim()) {
      showToast('Please enter your receiving phone number or wallet');
      return;
    }

    const providerName = withdrawSystem === 'mtn' ? 'MTN MoMo' : 'Airtel Money';
    const updatedUser = { ...currentUser, balance: currentUser.balance - amt };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Log activity
    const logItem: ActivityLog = {
      id: 'log-' + Date.now(),
      text: `Withdrawal request of ${amt.toLocaleString()} USh to ${providerName} (${withdrawAccount})`,
      time: 'Just now',
      type: 'withdraw',
    };
    setTrafficLogs((prev) => [logItem, ...prev]);

    closeAllModals();
    showToast(`Withdrawal of ${amt.toLocaleString()} USh dispatched to ${providerName}!`);
  };

  // Placing bets
  const handleSelectOdd = (match: Match, selection: '1' | 'X' | '2', odds: number) => {
    setBetSlip({
      match,
      selection,
      odds,
      amount: 2000,
    });
    setActiveModal('betSlip');
  };

  const confirmPlaceBet = () => {
    if (!betSlip) return;

    if (!currentUser) {
      setActiveModal('login');
      showToast('Please log in or sign up to place bets');
      return;
    }

    if (currentUser.balance < betSlip.amount) {
      showToast('Insufficient balance. Please deposit funds first.');
      setActiveModal('deposit');
      return;
    }

    const updatedUser = { ...currentUser, balance: currentUser.balance - betSlip.amount };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    const logItem: ActivityLog = {
      id: 'log-' + Date.now(),
      text: `Bet placed: ${betSlip.match.teams} [Pick: ${betSlip.selection} @ ${betSlip.odds}] (Stake: ${betSlip.amount.toLocaleString()} USh)`,
      time: 'Just now',
      type: 'bet',
    };
    setTrafficLogs((prev) => [logItem, ...prev]);

    closeAllModals();
    showToast(`Bet Placed on ${betSlip.match.teams}! Possible return: ${(betSlip.amount * betSlip.odds).toLocaleString()} USh`);
  };

  // Admin Actions
  const handleToggleBanUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = !u.isBanned;
          showToast(`User ${u.email} is now ${newStatus ? 'BANNED' : 'UNBANNED'}`);
          return { ...u, isBanned: newStatus };
        }
        return u;
      })
    );
  };

  const handleUpdateMatch = (matchId: string, field: 'score' | 'time' | 'odd1' | 'oddX' | 'odd2', val: any) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return { ...m, [field]: val };
        }
        return m;
      })
    );
  };

  const submitNewVideoMatch = () => {
    if (!newMatchLeague.trim() || !newMatchTeams.trim()) {
      showToast('Please provide League and Teams');
      return;
    }

    const createdMatch: Match = {
      id: 'm-' + Date.now(),
      league: newMatchLeague.trim(),
      teams: newMatchTeams.trim(),
      score: '0 - 0',
      time: "1'",
      odd1: Number(newOdd1) || 1.85,
      oddX: Number(newOddX) || 3.4,
      odd2: Number(newOdd2) || 4.2,
      videoUrl: newMatchVideoUrl.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
      live: true,
    };

    setMatches((prev) => [createdMatch, ...prev]);

    const logItem: ActivityLog = {
      id: 'log-' + Date.now(),
      text: `New live video match broadcasted: ${createdMatch.teams} (${createdMatch.league})`,
      time: 'Just now',
      type: 'match',
    };
    setTrafficLogs((prev) => [logItem, ...prev]);

    setNewMatchLeague('');
    setNewMatchTeams('');
    setNewMatchVideoUrl('');

    showToast(`New live match "${createdMatch.teams}" is now broadcasting on APLEX!`);
    setAdminTab('editMatchesTab');
  };

  // Support chat send
  const handleSendSupportMsg = () => {
    if (!newSupportMsg.trim()) return;
    const userMsg = newSupportMsg.trim();
    setSupportMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setNewSupportMsg('');

    setTimeout(() => {
      setSupportMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Thank you for contacting APLEX 24/7 Support! We received your message: "${userMsg}". All MTN & Airtel transactions in Uganda are processed instantly.`,
          time: 'Just now',
        },
      ]);
    }, 900);
  };

  // Display Balance formatting
  const displayBalance = (currentUser?.balance || 0).toLocaleString() + ' USh';

  // Manual Trigger App Update
  const handleTriggerUpdate = async () => {
    showToast('Checking for latest APLEX updates & refreshing cache...');
    await forceUpdateApp();
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="viking-toast aplex-toast">
          <i className="fa-solid fa-circle-check" style={{ color: '#00e676' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PWA Auto-Update Alert Bar for Downloaded / Installed App */}
      {updateAvailable && (
        <div className="pwa-update-bar">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-cloud-arrow-down"></i>
            <span>New APLEX update ready!</span>
          </span>
          <button className="pwa-update-btn" onClick={handleTriggerUpdate}>
            {isCheckingUpdate ? 'Updating...' : 'Update App Now'}
          </button>
        </div>
      )}

      {/* HEADER */}
      <header id="mainHeader">
        <div className="brand-logo" onClick={handleLogoClick} title="APLEX Sportsbook">
          <i className="fa-solid fa-shield-halved"></i> APLEX
        </div>

        {!currentUser ? (
          <div className="header-logged-out" id="loggedOutView" style={{ display: 'flex' }}>
            <button className="btn-login" onClick={openLoginModal}>
              Log in
            </button>
            <button className="btn-signup" onClick={openSignupModal}>
              Sign Up
            </button>
          </div>
        ) : (
          <div className="header-logged-in" id="loggedInView" style={{ display: 'flex' }}>
            <div className="balance-box" onClick={openDepositModal}>
              <span className="balance-title">Balance</span>
              <span className="balance-amount" id="headerBalanceDisplay">
                {displayBalance}
              </span>
            </div>
            <div className="user-pill" onClick={openProfileDrawer}>
              <div className="user-avatar-circle">
                <i className="fa-solid fa-user"></i>
              </div>
              <i className="fa-solid fa-ellipsis-vertical" style={{ color: 'var(--text-muted)', fontSize: '15px' }}></i>
            </div>
          </div>
        )}
      </header>

      {/* MAIN USER CONTAINER */}
      <main className="container" id="mainContainer">
        {/* 1. SPORTSBOOK VIEW */}
        <div className={`view-panel ${mainView === 'sports' ? 'active-view' : ''}`} id="sportsView">
          <div className="promo-banner">
            <div>
              <h2 style={{ fontSize: '19px', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 900 }}>
                Worldwide
                <br />
                Access
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>We work with players from all countries</p>
            </div>
          </div>

          <div className="hub-card">
            <div className="hub-header">
              <span className="hub-title">Matches</span>
              <span className="hub-tag">LIVE Sport</span>
            </div>
            <div className="pills-row">
              <button className="hub-pill-btn">
                <i className="fa-solid fa-hockey-puck"></i> Hockey
              </button>
              <button className="hub-pill-btn">
                <i className="fa-solid fa-baseball"></i> Tennis
              </button>
              <button className="hub-pill-btn">
                <i className="fa-solid fa-basketball"></i> Basketball
              </button>
              <button className="hub-pill-btn">
                <i className="fa-solid fa-baseball-bat-ball"></i> Baseball
              </button>
            </div>
          </div>

          {/* LIVE MATCHES DISPLAY */}
          <div className="section-title">
            <span>
              <i className="fa-solid fa-bolt" style={{ color: '#ff334b' }}></i> Live Matches
            </span>
            <span style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer' }}>
              All ({matches.length + 21})
            </span>
          </div>

          <div id="liveMatchesContainer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matches.map((m) => (
              <div key={m.id} className="live-match-card">
                <div className="match-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{m.league}</span>
                    <span className="live-pulse"></span>
                    <span className="match-status-badge">{m.time}</span>
                  </div>

                  {m.videoUrl && (
                    <button
                      className="video-badge-btn"
                      onClick={() => {
                        setCurrentVideoUrl(m.videoUrl || '');
                        setActiveModal('video');
                      }}
                    >
                      <i className="fa-solid fa-video"></i> WATCH LIVE
                    </button>
                  )}
                </div>

                <div className="match-teams-row">
                  <span>{m.teams}</span>
                  <span style={{ color: 'var(--primary)', fontSize: '15px', fontWeight: 900 }}>{m.score}</span>
                </div>

                <div className="match-odds-grid">
                  <button
                    className={`odd-btn ${betSlip?.match.id === m.id && betSlip?.selection === '1' ? 'selected' : ''}`}
                    onClick={() => handleSelectOdd(m, '1', m.odd1)}
                  >
                    <span className="odd-label">1</span>
                    <span className="odd-val">{m.odd1.toFixed(2)}</span>
                  </button>
                  <button
                    className={`odd-btn ${betSlip?.match.id === m.id && betSlip?.selection === 'X' ? 'selected' : ''}`}
                    onClick={() => handleSelectOdd(m, 'X', m.oddX)}
                  >
                    <span className="odd-label">X</span>
                    <span className="odd-val">{m.oddX.toFixed(2)}</span>
                  </button>
                  <button
                    className={`odd-btn ${betSlip?.match.id === m.id && betSlip?.selection === '2' ? 'selected' : ''}`}
                    onClick={() => handleSelectOdd(m, '2', m.odd2)}
                  >
                    <span className="odd-label">2</span>
                    <span className="odd-val">{m.odd2.toFixed(2)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CASINO BANNER HUB */}
          <div
            className="hub-card"
            style={{ background: 'linear-gradient(90deg, #0e3b28 0%, #155d3e 100%)', cursor: 'pointer' }}
            onClick={() => switchMainView('casino')}
          >
            <div className="hub-header">
              <span className="hub-title">Casino</span>
              <span className="hub-tag">LIVE Casino</span>
            </div>
            <div className="pills-row">
              <button className="hub-pill-btn">
                <i className="fa-solid fa-dice"></i> Popular
              </button>
              <button className="hub-pill-btn">
                <i className="fa-solid fa-border-all"></i> Top Games
              </button>
              <button className="hub-pill-btn">
                <i className="fa-solid fa-dharmachakra"></i> Poker
              </button>
              <button className="hub-pill-btn">
                <i className="fa-solid fa-gem"></i> Slots
              </button>
            </div>
          </div>

          <div className="section-title">
            <span>
              <i className="fa-solid fa-basketball"></i> Sports are trending
            </span>
          </div>

          <div className="slider-row">
            <div
              className="sport-card"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=300&q=80')",
              }}
            >
              <span>Tennis</span>
            </div>
            <div
              className="sport-card"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=300&q=80')",
              }}
            >
              <span>Basketball</span>
            </div>
            <div
              className="sport-card"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=300&q=80')",
              }}
            >
              <span>Rugby</span>
            </div>
            <div
              className="sport-card"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80')",
              }}
            >
              <span>Baseball</span>
            </div>
          </div>
        </div>

        {/* 2. CASINO LOBBY VIEW */}
        <div className={`view-panel ${mainView === 'casino' ? 'active-view' : ''}`} id="casinoView">
          <div className="casino-search">
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: '14px' }}></i>
            <input
              type="text"
              placeholder="Search games or providers..."
              value={casinoSearch}
              onChange={(e) => setCasinoSearch(e.target.value)}
            />
          </div>

          <div className="section-title" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>TOP PROVIDERS</span>
            <span style={{ color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }}>All (38)</span>
          </div>

          <div className="providers-bar">
            {['Pragmatic Play', 'Evolution', 'Spribe (Aviator)', 'NetEnt', 'Novomatic', 'Hacksaw Gaming'].map((p) => (
              <div
                key={p}
                className={`provider-chip ${activeProvider === p ? 'active' : ''}`}
                onClick={() => setActiveProvider(p)}
              >
                <i className="fa-solid fa-crown"></i> {p}
              </div>
            ))}
          </div>

          <div className="c-filters">
            {['All Games', 'Slots', 'Live Casino', 'Crash (Aviator)', 'Jackpot'].map((cat) => (
              <button
                key={cat}
                className={`c-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="section-title">
            <span>
              <i className="fa-solid fa-cherries" style={{ color: '#ff334b' }}></i> Trending games
            </span>
          </div>

          <div className="slider-row">
            <div
              className="game-card-tall"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=300&q=80')",
              }}
              onClick={() => {
                setSelectedGameTitle('Sweet Bonanza 1000');
                setActiveModal('casinoGame');
              }}
            >
              <span className="t">Sweet Bonanza 1000</span>
              <span className="p">Pragmatic Play</span>
            </div>
            <div
              className="game-card-tall"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80')",
              }}
              onClick={() => {
                setSelectedGameTitle('Gates of Olympus 1000');
                setActiveModal('casinoGame');
              }}
            >
              <span className="t">Gates of Olympus 1000</span>
              <span className="p">Pragmatic Play</span>
            </div>
            <div
              className="game-card-tall"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=300&q=80')",
              }}
              onClick={() => {
                setSelectedGameTitle('Sugar Rush 1000');
                setActiveModal('casinoGame');
              }}
            >
              <span className="t">Sugar Rush 1000</span>
              <span className="p">Pragmatic Play</span>
            </div>
          </div>

          <div className="section-title">
            <span>
              <i className="fa-solid fa-fire" style={{ color: '#ffb300' }}></i> Hot Games
            </span>
          </div>

          <div className="casino-grid-2col">
            <div
              className="c-box"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&w=300&q=80')",
              }}
              onClick={() => {
                setSelectedGameTitle('Narcos');
                setActiveModal('casinoGame');
              }}
            >
              <span className="t">Narcos</span>
              <span className="p">Video Slot</span>
            </div>
            <div
              className="c-box"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80')",
              }}
              onClick={() => {
                setSelectedGameTitle('Aztec Gold');
                setActiveModal('casinoGame');
              }}
            >
              <span className="t">Aztec Gold</span>
              <span className="p">Megaways</span>
            </div>
            <div
              className="c-box"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80')",
              }}
              onClick={() => {
                setSelectedGameTitle('Space Wars');
                setActiveModal('casinoGame');
              }}
            >
              <span className="t">Space Wars</span>
              <span className="p">NetEnt</span>
            </div>
            <div
              className="c-box"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80')",
              }}
              onClick={() => {
                setSelectedGameTitle('Book of Ra');
                setActiveModal('casinoGame');
              }}
            >
              <span className="t">Book of Ra</span>
              <span className="p">Deluxe</span>
            </div>
          </div>
        </div>
      </main>

      {/* CHAT BUTTON */}
      <div
        className="floating-chat-wrap"
        id="floatingChatBtn"
        onClick={() => setActiveModal('support')}
      >
        <div className="floating-chat-bubble">
          <i className="fa-solid fa-comment-dots"></i>
        </div>
        <div className="chat-badge">1</div>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav" id="mainBottomNav">
        <div
          className={`nav-tab ${mainView === 'sports' ? 'active' : ''}`}
          id="tabNavBets"
          onClick={() => switchMainView('sports')}
        >
          <i className="fa-solid fa-receipt"></i>
          <span>Bets</span>
        </div>
        <div
          className={`nav-tab ${mainView === 'casino' ? 'active' : ''}`}
          id="tabNavCasino"
          onClick={() => switchMainView('casino')}
        >
          <i className="fa-solid fa-circle-dot"></i>
          <span>Casino</span>
        </div>
        <div className="nav-tab" onClick={openDepositModal}>
          <i className="fa-solid fa-wallet"></i>
          <span>Deposit</span>
        </div>
        <div className="nav-tab" onClick={() => setActiveModal('support')}>
          <i className="fa-solid fa-headset"></i>
          <span>Support</span>
        </div>
        <div className="nav-tab" onClick={openProfileDrawer}>
          <i className="fa-solid fa-bars"></i>
          <span>More</span>
        </div>
      </nav>

      {/* =====================================
          ADMIN DASHBOARD FULL VIEW
          ===================================== */}
      <div id="adminView" className={adminActive ? 'active-admin' : ''}>
        <div className="admin-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-logo" style={{ fontSize: '18px' }}>
                APLEX
              </span>
              <span className="admin-badge">ADMIN CONTROL</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <span className="live-pulse"></span> Super Admin Session Active
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setAdminActive(false)}
              style={{
                background: '#00d07e',
                color: '#041009',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-eye"></i> View Site
            </button>
            <button
              onClick={() => {
                setAdminActive(false);
                setCurrentUser(null);
                showToast('Admin session closed');
              }}
              style={{
                background: 'var(--danger)',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Exit
            </button>
          </div>
        </div>

        {/* Live Analytics Metrics */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <span className="metric-val" id="metricOnlineUsers">
              342
            </span>
            <span className="metric-lbl">
              <span className="live-pulse"></span> People Online Now
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-val" id="metricTotalUsers">
              {(12890 + users.length).toLocaleString()}
            </span>
            <span className="metric-lbl">
              <i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i> Total App Users
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-val">48.2M USh</span>
            <span className="metric-lbl">
              <i className="fa-solid fa-coins" style={{ color: 'var(--accent-gold)' }}></i> Total Volume Today
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-val" id="metricActiveMatches">
              {matches.length}
            </span>
            <span className="metric-lbl">
              <i className="fa-solid fa-futbol" style={{ color: 'var(--primary)' }}></i> Active Matches
            </span>
          </div>
        </div>

        {/* Admin Nav Tabs */}
        <div className="admin-nav-bar">
          <button
            className={`admin-tab-btn ${adminTab === 'usersTab' ? 'active' : ''}`}
            onClick={() => setAdminTab('usersTab')}
          >
            <i className="fa-solid fa-user-slash"></i> Users & Bans
          </button>
          <button
            className={`admin-tab-btn ${adminTab === 'editMatchesTab' ? 'active' : ''}`}
            onClick={() => setAdminTab('editMatchesTab')}
          >
            <i className="fa-solid fa-pen-to-square"></i> Edit Matches
          </button>
          <button
            className={`admin-tab-btn ${adminTab === 'videoMatchTab' ? 'active' : ''}`}
            onClick={() => setAdminTab('videoMatchTab')}
          >
            <i className="fa-solid fa-video"></i> Add Video Match
          </button>
          <button
            className={`admin-tab-btn ${adminTab === 'trafficTab' ? 'active' : ''}`}
            onClick={() => setAdminTab('trafficTab')}
          >
            <i className="fa-solid fa-chart-line"></i> People History
          </button>
        </div>

        {/* 1. USERS & BANS TAB */}
        <div className={`admin-section ${adminTab === 'usersTab' ? 'active-sec' : ''}`} id="usersTab">
          <div className="admin-card">
            <div style={{ fontSize: '14px', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
              <span>Registered App Users</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} id="userCountStatus">
                {users.length} registered
              </span>
            </div>
            <div id="usersListContainer" style={{ display: 'flex', flexDirection: 'column' }}>
              {users.map((u) => (
                <div key={u.id} className="admin-user-row">
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {u.name}
                      {u.isAdmin && (
                        <span style={{ fontSize: '10px', background: '#00e676', color: '#041009', padding: '1px 5px', borderRadius: '4px' }}>
                          ADMIN
                        </span>
                      )}
                      {u.isBanned && (
                        <span style={{ fontSize: '10px', background: '#ff334b', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                          BANNED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {u.email} • {u.phone}
                    </div>
                    <div style={{ fontSize: '11px', color: '#00e676', fontWeight: 600 }}>
                      Bal: {u.balance.toLocaleString()} {u.currency}
                    </div>
                  </div>
                  <div>
                    {u.isBanned ? (
                      <button className="btn-unban" onClick={() => handleToggleBanUser(u.id)}>
                        Unban
                      </button>
                    ) : (
                      <button className="btn-ban" onClick={() => handleToggleBanUser(u.id)}>
                        Ban
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. EDIT MATCHES TAB */}
        <div className={`admin-section ${adminTab === 'editMatchesTab' ? 'active-sec' : ''}`} id="editMatchesTab">
          <div className="admin-card">
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>
              Live Match Odds & Scores Editor
            </div>
            <div id="adminMatchEditorList" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matches.map((m) => (
                <div key={m.id} className="match-edit-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{m.teams}</span>
                    <span style={{ fontSize: '11px', color: 'var(--primary)' }}>{m.league}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Score:</span>
                    <input
                      type="text"
                      className="odds-input"
                      value={m.score}
                      onChange={(e) => handleUpdateMatch(m.id, 'score', e.target.value)}
                      style={{ width: '80px' }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>Time:</span>
                    <input
                      type="text"
                      className="odds-input"
                      value={m.time}
                      onChange={(e) => handleUpdateMatch(m.id, 'time', e.target.value)}
                      style={{ width: '60px' }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Odds (1 / X / 2):</div>
                  <div className="odds-inputs-row">
                    <input
                      type="number"
                      step="0.01"
                      className="odds-input"
                      value={m.odd1}
                      onChange={(e) => handleUpdateMatch(m.id, 'odd1', parseFloat(e.target.value) || 1)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="odds-input"
                      value={m.oddX}
                      onChange={(e) => handleUpdateMatch(m.id, 'oddX', parseFloat(e.target.value) || 1)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="odds-input"
                      value={m.odd2}
                      onChange={(e) => handleUpdateMatch(m.id, 'odd2', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. ADD VIDEO MATCH TAB */}
        <div className={`admin-section ${adminTab === 'videoMatchTab' ? 'active-sec' : ''}`} id="videoMatchTab">
          <div className="admin-card">
            <div style={{ fontSize: '14px', fontWeight: 800 }}>Add Live Stream / Video Match</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitNewVideoMatch();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <input
                type="text"
                className="input-field"
                id="newMatchLeague"
                placeholder="League (e.g. Uganda Premier League)"
                required
                style={{ background: '#092416', color: '#fff' }}
                value={newMatchLeague}
                onChange={(e) => setNewMatchLeague(e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                id="newMatchTeams"
                placeholder="Teams (e.g. Vipers SC vs KCCA FC)"
                required
                style={{ background: '#092416', color: '#fff' }}
                value={newMatchTeams}
                onChange={(e) => setNewMatchTeams(e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                id="newMatchVideoUrl"
                placeholder="Live Video Embed URL (e.g. https://www.youtube.com/embed/...)"
                style={{ background: '#092416', color: '#fff' }}
                value={newMatchVideoUrl}
                onChange={(e) => setNewMatchVideoUrl(e.target.value)}
              />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Initial Odds:</div>
              <div className="odds-inputs-row">
                <input
                  type="number"
                  step="0.01"
                  className="odds-input"
                  id="newOdd1"
                  placeholder="1"
                  value={newOdd1}
                  onChange={(e) => setNewOdd1(parseFloat(e.target.value) || 1.85)}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  className="odds-input"
                  id="newOddX"
                  placeholder="X"
                  value={newOddX}
                  onChange={(e) => setNewOddX(parseFloat(e.target.value) || 3.4)}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  className="odds-input"
                  id="newOdd2"
                  placeholder="2"
                  value={newOdd2}
                  onChange={(e) => setNewOdd2(parseFloat(e.target.value) || 4.2)}
                  required
                />
              </div>
              <button
                type="submit"
                className="modal-submit-btn"
                style={{ background: '#00d07e', color: '#041009', fontWeight: 900 }}
              >
                Add & Broadcast Match
              </button>
            </form>
          </div>
        </div>

        {/* 4. REAL-TIME TRAFFIC & VISITORS HISTORY */}
        <div className={`admin-section ${adminTab === 'trafficTab' ? 'active-sec' : ''}`} id="trafficTab">
          <div className="admin-card">
            <div style={{ fontSize: '14px', fontWeight: 800 }}>Live People Activity Log</div>
            <div id="trafficLogsContainer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trafficLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: '#0a2116',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#edf2f7' }}>{log.text}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE DRAWER */}
      <div
        className={`drawer-overlay ${drawerOpen ? 'active' : ''}`}
        id="profileDrawerOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeProfileDrawer();
        }}
      >
        <div className="profile-drawer">
          <div className="drawer-level-circle">1</div>
          <div className="drawer-balance-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '11px', color: '#8a9bb8' }}>Balance</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }} id="drawerBalanceDisplay">
                {displayBalance}
              </span>
            </div>
            <button className="drawer-deposit-btn" onClick={openDepositModal}>
              Deposit
            </button>
          </div>
          <div className="drawer-menu-list">
            {/* Update / PWA Download items */}
            <div className="drawer-menu-item" onClick={handleTriggerUpdate}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className={`fa-solid fa-arrows-rotate ${isCheckingUpdate ? 'fa-spin' : ''}`} style={{ color: 'var(--primary)' }}></i>
                <span>{isCheckingUpdate ? 'Updating APLEX...' : 'Check for App Updates (v2.0)'}</span>
              </span>
              <span style={{ fontSize: '10px', background: '#00e676', color: '#041009', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                {updateAvailable ? 'NEW UPDATE' : 'LATEST'}
              </span>
            </div>

            {isInstallable && !isInstalled && (
              <div className="drawer-menu-item" onClick={install}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-download" style={{ color: 'var(--primary)' }}></i>
                  <span>Download APLEX App</span>
                </span>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
              </div>
            )}

            <div className="drawer-menu-item" onClick={openWithdrawModal}>
              <span>Withdrawal Request</span>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
            </div>
            <div
              className="drawer-menu-item"
              onClick={() => {
                showToast('Invite link copied! Share with friends to earn 5,000 USh bonus.');
                closeProfileDrawer();
              }}
            >
              <span>Bring a friend</span>
              <i className="fa-solid fa-user-plus" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
            </div>
            <div
              className="drawer-menu-item"
              onClick={() => {
                setActiveModal('support');
                closeProfileDrawer();
              }}
            >
              <span>Transaction History</span>
              <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
            </div>
            <div
              className="drawer-menu-item"
              onClick={() => {
                setActiveModal('support');
                closeProfileDrawer();
              }}
            >
              <span>Support</span>
              <i className="fa-solid fa-headset" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
            </div>
            <div className="drawer-menu-item" onClick={openSettingsModal}>
              <span>Settings</span>
              <i className="fa-solid fa-gear" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
            </div>
            <div className="drawer-menu-item" onClick={logout} style={{ color: '#ff5252' }}>
              <span>Exit</span>
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '11px' }}></i>
            </div>
          </div>
          <div className="drawer-lower-section">
            <div
              className="drawer-menu-item"
              onClick={() => {
                switchMainView('sports');
                closeProfileDrawer();
              }}
            >
              Home
            </div>
            <div
              className="drawer-menu-item"
              onClick={() => {
                switchMainView('casino');
                closeProfileDrawer();
              }}
            >
              Casino
            </div>
            <div
              className="drawer-menu-item"
              onClick={() => {
                switchMainView('sports');
                closeProfileDrawer();
              }}
            >
              Bets
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          1. SIGN UP MODAL (STRICT EMAIL ONLY & DUPLICATE CHECK)
          ===================================== */}
      <div
        className={`modal-overlay ${activeModal === 'signup' ? 'active' : ''}`}
        id="signupModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAllModals();
        }}
      >
        <div className="modal-card">
          <div className="auth-header">
            <span>Sign Up</span>
            <button className="close-btn" onClick={closeAllModals}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="signup-tabs">
            <button
              type="button"
              className={`tab-btn ${regMode === 'default' ? 'active' : ''}`}
              id="tabDefault"
              onClick={() => setRegMode('default')}
            >
              Default
            </button>
            <button
              type="button"
              className={`tab-btn ${regMode === 'quick' ? 'active' : ''}`}
              id="tabQuick"
              onClick={() => setRegMode('quick')}
            >
              Quick
            </button>
          </div>
          <form
            className="form-group"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUpSubmit();
            }}
          >
            {regMode === 'default' && (
              <input
                type="text"
                className="input-field default-field"
                placeholder="Your name"
                id="inputName"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
            )}
            <div className={`phone-wrap ${regMode === 'quick' ? 'hidden-in-quick' : 'default-field'}`}>
              <select
                id="countrySelect"
                value={signupCountry}
                onChange={(e) => setSignupCountry(e.target.value)}
              >
                <option value="+256">🇺🇬 +256</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+254">🇰🇪 +254</option>
              </select>
              <input
                type="tel"
                placeholder="700 123-456"
                id="phoneInput"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
              />
            </div>
            <div className="select-wrap">
              <select
                className="select-field"
                required
                value={signupCurrency}
                onChange={(e) => setSignupCurrency(e.target.value)}
              >
                <option value="UGX">UGX - Ugandan Shilling</option>
                <option value="USD">USD - US Dollar</option>
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
            {/* ONLY EMAILS ALLOWED */}
            <input
              type="email"
              className="input-field"
              placeholder="Email Address (e.g. user@gmail.com)"
              id="signupEmailInput"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            {regMode === 'default' && (
              <input
                type="password"
                className="input-field default-field"
                placeholder="Password"
                id="signupPasswordInput"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
            )}
            <label className="toggle-row">
              <div className="switch">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="slider"></span>
              </div>
              <span>I accept terms & conditions</span>
            </label>
            <label className="toggle-row">
              <div className="switch">
                <input
                  type="checkbox"
                  required
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                />
                <span className="slider"></span>
              </div>
              <span>I am 18 years old or older</span>
            </label>
            <button type="submit" className="modal-submit-btn">
              Sign Up
            </button>
          </form>
          <div className="modal-footer-text">
            Already have an account? <a onClick={openLoginModal}>Log in</a>
          </div>
        </div>
      </div>

      {/* =====================================
          2. LOG IN MODAL (STRICT EMAIL ONLY)
          ===================================== */}
      <div
        className={`modal-overlay ${activeModal === 'login' ? 'active' : ''}`}
        id="loginModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAllModals();
        }}
      >
        <div className="modal-card">
          <div className="auth-header">
            <span>Log in</span>
            <button className="close-btn" onClick={closeAllModals}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form
            className="form-group"
            onSubmit={(e) => {
              e.preventDefault();
              handleLoginSubmit();
            }}
          >
            {/* Generic placeholder: NO ADMIN EMAIL LEAKED */}
            <input
              type="email"
              className="input-field"
              id="loginEmailInput"
              placeholder="Enter your email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              id="loginPasswordInput"
              placeholder="Password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <div style={{ textAlign: 'right' }}>
              <a
                href="javascript:void(0)"
                style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none' }}
                onClick={openForgotPassModal}
              >
                Forgot your password?
              </a>
            </div>
            <button type="submit" className="modal-submit-btn">
              Log in
            </button>
          </form>
          <div className="modal-footer-text">
            Don't have an account yet? <a onClick={openSignupModal}>Sign Up</a>
          </div>
        </div>
      </div>

      {/* =====================================
          2B. FORGOT PASSWORD (GMAIL CODE VERIFICATION)
          ===================================== */}
      <div
        className={`modal-overlay ${activeModal === 'forgot' ? 'active' : ''}`}
        id="forgotPassModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAllModals();
        }}
      >
        <div className="modal-card">
          <div className="auth-header">
            <span id="resetModalTitle">Password Recovery</span>
            <button className="close-btn" onClick={closeAllModals}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          {/* STEP 1: Request Code */}
          {forgotStep === 1 && (
            <form
              className="form-group"
              id="forgotStep1"
              onSubmit={(e) => {
                e.preventDefault();
                sendGmailVerificationCode();
              }}
            >
              <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                Enter your registered email address. We will send a 6-digit verification code to your Gmail app.
              </p>
              <input
                type="email"
                className="input-field"
                id="forgotEmailInput"
                placeholder="Enter your registered email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <button type="submit" className="modal-submit-btn" id="btnSendCode">
                Send Verification Code
              </button>
            </form>
          )}

          {/* STEP 2: Verify Code & Set New Password */}
          {forgotStep === 2 && (
            <form
              className="form-group"
              id="forgotStep2"
              onSubmit={(e) => {
                e.preventDefault();
                verifyCodeAndResetPassword();
              }}
            >
              <div
                style={{
                  background: '#eefdf3',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '12px',
                  color: '#166534',
                }}
              >
                <i className="fa-solid fa-envelope-circle-check"></i> Code sent to your Gmail inbox! Please check your
                Gmail app.
              </div>
              <input
                type="text"
                maxLength={6}
                className="input-field"
                id="verifyCodeInput"
                placeholder="Enter 6-digit code (e.g. 849201)"
                required
                style={{ letterSpacing: '4px', fontWeight: 800, textAlign: 'center', fontSize: '16px' }}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
              />
              <input
                type="password"
                className="input-field"
                id="newResetPassword"
                placeholder="Enter new password"
                required
                minLength={6}
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
              />
              <button type="submit" className="modal-submit-btn">
                Reset Password & Log In
              </button>
            </form>
          )}

          <div className="modal-footer-text">
            Remembered password? <a onClick={openLoginModal}>Back to Log in</a>
          </div>
        </div>
      </div>

      {/* 3. WITHDRAWAL MODAL */}
      <div
        className={`modal-overlay ${activeModal === 'withdraw' ? 'active' : ''}`}
        id="withdrawModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAllModals();
        }}
      >
        <div className="modal-card">
          <div className="auth-header">
            <span>Withdrawal Request</span>
            <button className="close-btn" onClick={closeAllModals}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form
            className="form-group"
            onSubmit={(e) => {
              e.preventDefault();
              processWithdrawal();
            }}
          >
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount"
              id="withdrawAmountInput"
              required
              min={1000}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            />
            <div className="select-wrap">
              <select
                className="select-field"
                required
                id="withdrawSystemSelect"
                value={withdrawSystem}
                onChange={(e) => setWithdrawSystem(e.target.value as 'mtn' | 'airtel')}
              >
                <option value="mtn">MTN Mobile Money (Uganda)</option>
                <option value="airtel">Airtel Money (Uganda)</option>
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="Wallet / Phone number"
              id="withdrawAccountInput"
              required
              value={withdrawAccount}
              onChange={(e) => setWithdrawAccount(e.target.value)}
            />
            <button type="submit" className="modal-submit-btn">
              Run
            </button>
          </form>
        </div>
      </div>

      {/* 4. DEPOSIT MODAL */}
      <div
        className={`modal-overlay ${activeModal === 'deposit' ? 'active' : ''}`}
        id="depositModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAllModals();
        }}
      >
        <div className="modal-card">
          <div className="auth-header">
            <span>Deposit</span>
            <button className="close-btn" onClick={closeAllModals}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="method-grid">
            <div
              className={`method-box ${depositMethod === 'mtn' ? 'selected' : ''}`}
              id="methodMTN"
              onClick={() => setDepositMethod('mtn')}
            >
              <div className="mtn-badge">
                <span>MTN</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>MTN MoMo</span>
            </div>
            <div
              className={`method-box ${depositMethod === 'airtel' ? 'selected' : ''}`}
              id="methodAirtel"
              onClick={() => setDepositMethod('airtel')}
            >
              <div className="airtel-badge">airtel</div>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Airtel Money</span>
            </div>
          </div>
          <form
            className="form-group"
            onSubmit={(e) => {
              e.preventDefault();
              processDeposit();
            }}
          >
            <div className="phone-wrap">
              <span style={{ fontSize: '14px' }}>🇺🇬 +256</span>
              <input
                type="tel"
                id="depositPhoneInput"
                placeholder="770 123-456"
                required
                value={depositPhone}
                onChange={(e) => setDepositPhone(e.target.value)}
              />
            </div>
            <input
              type="number"
              className="input-field"
              id="depositAmountInput"
              value={depositAmount}
              min={500}
              required
              onChange={(e) => setDepositAmount(Number(e.target.value))}
            />
            <div className="preset-row">
              <div
                className={`preset-chip ${depositAmount === 5000 ? 'active' : ''}`}
                onClick={() => setDepositAmount(5000)}
              >
                5,000
              </div>
              <div
                className={`preset-chip ${depositAmount === 10000 ? 'active' : ''}`}
                onClick={() => setDepositAmount(10000)}
              >
                10,000
              </div>
              <div
                className={`preset-chip ${depositAmount === 50000 ? 'active' : ''}`}
                onClick={() => setDepositAmount(50000)}
              >
                50,000
              </div>
            </div>
            <button type="submit" className="modal-submit-btn" id="depositSubmitBtn">
              Deposit {depositAmount.toLocaleString()} USh
            </button>
          </form>
        </div>
      </div>

      {/* 5. BET SLIP MODAL */}
      {activeModal === 'betSlip' && betSlip && (
        <div
          className="modal-overlay active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
        >
          <div className="modal-card">
            <div className="auth-header">
              <span>Bet Slip</span>
              <button className="close-btn" onClick={closeAllModals}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{betSlip.match.league}</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                {betSlip.match.teams}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                  Pick: {betSlip.selection === '1' ? 'Home Win (1)' : betSlip.selection === '2' ? 'Away Win (2)' : 'Draw (X)'}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                  Odds: {betSlip.odds.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Stake Amount (USh)</label>
              <input
                type="number"
                className="input-field"
                min={500}
                value={betSlip.amount}
                onChange={(e) =>
                  setBetSlip({
                    ...betSlip,
                    amount: Math.max(500, Number(e.target.value) || 0),
                  })
                }
              />
              <div className="preset-row">
                {[1000, 2000, 5000].map((preset) => (
                  <div
                    key={preset}
                    className={`preset-chip ${betSlip.amount === preset ? 'active' : ''}`}
                    onClick={() => setBetSlip({ ...betSlip, amount: preset })}
                  >
                    {preset.toLocaleString()}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#64748b' }}>Potential Return:</span>
                <span style={{ fontWeight: 800, color: '#059669', fontSize: '15px' }}>
                  {(betSlip.amount * betSlip.odds).toLocaleString()} USh
                </span>
              </div>

              <button type="button" className="modal-submit-btn" onClick={confirmPlaceBet}>
                Confirm & Place Bet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. LIVE VIDEO STREAM MODAL */}
      {activeModal === 'video' && currentVideoUrl && (
        <div
          className="modal-overlay active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
        >
          <div className="modal-card" style={{ maxWidth: '480px', padding: '16px' }}>
            <div className="auth-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="live-pulse"></span>
                <span>Live Broadcast</span>
              </span>
              <button className="close-btn" onClick={closeAllModals}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe
                src={currentVideoUrl}
                title="Live Match Broadcast"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
              High-definition sports streaming powered by APLEX Live
            </div>
          </div>
        </div>
      )}

      {/* 7. PLAYABLE CASINO GAME DEMO */}
      {activeModal === 'casinoGame' && selectedGameTitle && (
        <div
          className="modal-overlay active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
        >
          <div className="modal-card" style={{ maxWidth: '420px', background: '#06180f', color: '#fff' }}>
            <div className="auth-header">
              <span style={{ color: '#00e676' }}>{selectedGameTitle}</span>
              <button className="close-btn" style={{ background: '#0f3826', color: '#fff' }} onClick={closeAllModals}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div
              style={{
                height: '200px',
                background: 'linear-gradient(135deg, #093b26 0%, #031c10 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px',
              }}
            >
              <i className="fa-solid fa-gem" style={{ fontSize: '36px', color: '#00e676' }}></i>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>Spin & Win Jackpot</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Demo multiplier session active</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wallet Balance:</span>
              <span style={{ fontWeight: 800, color: '#00e676' }}>{displayBalance}</span>
            </div>

            <button
              type="button"
              className="modal-submit-btn"
              onClick={() => {
                const multiplier = (Math.random() * 4 + 1.2).toFixed(2);
                showToast(`Big Win on ${selectedGameTitle}! Multiplier: x${multiplier}`);
              }}
            >
              Play Spin (Demo)
            </button>
          </div>
        </div>
      )}

      {/* 8. 24/7 SUPPORT CHAT MODAL */}
      {activeModal === 'support' && (
        <div
          className="modal-overlay active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
        >
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <div className="auth-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00d07e' }}></div>
                <span>APLEX Support</span>
              </div>
              <button className="close-btn" onClick={closeAllModals}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div
              style={{
                height: '240px',
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '12px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {supportMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? '#00d07e' : '#fff',
                    color: msg.sender === 'user' ? '#fff' : '#0f172a',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '85%',
                    fontSize: '13px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={{ fontSize: '9px', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type your question..."
                style={{ height: '42px' }}
                value={newSupportMsg}
                onChange={(e) => setNewSupportMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSupportMsg()}
              />
              <button
                type="button"
                onClick={handleSendSupportMsg}
                style={{
                  background: '#00d07e',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '0 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <div
          className="modal-overlay active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
        >
          <div className="modal-card">
            <div className="auth-header">
              <span>Settings</span>
              <button className="close-btn" onClick={closeAllModals}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="form-group">
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Account Overview</div>
              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
                <div>Email: {currentUser?.email || 'Guest Player'}</div>
                <div>Currency: {currentUser?.currency || 'UGX'}</div>
                <div>Balance: {displayBalance}</div>
              </div>

              {/* Downloaded App & Update Controls */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '8px' }}>
                Downloaded App & Update Status
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>APLEX App v2.0</div>
                    <div style={{ color: '#64748b' }}>{isInstalled ? 'Running as Installed App' : 'Web & PWA Ready'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerUpdate}
                    style={{
                      background: '#00d07e',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {isCheckingUpdate ? 'Updating...' : 'Update App'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '8px' }}>
                Administration
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminActive(true);
                  closeAllModals();
                }}
                style={{
                  background: '#06180f',
                  color: '#00e676',
                  border: '1px solid #00e676',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-shield-halved"></i> Open Admin Control Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
