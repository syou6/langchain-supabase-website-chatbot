import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/utils/supabase-auth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // ターゲット要素のIDまたはセレクタ
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'ようこそ！',
    description: 'SiteGPT.jpへようこそ！このガイドで基本的な使い方を説明します。',
    position: 'bottom',
  },
  {
    id: 'create-site',
    title: 'サイトを登録',
    description: '「+ 新規サイト登録」ボタンをクリックして、学習させたいWebサイトを登録します。',
    target: 'onboarding-create-site-btn',
    position: 'bottom',
  },
  {
    id: 'start-training',
    title: '学習を開始',
    description: 'サイトを登録したら、「学習開始」ボタンをクリックして、サイトの内容を学習させます。',
    target: 'onboarding-start-training-btn',
    position: 'top',
  },
  {
    id: 'chat',
    title: 'チャット開始',
    description: '学習が完了したら、「チャット開始」ボタンから、サイトについて質問できるようになります。',
    target: 'onboarding-chat-btn',
    position: 'top',
  },
];

export default function Onboarding({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  const supabase = createSupabaseClient();

  useEffect(() => {
    // オンボーディング完了済みかチェック
    const checkOnboardingStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const completed = localStorage.getItem(`onboarding_completed_${session.user.id}`);
      if (completed === 'true') {
        onComplete();
        return;
      }

      // 少し遅延してから表示（UIが読み込まれるのを待つ）
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    };

    checkOnboardingStatus();
  }, [supabase, onComplete]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      localStorage.setItem(`onboarding_completed_${session.user.id}`, 'true');
    }

    setIsVisible(false);
    onComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];

  useEffect(() => {
    if (!step.target) {
      setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const targetElement = document.getElementById(step.target) || document.querySelector(step.target);
    if (!targetElement) {
      setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let newTop = '50%';
      let newLeft = '50%';
      let newTransform = 'translate(-50%, -50%)';

      switch (step.position) {
        case 'top':
          newTop = `${rect.top + scrollY - 10}px`;
          newLeft = `${rect.left + scrollX + rect.width / 2}px`;
          newTransform = 'translate(-50%, -100%)';
          break;
        case 'bottom':
          newTop = `${rect.bottom + scrollY + 10}px`;
          newLeft = `${rect.left + scrollX + rect.width / 2}px`;
          newTransform = 'translate(-50%, 0)';
          break;
        case 'left':
          newTop = `${rect.top + scrollY + rect.height / 2}px`;
          newLeft = `${rect.left + scrollX - 10}px`;
          newTransform = 'translate(-100%, -50%)';
          break;
        case 'right':
          newTop = `${rect.top + scrollY + rect.height / 2}px`;
          newLeft = `${rect.right + scrollX + 10}px`;
          newTransform = 'translate(0, -50%)';
          break;
      }

      setPosition({ top: newTop, left: newLeft, transform: newTransform });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [step.target, step.position, currentStep]);

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleSkip}
      />

      {/* ツールチップ */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl p-4 md:p-6 max-w-sm w-11/12"
        style={{
          top: position.top,
          left: position.left,
          transform: position.transform,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ステップインジケーター */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : index < currentStep
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            aria-label="スキップ"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <h3 className="text-lg md:text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-sm md:text-base text-gray-600 mb-4">{step.description}</p>

        {/* 矢印（ターゲット要素がある場合） */}
        {step.target && step.position && (
          <div
            className={`absolute w-0 h-0 border-8 ${
              step.position === 'top'
                ? 'border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent bottom-full left-1/2 -translate-x-1/2'
                : step.position === 'bottom'
                ? 'border-b-blue-600 border-r-transparent border-t-transparent border-l-transparent top-full left-1/2 -translate-x-1/2'
                : step.position === 'left'
                ? 'border-l-blue-600 border-t-transparent border-r-transparent border-b-transparent right-full top-1/2 -translate-y-1/2'
                : 'border-r-blue-600 border-t-transparent border-l-transparent border-b-transparent left-full top-1/2 -translate-y-1/2'
            }`}
          />
        )}

        {/* ボタン */}
        <div className="flex gap-2 justify-end">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              戻る
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? '完了' : '次へ'}
          </button>
        </div>
      </div>
    </>
  );
}

