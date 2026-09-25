type LanguagesData = {
    [lang: string]: {
        [key: string]: string;
    };
};

class Localization {
    private _language: string = 'en';
    private _languagesData!: LanguagesData; 

    public setLocalizationLanguage(): void {
        let lang = Intl.DateTimeFormat().resolvedOptions().locale.slice(0,2).toUpperCase();
        if (!/^[A-Z]{2}$/.test(lang)) {
            lang = "en";
        }
        if (lang != 'en' && lang != 'ja' && lang != 'ko') {
            lang = 'en';
        }
        console.log(`Detected language: ${lang}`);
        this.setLanguage(lang);
    }

    public setLanguageData(data: LanguagesData): void {
        this._languagesData = data;
    }

    public setLanguage(language: string): void {
        if (!(language in this._languagesData)) {
            console.warn(`Language "${language}" is not available.`);
            return;
        }
        this._language = language;
    }

    public getLanguage(): string {
        return this._language;
    }

    public get(key: string, language?:string): string {
        language = language || this._language;
        const languageData = this._languagesData[language];
        if (languageData && key in languageData) {
            return languageData[key];
        } else {
            console.warn(`Translation for key "${key}" not found in language "${language}".`);
            return key;
        }
    }
}

export default new Localization();
