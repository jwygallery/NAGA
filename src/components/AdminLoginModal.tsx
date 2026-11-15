import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

const FALLBACK_ADMIN_PW_SHA256 =
  '39743ffcfb179ceba590b68fff1a7c65a9db72b3a5ad63ee01a66c6896a07311';

// Pure-JS SHA-256 fallback for non-HTTPS local preview contexts where crypto.subtle may be unavailable
function sha256HexSync(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + k[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      hh = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + hh) | 0;
  }

  return Array.from(h)
    .map((val) => (val >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

async function verifyOfflineCredentials(username: string, password: string): Promise<boolean> {
  if (username.trim() !== 'admin') return false;
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoded = new TextEncoder().encode(password);
      const digest = await window.crypto.subtle.digest('SHA-256', encoded);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return hex === FALLBACK_ADMIN_PW_SHA256;
    }
  } catch {}
  return sha256HexSync(password) === FALLBACK_ADMIN_PW_SHA256;
}

export function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setUsername('');
    setPassword('');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Try server verification when running with backend
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};
      if (res.ok && data.success) {
        onLoginSuccess(data.token || 'naga-admin-token');
        onClose();
        return;
      }

      // 2. Client SHA-256 fallback for static hosting (github.io)
      if (await verifyOfflineCredentials(username, password)) {
        onLoginSuccess('naga-admin-token-client');
        onClose();
        return;
      }

      setError(data.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
    } catch {
      if (await verifyOfflineCredentials(username, password)) {
        onLoginSuccess('naga-admin-token-offline');
        onClose();
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="border border-white/40 bg-black max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 bg-white/5">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-white" />
            <span className="text-xs font-mono tracking-[0.2em] text-white uppercase font-bold">
              ADMIN AUTHENTICATION
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-white/20 hover:border-white flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 font-mono">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase block">
              SECURE ACCESS PORTAL
            </span>
            <h3 className="text-lg font-syne font-bold uppercase tracking-tight text-white">
              NAGA™ SYSTEM LOGIN
            </h3>
            <p className="text-xs text-white/60 tracking-[0.04em] leading-relaxed font-sans">
              관리자 계정으로 로그인하여 액티비티, 메인 배너 슬라이드, 리커버리 포스트 및 모집 세션을 관리할 수 있습니다.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-white/10 border border-white text-xs text-white">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-white/70 mb-1.5">
                ADMIN ID (아이디)
              </label>
              <input
                ref={inputRef}
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full bg-black border border-white/30 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-white/70 mb-1.5">
                PASSWORD (비밀번호)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-black border border-white/30 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-white min-h-[44px]"
            >
              {isLoading ? (
                <span>VERIFYING...</span>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>LOGIN TO CONSOLE</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 border border-white/20 text-white/60 hover:text-white hover:border-white text-xs tracking-[0.15em] uppercase transition-colors min-h-[42px]"
            >
              CANCEL (취소)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
