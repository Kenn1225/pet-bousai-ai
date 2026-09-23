export type Language = 'ja' | 'en'

const translations: Record<Language, Record<string, string>> = {
  ja: {
    'app.title': 'ペット防災診断',
    'app.description': 'AIがあなたのペットだけの防災レポートを生成します。',
    'auth.title': 'アクセスコードを入力',
    'auth.placeholder': '例：PBA2024-001',
    'auth.submit': 'ログイン →',
    'diagnosis.start': '診断を開始',
    'diagnosis.back': '戻る',
    'diagnosis.next': '次へ →',
    'diagnosis.submit': '診断結果を見る',
    'result.title': '診断結果',
    'result.download': 'PDFをダウンロード',
    'result.retake': 'もう一度診断する',
    'error.generic': 'エラーが発生しました',
    'error.network': 'ネットワークエラーです。接続をご確認ください。',
    'error.timeout': 'リクエストがタイムアウトしました。',
    'success.saved': '保存されました。',
    'success.submitted': '送信されました。',
    'loading.text': '読み込み中…',
  },
  en: {
    'app.title': 'Pet Disaster Prevention Diagnosis',
    'app.description': 'AI generates a customized disaster prevention report for your pet.',
    'auth.title': 'Enter Access Code',
    'auth.placeholder': 'e.g.: PBA2024-001',
    'auth.submit': 'Login →',
    'diagnosis.start': 'Start Diagnosis',
    'diagnosis.back': 'Back',
    'diagnosis.next': 'Next →',
    'diagnosis.submit': 'View Results',
    'result.title': 'Diagnosis Results',
    'result.download': 'Download PDF',
    'result.retake': 'Retake Diagnosis',
    'error.generic': 'An error occurred.',
    'error.network': 'Network error. Please check your connection.',
    'error.timeout': 'Request timeout.',
    'success.saved': 'Saved.',
    'success.submitted': 'Submitted.',
    'loading.text': 'Loading…',
  },
}

export class i18n {
  private currentLanguage: Language = 'ja'

  constructor(initialLanguage: Language = 'ja') {
    this.currentLanguage = initialLanguage
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language)
      document.documentElement.lang = language
    }
  }

  getLanguage(): Language {
    return this.currentLanguage
  }

  t(key: string, params?: Record<string, string>): string {
    let text = translations[this.currentLanguage]?.[key] || key

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, value)
      })
    }

    return text
  }

  has(key: string): boolean {
    return key in (translations[this.currentLanguage] || {})
  }

  loadLanguage(lang: Language): void {
    this.setLanguage(lang)
  }
}

export const i18nInstance = new i18n('ja')
