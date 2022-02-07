import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEn from '../Translation/TranslationEn.json';
import translationFr from '../Translation/TranslationFr.json';

const resource = {
    en: {
        translation: translationEn,
    },
    fr: {
        translation: translationFr,
    },
};

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        detection: {order: ["navigator", "path"]},
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        /*resources: {
            en: {
                translation: {
                    description: {
                        part1: 'Edit <1>src/App.js</1> and save to reload.',
                        part2: 'Learn React'
                    }
                }
            },
            fr: {
                translation: {
                    description: {
                        part1: 'Modifier et enregistrer pour rafraîchir.',
                        part2: 'Apprendre React'
                    }
                }
            }
        }
    }*/
        resources: resource,
        supportedLngs: ['en', 'fr']
    });

export default i18n;