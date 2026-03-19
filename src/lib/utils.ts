import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind 클래스 병합 헬퍼 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 날짜를 YYYY-MM-DD 형식으로 변환 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/** 날짜를 한국어 형식으로 표시 (M월 D일) */
export function formatDateKo(date: Date | string): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 시간을 HH:MM 형식으로 변환 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** D-day 계산 (양수: 남은 일, 음수: 지남) */
export function calcDday(targetDate: Date | string): number {
  const target = new Date(targetDate);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** 금액 포맷 (1,000원) */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/** 전화번호 포맷 (010-1234-5678) */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/** 퍼센트 계산 */
export function calcPercent(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}
