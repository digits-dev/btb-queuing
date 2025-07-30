// useSpeechHelper.js
import { useEffect, useRef, useCallback } from "react";

const femaleVoiceNames = [
    "Samantha",
    "Karen",
    "Victoria",
    "Susan",
    "Allison",
    "Google UK English Female",
    "Microsoft Zira Desktop",
    "Microsoft Hazel Desktop",
    "Fiona",
    "Moira",
];

const getVoices = () => {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            const handler = () => {
                resolve(speechSynthesis.getVoices());
                speechSynthesis.removeEventListener("voiceschanged", handler);
            };
            speechSynthesis.addEventListener("voiceschanged", handler);
        }
    });
};

export const useSpeechHelper = () => {
    const voicesRef = useRef([]);

    useEffect(() => {
        getVoices().then((voices) => {
            voicesRef.current = voices;
        });
    }, []);

    const getFemaleVoice = useCallback(() => {
        const voices = voicesRef.current;

        for (const name of femaleVoiceNames) {
            const voice = voices.find((v) =>
                v.name.toLowerCase().includes(name.toLowerCase())
            );
            if (voice) return voice;
        }

        return (
            voices.find(
                (v) =>
                    v.name.toLowerCase().includes("female") ||
                    (v.gender && v.gender.toLowerCase() === "female")
            ) ||
            voices[0] ||
            null
        );
    }, []);

    const speak = useCallback(
        (text, options = {}) => {
            if (!text || voicesRef.current.length === 0) return;

            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.volume = options.volume ?? 1;
            utterance.rate = options.rate ?? 0.9;
            utterance.pitch = options.pitch ?? 1.4;
            utterance.voice = options.voice ?? getFemaleVoice();

            speechSynthesis.speak(utterance);
        },
        [getFemaleVoice]
    );

    return { speak, getFemaleVoice };
};
