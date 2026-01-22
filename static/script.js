class WelshPracticeApp {
    constructor() {
        this.currentWord = null;
        this.welshFirst = false;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('nextBtn').addEventListener('click', () => this.getNextWord());
        document.getElementById('revealBtn').addEventListener('click', () => this.revealTranslation());
        document.getElementById('languageToggle').addEventListener('change', (e) => {
            this.welshFirst = e.target.checked;
            this.updateDisplay();
        });
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSession());
    }

    async getNextWord() {
        try {
            const response = await fetch('/api/word');
            if (!response.ok) {
                throw new Error('Failed to fetch word');
            }
            
            this.currentWord = await response.json();
            this.updateDisplay();
            this.updateProgress();
            
            // Enable reveal button and hide translation
            document.getElementById('revealBtn').disabled = false;
            document.getElementById('translation').classList.add('hidden');
            
        } catch (error) {
            console.error('Error fetching word:', error);
            document.getElementById('primaryWord').textContent = 'Error loading word';
        }
    }

    updateDisplay() {
        if (!this.currentWord) return;
        
        const primaryWord = document.getElementById('primaryWord');
        const translation = document.getElementById('translation');
        
        if (this.welshFirst) {
            primaryWord.textContent = this.currentWord.welsh;
            translation.textContent = this.currentWord.english;
        } else {
            primaryWord.textContent = this.currentWord.english;
            translation.textContent = this.currentWord.welsh;
        }
    }

    revealTranslation() {
        const translation = document.getElementById('translation');
        translation.classList.remove('hidden');
        document.getElementById('revealBtn').disabled = true;
    }

    updateProgress() {
        const progressText = document.getElementById('progressText');
        if (this.currentWord && this.currentWord.remaining !== undefined) {
            progressText.textContent = `${this.currentWord.remaining} words remaining in session`;
        }
    }

    async resetSession() {
        try {
            await fetch('/api/reset-session', { method: 'POST' });
            document.getElementById('primaryWord').textContent = 'Session reset! Click "Next" to start.';
            document.getElementById('translation').classList.add('hidden');
            document.getElementById('revealBtn').disabled = true;
            document.getElementById('progressText').textContent = 'Ready to start';
            this.currentWord = null;
        } catch (error) {
            console.error('Error resetting session:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WelshPracticeApp();
});
